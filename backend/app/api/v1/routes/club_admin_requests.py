"""
Club admin requests.

Students ask to manage a club; a university admin approves or rejects.
Approving makes the student a club admin and links them to the club in one
step (the same logic as PATCH /admin/users/{id}/role).

Rules:
- only students can ask, and only for an active club that has no admin yet
- a student can have one pending request at a time
- approving re-checks those rules, and auto-rejects other pending requests
  for the same club
"""

import logging
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.club import Club
from app.models.club_admin_request import ClubAdminRequest
from app.models.event import ApprovalStatus
from app.models.profile import Profile
from app.models.user import User, UserRole
from app.schemas.club_admin_request import (
    LEADERSHIP_POSITIONS,
    ClubAdminRequestAdminOut,
    ClubAdminRequestCreate,
    ClubAdminRequestOut,
    ClubAdminRequestReview,
)
from app.services.roles import set_role

router = APIRouter(tags=["Club admin requests"])
logger = logging.getLogger(__name__)


def require_university_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.university_admin:
        raise HTTPException(status_code=403, detail="University admin access required.")
    return user


def _out(req: ClubAdminRequest, club: Club) -> dict:
    return {
        "id": req.id,
        "club_slug": club.slug,
        "club_name": club.name,
        "position": req.position,
        "message": req.message,
        "status": req.status.value,
        "admin_notes": req.admin_notes,
        "created_at": req.created_at,
        "reviewed_at": req.reviewed_at,
    }


# ── Student ──────────────────────────────────────────────────────────────────
@router.get("/club-admin-requests/positions", response_model=list[str])
def list_positions():
    return LEADERSHIP_POSITIONS


@router.post("/club-admin-requests", response_model=ClubAdminRequestOut, status_code=status.HTTP_201_CREATED)
def create_request(
    data: ClubAdminRequestCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.role != UserRole.student:
        raise HTTPException(status_code=400, detail="Only students can request club admin access.")
    if data.position not in LEADERSHIP_POSITIONS:
        raise HTTPException(status_code=422, detail="Please choose a valid position.")
    club = db.query(Club).filter(Club.slug == data.club_slug, Club.is_active).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")
    if club.admin_user_id is not None:
        raise HTTPException(status_code=409, detail="This club already has an admin.")
    pending = (
        db.query(ClubAdminRequest)
        .filter(ClubAdminRequest.user_id == user.id, ClubAdminRequest.status == ApprovalStatus.pending)
        .first()
    )
    if pending:
        raise HTTPException(status_code=409, detail="You already have a pending request.")

    req = ClubAdminRequest(
        user_id=user.id,
        club_id=club.id,
        position=data.position,
        message=(data.message or "").strip() or None,
        status=ApprovalStatus.pending,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    logger.info("Club admin requested", extra={"request_id_db": str(req.id), "club": club.slug})
    return _out(req, club)


@router.get("/club-admin-requests/mine", response_model=list[ClubAdminRequestOut])
def my_requests(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(ClubAdminRequest, Club)
        .join(Club, Club.id == ClubAdminRequest.club_id)
        .filter(ClubAdminRequest.user_id == user.id)
        .order_by(ClubAdminRequest.created_at.desc())
        .all()
    )
    return [_out(req, club) for req, club in rows]


# ── University admin ─────────────────────────────────────────────────────────
@router.get("/admin/club-admin-requests", response_model=list[ClubAdminRequestAdminOut])
def list_requests(
    status_filter: ApprovalStatus | None = ApprovalStatus.pending,
    _admin: User = Depends(require_university_admin),
    db: Session = Depends(get_db),
):
    query = (
        db.query(ClubAdminRequest, Club, User, Profile)
        .join(Club, Club.id == ClubAdminRequest.club_id)
        .join(User, User.id == ClubAdminRequest.user_id)
        .outerjoin(Profile, Profile.user_id == User.id)
    )
    if status_filter is not None:
        query = query.filter(ClubAdminRequest.status == status_filter)
    rows = query.order_by(ClubAdminRequest.created_at.asc()).all()
    return [
        {
            **_out(req, club),
            "user_id": user.id,
            "student_name": profile.full_name if profile else "",
            "student_email": user.email,
            "registration_number": profile.registration_number if profile else None,
        }
        for req, club, user, profile in rows
    ]


@router.post("/admin/club-admin-requests/{request_id}/review", response_model=ClubAdminRequestOut)
def review_request(
    request_id: UUID,
    data: ClubAdminRequestReview,
    admin: User = Depends(require_university_admin),
    db: Session = Depends(get_db),
):
    req = db.query(ClubAdminRequest).filter(ClubAdminRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
    if req.status != ApprovalStatus.pending:
        raise HTTPException(status_code=409, detail=f"This request was already {req.status.value}.")
    club = db.query(Club).filter(Club.id == req.club_id).first()
    student = db.query(User).filter(User.id == req.user_id).first()
    if not club or not student:
        raise HTTPException(status_code=404, detail="Club or student no longer exists.")

    now = datetime.now(UTC)
    if data.status == "approved":
        if club.admin_user_id is not None and club.admin_user_id != student.id:
            raise HTTPException(status_code=409, detail="This club already has an admin. Reject this request instead.")
        if not student.is_active or student.role != UserRole.student:
            raise HTTPException(status_code=409, detail="This account is no longer an active student.")
        set_role(db, student, UserRole.club_admin, club)
        req.status = ApprovalStatus.approved
        # Only one admin per club: close the other pending requests for it.
        others = (
            db.query(ClubAdminRequest)
            .filter(
                ClubAdminRequest.club_id == club.id,
                ClubAdminRequest.status == ApprovalStatus.pending,
                ClubAdminRequest.id != req.id,
            )
            .all()
        )
        for other in others:
            other.status = ApprovalStatus.rejected
            other.admin_notes = "Another student was approved as admin of this club."
            other.reviewed_by = admin.id
            other.reviewed_at = now
    else:
        req.status = ApprovalStatus.rejected

    req.admin_notes = (data.admin_notes or "").strip() or req.admin_notes
    req.reviewed_by = admin.id
    req.reviewed_at = now
    db.commit()
    db.refresh(req)
    logger.info("Club admin request reviewed", extra={"club": club.slug, "decision": data.status, "by": str(admin.id)})
    return _out(req, club)
