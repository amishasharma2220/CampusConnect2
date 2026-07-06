from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from uuid import UUID
import re

from app.db.session import get_db
from app.models.event import Event, EventRegistration, EventProposal, EventWinner, ApprovalStatus, EventStatus
from app.models.profile import Profile
from app.schemas.event import EventOut, EventCreateRequest, EventUpdateRequest, EventRegisterRequest, ProposalActionRequest
from app.core.security import decode_token

router = APIRouter(prefix="/events", tags=["Events"])


def get_current_user(authorization: Optional[str], db: Session):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        return None
    from app.models.user import User
    return db.query(User).filter(User.id == payload["sub"]).first()


def require_user(authorization: Optional[str], db: Session):
    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    return user


def require_role(user, *roles):
    if user.role.value not in roles:
        raise HTTPException(status_code=403, detail="Permission denied.")
    return user


def slugify(title: str) -> str:
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug


# ── GET /events — all approved events ──────────────────────────────────────
@router.get("/", response_model=List[EventOut])
def get_events(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    current_user = get_current_user(authorization, db)

    query = db.query(Event).filter(Event.approval_status == ApprovalStatus.approved)
    if category:
        query = query.filter(Event.category == category)
    if status:
        query = query.filter(Event.status == status)

    events = query.order_by(Event.event_date.asc()).all()

    # Get registration counts in one query
    counts = db.query(
        EventRegistration.event_id,
        func.count(EventRegistration.id).label("count")
    ).group_by(EventRegistration.event_id).all()
    count_map = {str(c.event_id): c.count for c in counts}

    # Get user's registrations if logged in
    user_reg_ids = set()
    if current_user:
        user_regs = db.query(EventRegistration.event_id).filter(
            EventRegistration.user_id == current_user.id
        ).all()
        user_reg_ids = {str(r.event_id) for r in user_regs}

    result = []
    for e in events:
        out = EventOut.model_validate(e)
        out.registration_count = count_map.get(str(e.id), 0)
        out.is_registered = str(e.id) in user_reg_ids
        result.append(out)

    return result


# ── GET /events/:slug — single event ───────────────────────────────────────
@router.get("/{slug}", response_model=EventOut)
def get_event(
    slug: str,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    current_user = get_current_user(authorization, db)
    event = db.query(Event).filter(Event.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")

    count = db.query(func.count(EventRegistration.id)).filter(
        EventRegistration.event_id == event.id
    ).scalar()

    is_registered = False
    if current_user:
        reg = db.query(EventRegistration).filter(
            EventRegistration.event_id == event.id,
            EventRegistration.user_id == current_user.id
        ).first()
        is_registered = reg is not None

    out = EventOut.model_validate(event)
    out.registration_count = count
    out.is_registered = is_registered
    return out


# ── POST /events — create event (club_admin only) ──────────────────────────
@router.post("/", response_model=EventOut, status_code=status.HTTP_201_CREATED)
def create_event(
    data: EventCreateRequest,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = require_user(authorization, db)
    require_role(user, "club_admin", "university_admin")

    # Generate unique slug
    base_slug = slugify(data.title)
    slug = base_slug
    counter = 1
    while db.query(Event).filter(Event.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()

    event = Event(
        created_by=user.id,
        club_id=data.club_id,
        slug=slug,
        title=data.title,
        tagline=data.tagline,
        description=data.description,
        banner_url=data.banner_url,
        display_date=data.display_date,
        event_date=data.event_date,
        end_date=data.end_date,
        time=data.time,
        venue=data.venue,
        category=data.category,
        organizer_name=data.organizer_name or (profile.full_name if profile else ""),
        organizer_club=data.organizer_club,
        max_capacity=data.max_capacity,
        is_paid=data.is_paid,
        ticket_price=data.ticket_price,
        registration_deadline=data.registration_deadline,
        color=data.color,
        approval_status=ApprovalStatus.pending,
        status=EventStatus.upcoming,
    )
    db.add(event)
    db.flush()

    # Auto-create proposal for admin review
    proposal = EventProposal(
        event_id=event.id,
        submitted_by=user.id,
        status=ApprovalStatus.pending,
    )
    db.add(proposal)
    db.commit()
    db.refresh(event)

    out = EventOut.model_validate(event)
    out.registration_count = 0
    out.is_registered = False
    return out


# ── POST /events/:slug/register ─────────────────────────────────────────────
@router.post("/{slug}/register", status_code=status.HTTP_201_CREATED)
def register_for_event(
    slug: str,
    data: EventRegisterRequest,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = require_user(authorization, db)
    event = db.query(Event).filter(Event.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if event.approval_status != ApprovalStatus.approved:
        raise HTTPException(status_code=400, detail="Event is not open for registration.")

    # Check capacity
    count = db.query(func.count(EventRegistration.id)).filter(
        EventRegistration.event_id == event.id
    ).scalar()
    if event.max_capacity and count >= event.max_capacity:
        raise HTTPException(status_code=400, detail="Event is at full capacity.")

    # Check duplicate
    existing = db.query(EventRegistration).filter(
        EventRegistration.event_id == event.id,
        EventRegistration.user_id == user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="You are already registered for this event.")

    reg = EventRegistration(
        event_id=event.id,
        user_id=user.id,
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        year_of_study=data.year_of_study,
        branch=data.branch,
    )
    db.add(reg)
    db.commit()
    return {"message": "Registration successful.", "event": event.title}


# ── GET /events/:slug/registrations (club_admin only) ──────────────────────
@router.get("/{slug}/registrations")
def get_registrations(
    slug: str,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = require_user(authorization, db)
    require_role(user, "club_admin", "university_admin")
    event = db.query(Event).filter(Event.slug == slug).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found.")
    if str(event.created_by) != str(user.id) and user.role.value != "university_admin":
        raise HTTPException(status_code=403, detail="Permission denied.")

    regs = db.query(EventRegistration).filter(
        EventRegistration.event_id == event.id
    ).all()
    return [{
        "id": str(r.id),
        "full_name": r.full_name,
        "email": r.email,
        "phone": r.phone,
        "year_of_study": r.year_of_study,
        "branch": r.branch,
        "registered_at": r.registered_at.isoformat(),
    } for r in regs]


# ── GET /events/admin/proposals (university_admin only) ────────────────────
@router.get("/admin/proposals", tags=["Admin"])
def get_proposals(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = require_user(authorization, db)
    require_role(user, "university_admin")

    proposals = db.query(EventProposal).filter(
        EventProposal.status == ApprovalStatus.pending
    ).all()

    result = []
    for p in proposals:
        event = db.query(Event).filter(Event.id == p.event_id).first()
        submitter = db.query(Profile).filter(Profile.user_id == p.submitted_by).first()
        result.append({
            "proposal_id": str(p.id),
            "event_id": str(p.event_id),
            "event_title": event.title if event else "",
            "event_date": event.display_date if event else "",
            "venue": event.venue if event else "",
            "category": event.category.value if event else "",
            "submitted_by": submitter.full_name if submitter else "",
            "submitted_at": p.created_at.isoformat(),
            "status": p.status.value,
        })
    return result


# ── POST /events/admin/proposals/:id/review ────────────────────────────────
@router.post("/admin/proposals/{proposal_id}/review", tags=["Admin"])
def review_proposal(
    proposal_id: UUID,
    data: ProposalActionRequest,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    user = require_user(authorization, db)
    require_role(user, "university_admin")

    proposal = db.query(EventProposal).filter(EventProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=404, detail="Proposal not found.")

    from datetime import datetime
    proposal.status = data.status
    proposal.admin_notes = data.admin_notes
    proposal.reviewed_by = user.id
    proposal.reviewed_at = datetime.utcnow()

    # Update event approval status too
    event = db.query(Event).filter(Event.id == proposal.event_id).first()
    if event:
        event.approval_status = data.status

    db.commit()
    return {"message": f"Proposal {data.status.value}.", "event_id": str(proposal.event_id)}