from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.event import EventStatus, ApprovalStatus, EventCategory, WinnerPosition


class EventWinnerOut(BaseModel):
    position: WinnerPosition
    name: str
    reg_no: str
    team_name: Optional[str] = None

    class Config:
        from_attributes = True


class EventOut(BaseModel):
    id: UUID
    slug: str
    title: str
    tagline: Optional[str]
    description: Optional[str]
    banner_url: Optional[str]
    display_date: Optional[str]
    event_date: Optional[datetime]
    end_date: Optional[datetime]
    time: Optional[str]
    venue: Optional[str]
    category: EventCategory
    organizer_name: Optional[str]
    organizer_club: Optional[str]
    max_capacity: int
    is_paid: bool
    ticket_price: Optional[float]
    color: Optional[str]
    status: EventStatus
    approval_status: ApprovalStatus
    certificate_uploaded: bool
    created_at: datetime
    registration_count: Optional[int] = 0
    is_registered: Optional[bool] = False

    class Config:
        from_attributes = True


class EventCreateRequest(BaseModel):
    title: str
    tagline: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    display_date: Optional[str] = None
    event_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    time: Optional[str] = None
    venue: Optional[str] = None
    category: EventCategory = EventCategory.Tech
    organizer_name: Optional[str] = None
    organizer_club: Optional[str] = None
    max_capacity: int = 500
    is_paid: bool = False
    ticket_price: Optional[float] = None
    registration_deadline: Optional[datetime] = None
    color: Optional[str] = "from-primary to-accent"
    club_id: Optional[UUID] = None


class EventUpdateRequest(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    display_date: Optional[str] = None
    event_date: Optional[datetime] = None
    venue: Optional[str] = None
    max_capacity: Optional[int] = None
    status: Optional[EventStatus] = None


class EventRegisterRequest(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None
    year_of_study: Optional[str] = None
    branch: Optional[str] = None


class ProposalActionRequest(BaseModel):
    status: ApprovalStatus
    admin_notes: Optional[str] = None