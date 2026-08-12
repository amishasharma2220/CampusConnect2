from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from app.db.session import get_db
from app.models.user import User, UserRole
from app.models.club import Club
from app.models.event import Event, EventProposal, EventRegistration, ApprovalStatus, EventStatus
from app.models.profile import Profile
from app.core.security import decode_token

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(authorization: Optional[str], db: Session):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token.")
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or user.role != UserRole.university_admin:
        raise HTTPException(status_code=403, detail="University admin access required.")
    return user


# ── GET /admin/stats ─────────────────────────────────────────────────────────
@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    require_admin(authorization, db)

    total_clubs = db.query(func.count(Club.id)).filter(Club.is_active == True).scalar()
    total_students = db.query(func.count(User.id)).filter(User.role == UserRole.student).scalar()
    total_events = db.query(func.count(Event.id)).scalar()
    pending_proposals = db.query(func.count(EventProposal.id)).filter(EventProposal.status == ApprovalStatus.pending).scalar()
    approved_events = db.query(func.count(Event.id)).filter(Event.approval_status == ApprovalStatus.approved).scalar()
    total_registrations = db.query(func.count(EventRegistration.id)).scalar()

    # Events by category
    by_category = db.query(Event.category, func.count(Event.id)).filter(
        Event.approval_status == ApprovalStatus.approved
    ).group_by(Event.category).all()

    # Clubs by faculty
    by_faculty = db.query(Club.faculty, func.count(Club.id)).filter(
        Club.is_active == True
    ).group_by(Club.faculty).all()

    return {
        "total_clubs": total_clubs,
        "total_students": total_students,
        "total_events": total_events,
        "pending_proposals": pending_proposals,
        "approved_events": approved_events,
        "total_registrations": total_registrations,
        "faculties": 5,
        "departments": 23,
        "events_by_category": [{"category": c.value, "count": n} for c, n in by_category],
        "clubs_by_faculty": [{"faculty": f, "count": n} for f, n in by_faculty],
    }


# ── GET /admin/events ─────────────────────────────────────────────────────────
@router.get("/events")
def get_all_events(
    status: Optional[str] = None,
    category: Optional[str] = None,
    approval: Optional[str] = None,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    require_admin(authorization, db)

    query = db.query(Event)
    if status:
        query = query.filter(Event.status == status)
    if category:
        query = query.filter(Event.category == category)
    if approval:
        query = query.filter(Event.approval_status == approval)

    events = query.order_by(Event.created_at.desc()).all()

    result = []
    for e in events:
        count = db.query(func.count(EventRegistration.id)).filter(
            EventRegistration.event_id == e.id
        ).scalar()
        profile = db.query(Profile).filter(Profile.user_id == e.created_by).first()
        result.append({
            "id": str(e.id),
            "slug": e.slug,
            "title": e.title,
            "display_date": e.display_date,
            "venue": e.venue,
            "category": e.category.value,
            "status": e.status.value,
            "approval_status": e.approval_status.value,
            "max_capacity": e.max_capacity,
            "registration_count": count,
            "organizer_club": e.organizer_club,
            "created_by_name": profile.full_name if profile else "",
            "color": e.color,
        })
    return result


# ── GET /admin/students ───────────────────────────────────────────────────────
@router.get("/students")
def get_all_students(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    require_admin(authorization, db)

    students = db.query(User).filter(User.role == UserRole.student).all()
    result = []
    for s in students:
        profile = db.query(Profile).filter(Profile.user_id == s.id).first()
        reg_count = db.query(func.count(EventRegistration.id)).filter(
            EventRegistration.user_id == s.id
        ).scalar()
        result.append({
            "id": str(s.id),
            "email": s.email,
            "is_verified": s.is_verified,
            "created_at": s.created_at.isoformat(),
            "full_name": profile.full_name if profile else "",
            "registration_number": profile.registration_number if profile else None,
            "branch": profile.branch if profile else None,
            "year_of_study": profile.year_of_study if profile else None,
            "events_registered": reg_count,
        })
    return result


# ── GET /admin/clubs ──────────────────────────────────────────────────────────
@router.get("/clubs")
def get_all_clubs_admin(
    faculty: Optional[str] = None,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    require_admin(authorization, db)

    query = db.query(Club)
    if faculty:
        query = query.filter(Club.faculty == faculty)

    clubs = query.order_by(Club.faculty, Club.name).all()
    return [{
        "id": str(c.id),
        "slug": c.slug,
        "name": c.name,
        "short_name": c.short_name,
        "faculty": c.faculty,
        "department": c.department,
        "category": c.category.value,
        "members_count": c.members_count,
        "is_active": c.is_active,
        "description": c.description,
    } for c in clubs]