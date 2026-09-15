
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db.session import get_db
from app.models.club import Club, ClubMember
from app.models.profile import Profile
from app.schemas.club import ClubMemberOut, ClubOut, ClubUpdateRequest

router = APIRouter(prefix="/clubs", tags=["Clubs"])


def get_current_user(authorization: str | None, db: Session):
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        return None
    from app.models.user import User
    return db.query(User).filter(User.id == payload["sub"]).first()


def require_user(authorization: str | None, db: Session):
    user = get_current_user(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required.")
    return user


# ── GET /clubs — all active clubs ──────────────────────────────────────────
@router.get("/", response_model=list[ClubOut])
def get_clubs(
    faculty: str | None = None,
    department: str | None = None,
    category: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Club).filter(Club.is_active)
    if faculty:
        query = query.filter(Club.faculty == faculty)
    if department:
        query = query.filter(Club.department == department)
    if category:
        query = query.filter(Club.category == category)
    return query.order_by(Club.name.asc()).all()


# ── GET /clubs/:slug — single club ─────────────────────────────────────────
@router.get("/{slug}", response_model=ClubOut)
def get_club(slug: str, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.slug == slug).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")
    return club


# ── GET /clubs/:slug/members ────────────────────────────────────────────────
@router.get("/{slug}/members", response_model=list[ClubMemberOut])
def get_club_members(slug: str, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.slug == slug).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")

    members = db.query(ClubMember).filter(
        ClubMember.club_id == club.id,
        ClubMember.is_active
    ).all()

    result = []
    for m in members:
        profile = db.query(Profile).filter(Profile.user_id == m.user_id).first()
        out = ClubMemberOut.model_validate(m)
        out.full_name = profile.full_name if profile else ""
        out.avatar_url = profile.avatar_url if profile else None
        result.append(out)
    return result


# ── PATCH /clubs/:slug — update club info (club_admin only) ────────────────
@router.patch("/{slug}", response_model=ClubOut)
def update_club(
    slug: str,
    data: ClubUpdateRequest,
    db: Session = Depends(get_db),
    authorization: str | None = Header(None),
):
    user = require_user(authorization, db)
    club = db.query(Club).filter(Club.slug == slug).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")
    if str(club.admin_user_id) != str(user.id) and user.role.value != "university_admin":
        raise HTTPException(status_code=403, detail="Permission denied.")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(club, field, value)

    db.commit()
    db.refresh(club)
    return club


# ── GET /clubs/:slug/events — events by this club ──────────────────────────
@router.get("/{slug}/events")
def get_club_events(slug: str, db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.slug == slug).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")

    from app.models.event import ApprovalStatus, Event
    events = db.query(Event).filter(
        Event.club_id == club.id,
        Event.approval_status == ApprovalStatus.approved
    ).order_by(Event.event_date.desc()).all()

    return [{
        "id": str(e.id),
        "slug": e.slug,
        "title": e.title,
        "display_date": e.display_date,
        "venue": e.venue,
        "category": e.category.value,
        "status": e.status.value,
        "max_capacity": e.max_capacity,
    } for e in events]
