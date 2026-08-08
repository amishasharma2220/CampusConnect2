from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
from datetime import date
from pydantic import BaseModel
from app.db.session import get_db
from app.models.club import Club, ClubMember
from app.models.event import Event, EventRegistration, Attendance, Certificate, EventWinner, ApprovalStatus, EventStatus
from app.models.budget import ClubBudget, BudgetType, BudgetCategory
from app.models.profile import Profile
from app.core.security import decode_token

router = APIRouter(prefix="/club-admin", tags=["Club Admin"])


def get_admin_user(authorization: Optional[str], db: Session):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required.")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token.")
    from app.models.user import User
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    if user.role.value not in ["club_admin", "university_admin"]:
        raise HTTPException(status_code=403, detail="Club admin access required.")
    return user


def get_admin_club(user, db: Session) -> Optional[Club]:
    return db.query(Club).filter(Club.admin_user_id == user.id).first()


# ── GET /club-admin/my-club ─────────────────────────────────────────────────
@router.get("/my-club")
def get_my_club(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    club = get_admin_club(user, db)
    if not club:
        return {"club": None, "message": "No club assigned yet."}
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    return {
        "id": str(club.id),
        "slug": club.slug,
        "name": club.name,
        "short_name": club.short_name,
        "description": club.description,
        "faculty": club.faculty,
        "department": club.department,
        "category": club.category.value,
        "members_count": club.members_count,
        "fee": club.fee,
        "faculty_advisor": club.faculty_advisor,
        "founded_year": club.founded_year,
        "logo_url": club.logo_url,
        "admin_name": profile.full_name if profile else "",
        "admin_email": user.email,
        "admin_reg_no": profile.registration_number if profile else "",
    }


# ── GET /club-admin/stats ───────────────────────────────────────────────────
@router.get("/stats")
def get_club_stats(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    club = get_admin_club(user, db)

    # Get all events created by this admin
    events = db.query(Event).filter(Event.created_by == user.id).all()
    event_ids = [e.id for e in events]

    total_registrations = db.query(func.count(EventRegistration.id)).filter(
        EventRegistration.event_id.in_(event_ids)
    ).scalar() if event_ids else 0

    completed = [e for e in events if e.status == EventStatus.completed]
    approved = [e for e in events if e.approval_status == ApprovalStatus.approved]
    pending = [e for e in events if e.approval_status == ApprovalStatus.pending]
    certs_issued = db.query(func.count(Certificate.id)).filter(
        Certificate.event_id.in_(event_ids)
    ).scalar() if event_ids else 0

    members_count = club.members_count if club else 0

    return {
        "total_events": len(events),
        "completed_events": len(completed),
        "approved_events": len(approved),
        "pending_approval": len(pending),
        "total_registrations": total_registrations + members_count,
        "member_registrations": members_count,
        "event_registrations": total_registrations,
        "club_members": members_count,
        "certificates_issued": certs_issued,
        "certificates_pending": len(completed) - certs_issued,
    }


# ── GET /club-admin/events ──────────────────────────────────────────────────
@router.get("/events")
def get_club_events(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    events = db.query(Event).filter(Event.created_by == user.id).order_by(Event.event_date.desc()).all()

    result = []
    for e in events:
        count = db.query(func.count(EventRegistration.id)).filter(
            EventRegistration.event_id == e.id
        ).scalar()
        result.append({
            "id": str(e.id),
            "slug": e.slug,
            "title": e.title,
            "display_date": e.display_date,
            "event_date": e.event_date.isoformat() if e.event_date else None,
            "venue": e.venue,
            "category": e.category.value,
            "status": e.status.value,
            "approval_status": e.approval_status.value,
            "max_capacity": e.max_capacity,
            "registration_count": count,
            "certificate_uploaded": e.certificate_uploaded,
            "color": e.color,
            "banner_url": e.banner_url,
            "description": e.description,
            "organizer_club": e.organizer_club,
        })
    return result


# ── GET /club-admin/completed-events ───────────────────────────────────────
@router.get("/completed-events")
def get_completed_events(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    events = db.query(Event).filter(
        Event.created_by == user.id,
        Event.status == EventStatus.completed
    ).order_by(Event.event_date.desc()).all()

    result = []
    for e in events:
        count = db.query(func.count(EventRegistration.id)).filter(
            EventRegistration.event_id == e.id
        ).scalar()
        winners = db.query(EventWinner).filter(EventWinner.event_id == e.id).all()
        result.append({
            "id": str(e.id),
            "slug": e.slug,
            "title": e.title,
            "display_date": e.display_date,
            "venue": e.venue,
            "description": e.description,
            "banner_url": e.banner_url,
            "registration_count": count,
            "certificate_uploaded": e.certificate_uploaded,
            "winners": [{"position": w.position.value, "name": w.name, "reg_no": w.reg_no, "team_name": w.team_name} for w in winners],
        })
    return result


# ── GET /club-admin/members ─────────────────────────────────────────────────
@router.get("/members")
def get_club_members(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    club = get_admin_club(user, db)
    if not club:
        return []

    members = db.query(ClubMember).filter(
        ClubMember.club_id == club.id,
        ClubMember.is_active == True
    ).all()

    result = []
    for m in members:
        profile = db.query(Profile).filter(Profile.user_id == m.user_id).first()
        from app.models.user import User
        u = db.query(User).filter(User.id == m.user_id).first()
        result.append({
            "id": str(m.id),
            "user_id": str(m.user_id),
            "role": m.role.value,
            "department": m.department,
            "year": m.year,
            "joined_at": m.joined_at.isoformat(),
            "full_name": profile.full_name if profile else "",
            "email": u.email if u else "",
            "registration_number": profile.registration_number if profile else "",
        })
    return result


# ── GET /club-admin/budget ──────────────────────────────────────────────────
@router.get("/budget")
def get_budget(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    club = get_admin_club(user, db)
    if not club:
        return {"entries": [], "total_inflow": 0, "total_outflow": 0, "net_balance": 0}

    entries = db.query(ClubBudget).filter(
        ClubBudget.club_id == club.id
    ).order_by(ClubBudget.date.desc()).all()

    total_inflow = sum(e.amount for e in entries if e.type == BudgetType.inflow)
    total_outflow = sum(e.amount for e in entries if e.type == BudgetType.outflow)

    return {
        "total_inflow": float(total_inflow),
        "total_outflow": float(total_outflow),
        "net_balance": float(total_inflow - total_outflow),
        "entries": [{
            "id": str(e.id),
            "event_name": e.event_name,
            "type": e.type.value,
            "category": e.category.value,
            "amount": float(e.amount),
            "description": e.description,
            "date": e.date.isoformat(),
        } for e in entries],
    }


class BudgetEntryCreate(BaseModel):
    event_name: str
    type: str
    category: str
    amount: float
    description: Optional[str] = None
    date: str


# ── POST /club-admin/budget ─────────────────────────────────────────────────
@router.post("/budget")
def add_budget_entry(
    data: BudgetEntryCreate,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    club = get_admin_club(user, db)
    if not club:
        raise HTTPException(status_code=404, detail="No club assigned.")

    entry = ClubBudget(
        club_id=club.id,
        event_name=data.event_name,
        type=BudgetType(data.type),
        category=BudgetCategory(data.category),
        amount=data.amount,
        description=data.description,
        date=date.fromisoformat(data.date),
        created_by=user.id,
    )
    db.add(entry)
    db.commit()
    return {"message": "Budget entry added.", "id": str(entry.id)}


# ── GET /club-admin/attendance ──────────────────────────────────────────────
@router.get("/attendance")
def get_attendance(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = get_admin_user(authorization, db)
    events = db.query(Event).filter(Event.created_by == user.id).all()

    result = []
    for e in events:
        total_regs = db.query(func.count(EventRegistration.id)).filter(
            EventRegistration.event_id == e.id
        ).scalar()
        attended = db.query(func.count(Attendance.id)).filter(
            Attendance.event_id == e.id
        ).scalar()
        result.append({
            "event_id": str(e.id),
            "event_slug": e.slug,
            "event_title": e.title,
            "display_date": e.display_date,
            "status": e.status.value,
            "total_registered": total_regs,
            "total_attended": attended,
            "attendance_rate": round((attended / total_regs * 100) if total_regs > 0 else 0, 1),
        })
    return result