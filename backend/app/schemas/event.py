from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.event import ApprovalStatus, EventCategory, EventStatus, WinnerPosition


class EventWinnerOut(BaseModel):
    position: WinnerPosition
    name: str
    reg_no: str
    team_name: str | None = None

    class Config:
        from_attributes = True


class EventOut(BaseModel):
    id: UUID
    slug: str
    title: str
    tagline: str | None
    description: str | None
    banner_url: str | None
    display_date: str | None
    event_date: datetime | None
    end_date: datetime | None
    time: str | None
    venue: str | None
    category: EventCategory
    organizer_name: str | None
    organizer_club: str | None
    max_capacity: int
    is_paid: bool
    ticket_price: float | None
    color: str | None
    status: EventStatus
    approval_status: ApprovalStatus
    certificate_uploaded: bool
    created_at: datetime
    registration_count: int | None = 0
    is_registered: bool | None = False

    class Config:
        from_attributes = True


class EventCreateRequest(BaseModel):
    title: str
    tagline: str | None = None
    description: str | None = None
    banner_url: str | None = None
    display_date: str | None = None
    event_date: datetime | None = None
    end_date: datetime | None = None
    time: str | None = None
    venue: str | None = None
    category: EventCategory = EventCategory.Tech
    organizer_name: str | None = None
    organizer_club: str | None = None
    max_capacity: int = 500
    is_paid: bool = False
    ticket_price: float | None = None
    registration_deadline: datetime | None = None
    color: str | None = "from-primary to-accent"
    club_id: UUID | None = None


class EventUpdateRequest(BaseModel):
    title: str | None = None
    tagline: str | None = None
    description: str | None = None
    banner_url: str | None = None
    display_date: str | None = None
    event_date: datetime | None = None
    venue: str | None = None
    max_capacity: int | None = None
    status: EventStatus | None = None


class EventRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    year_of_study: str | None = None
    branch: str | None = None


class ProposalActionRequest(BaseModel):
    status: ApprovalStatus
    admin_notes: str | None = None
