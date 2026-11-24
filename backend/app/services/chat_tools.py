"""
The functions the chat assistant may call ("tools"), and their descriptions
for Gemini.

Rules that keep the assistant safe:
- Every tool is read-only.
- Tools only return what the website already shows: approved events and
  active clubs. Pending or rejected events are never visible.
- `my_registrations` takes no user argument. It always uses the logged-in
  user, so the model can't be talked into reading another student's data.
- No personal data (emails, phone numbers, registration numbers) is sent
  to Gemini.
"""

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.models.club import Club, ClubCategory
from app.models.event import ApprovalStatus, Event, EventCategory, EventRegistration, EventStatus
from app.models.user import User

MAX_RESULTS = 8

# Function declarations in the Gemini (OpenAPI subset) schema format.
DECLARATIONS: list[dict] = [
    {
        "name": "search_events",
        "description": (
            "Search approved campus events at MUJ. Use for questions about what events are on, "
            "events of a type, by a club, at a venue, or on a topic. Returns up to 8 events with "
            "date, venue, seats left and a link."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Words to match in the title, description, club or venue. Omit to list all.",
                },
                "category": {"type": "string", "enum": [c.value for c in EventCategory]},
                "when": {"type": "string", "enum": ["upcoming", "past", "all"], "description": "Default upcoming."},
                "limit": {"type": "integer", "description": "1 to 8. Default 5."},
            },
        },
    },
    {
        "name": "get_event",
        "description": (
            "Full details of one event by its slug (from search_events), including description, "
            "registration deadline and seats left."
        ),
        "parameters": {
            "type": "object",
            "properties": {"slug": {"type": "string"}},
            "required": ["slug"],
        },
    },
    {
        "name": "search_clubs",
        "description": (
            "Search the active clubs and societies at MUJ. Use for questions about which clubs exist, "
            "clubs for an interest, membership fees, or whether a club has an admin on CampusConnect."
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Words to match in the club name, short name, department or description."},
                "category": {"type": "string", "enum": [c.value for c in ClubCategory]},
                "limit": {"type": "integer", "description": "1 to 8. Default 5."},
            },
        },
    },
    {
        "name": "my_registrations",
        "description": (
            "Events the logged-in student has registered for. "
            "Use for 'my events', 'am I registered for X', 'what's next for me'."
        ),
        # No parameters on purpose: it always uses the logged-in user.
    },
]


def _limit(value: Any, default: int = 5) -> int:
    try:
        return max(1, min(MAX_RESULTS, int(value)))
    except (TypeError, ValueError):
        return default


def _clip(text: str | None, length: int) -> str | None:
    if not text:
        return None
    return text if len(text) <= length else text[: length - 1].rstrip() + "…"


def _seat_counts(db: Session, event_ids: list) -> dict:
    if not event_ids:
        return {}
    rows = (
        db.query(EventRegistration.event_id, func.count(EventRegistration.id))
        .filter(EventRegistration.event_id.in_(event_ids))
        .group_by(EventRegistration.event_id)
        .all()
    )
    return dict(rows)


def _event_summary(event: Event, registered_count: int, registered_ids: set) -> dict:
    return {
        "slug": event.slug,
        "title": event.title,
        "tagline": event.tagline,
        "category": event.category.value,
        "date": event.display_date or (event.event_date.date().isoformat() if event.event_date else None),
        "time": event.time,
        "venue": event.venue,
        "organized_by": event.organizer_club,
        "status": event.status.value,
        "seats_left": max(0, event.max_capacity - registered_count),
        "paid_event": bool(event.is_paid),
        "ticket_price_inr": float(event.ticket_price) if event.ticket_price is not None else None,
        "you_are_registered": event.id in registered_ids,
        "link": f"/events/{event.slug}",
    }


def _my_event_ids(db: Session, user: User) -> set:
    return {row[0] for row in db.query(EventRegistration.event_id).filter(EventRegistration.user_id == user.id).all()}


def search_events(db: Session, user: User, query: str | None = None, category: str | None = None,
                  when: str | None = "upcoming", limit: Any = 5) -> dict:
    q = db.query(Event).filter(Event.approval_status == ApprovalStatus.approved)
    now = datetime.now(UTC)
    if when == "past":
        q = q.filter(or_(Event.status == EventStatus.completed, Event.event_date < now))
    elif when != "all":
        q = q.filter(Event.status == EventStatus.upcoming, or_(Event.event_date.is_(None), Event.event_date >= now))
    if category in {c.value for c in EventCategory}:
        q = q.filter(Event.category == EventCategory(category))
    if query and query.strip():
        like = f"%{query.strip()[:100]}%"
        q = q.filter(or_(Event.title.ilike(like), Event.tagline.ilike(like), Event.description.ilike(like),
                         Event.organizer_club.ilike(like), Event.venue.ilike(like)))
    order = Event.event_date.desc() if when == "past" else Event.event_date.asc()
    events = q.order_by(order.nulls_last()).limit(_limit(limit)).all()
    counts = _seat_counts(db, [e.id for e in events])
    mine = _my_event_ids(db, user)
    return {"events": [_event_summary(e, counts.get(e.id, 0), mine) for e in events], "count": len(events)}


def get_event(db: Session, user: User, slug: str | None = None) -> dict:
    event = (
        db.query(Event)
        .filter(Event.slug == (slug or ""), Event.approval_status == ApprovalStatus.approved)
        .first()
    )
    if not event:
        return {"error": "No approved event with that slug."}
    counts = _seat_counts(db, [event.id])
    details = _event_summary(event, counts.get(event.id, 0), _my_event_ids(db, user))
    details["description"] = _clip(event.description, 800)
    details["registration_deadline"] = event.registration_deadline.isoformat() if event.registration_deadline else None
    details["capacity"] = event.max_capacity
    return details


def search_clubs(db: Session, user: User, query: str | None = None, category: str | None = None,
                 limit: Any = 5) -> dict:
    q = db.query(Club).filter(Club.is_active)
    if category in {c.value for c in ClubCategory}:
        q = q.filter(Club.category == ClubCategory(category))
    if query and query.strip():
        like = f"%{query.strip()[:100]}%"
        q = q.filter(or_(Club.name.ilike(like), Club.short_name.ilike(like), Club.department.ilike(like),
                         Club.description.ilike(like)))
    clubs = q.order_by(Club.members_count.desc(), Club.name.asc()).limit(_limit(limit)).all()
    return {
        "clubs": [
            {
                "slug": c.slug,
                "name": c.name,
                "short_name": c.short_name,
                "category": c.category.value,
                "faculty": c.faculty,
                "department": c.department,
                "membership_fee_inr": c.fee,
                "members": c.members_count,
                "description": _clip(c.description, 200),
                "has_admin_on_campusconnect": c.admin_user_id is not None,
                "join_link": f"/join-club?club={c.slug}",
            }
            for c in clubs
        ],
        "count": len(clubs),
    }


def my_registrations(db: Session, user: User) -> dict:
    rows = (
        db.query(Event)
        .join(EventRegistration, EventRegistration.event_id == Event.id)
        .filter(EventRegistration.user_id == user.id)
        .order_by(Event.event_date.asc().nulls_last())
        .all()
    )
    return {
        "registrations": [
            {
                "title": e.title,
                "date": e.display_date or (e.event_date.date().isoformat() if e.event_date else None),
                "time": e.time,
                "venue": e.venue,
                "status": e.status.value,
                "link": f"/events/{e.slug}",
            }
            for e in rows
        ],
        "count": len(rows),
    }


HANDLERS = {
    "search_events": search_events,
    "get_event": get_event,
    "search_clubs": search_clubs,
    "my_registrations": my_registrations,
}


# The only arguments each tool accepts, taken from its declaration. Anything
# else the model sends (for example a user_id) is dropped.
ALLOWED_ARGS = {d["name"]: set(d.get("parameters", {}).get("properties", {})) for d in DECLARATIONS}


def run_tool(db: Session, user: User, name: object, args: object) -> dict:
    """Run one tool call from the model. Bad names or arguments come back as an
    error result for the model to read, never as an exception."""
    if not isinstance(name, str) or name not in HANDLERS:
        return {"error": f"Unknown tool '{name}'."}
    if args is not None and not isinstance(args, dict):
        return {"error": "Arguments must be an object."}
    kwargs = {k: v for k, v in (args or {}).items() if k in ALLOWED_ARGS[name]}
    try:
        return HANDLERS[name](db, user, **kwargs)
    except Exception:  # never let a bad tool call crash the chat
        db.rollback()
        return {"error": "That lookup failed."}
