import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Numeric, Enum as PgEnum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class EventStatus(str, enum.Enum):
    upcoming  = "upcoming"
    completed = "completed"
    cancelled = "cancelled"


class ApprovalStatus(str, enum.Enum):
    pending  = "pending"
    approved = "approved"
    rejected = "rejected"


class EventCategory(str, enum.Enum):
    Tech     = "Tech"
    Cultural = "Cultural"
    Sports   = "Sports"
    Academic = "Academic"


class WinnerPosition(str, enum.Enum):
    first          = "1st"
    second         = "2nd"
    third          = "3rd"
    special_mention = "Special Mention"


class Event(Base):
    __tablename__ = "events"

    id                       = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    club_id                  = Column(UUID(as_uuid=True), nullable=True)
    created_by               = Column(UUID(as_uuid=True), nullable=False)
    slug                     = Column(String, nullable=False, unique=True, index=True)
    title                    = Column(Text, nullable=False)
    tagline                  = Column(Text, nullable=True)
    description              = Column(Text, nullable=True)
    banner_url               = Column(Text, nullable=True)
    display_date             = Column(String, nullable=True)
    event_date               = Column(DateTime(timezone=True), nullable=True)
    end_date                 = Column(DateTime(timezone=True), nullable=True)
    time                     = Column(String, nullable=True)
    venue                    = Column(Text, nullable=True)
    category                 = Column(PgEnum(EventCategory, name="event_category"), nullable=False, default=EventCategory.Tech)
    organizer_name           = Column(String, nullable=True)
    organizer_club           = Column(String, nullable=True)
    max_capacity             = Column(Integer, nullable=False, default=500)
    is_paid                  = Column(Boolean, nullable=False, default=False)
    ticket_price             = Column(Numeric(10, 2), nullable=True)
    registration_deadline    = Column(DateTime(timezone=True), nullable=True)
    color                    = Column(String, nullable=True, default="from-primary to-accent")
    status                   = Column(PgEnum(EventStatus, name="event_status"), nullable=False, default=EventStatus.upcoming)
    approval_status          = Column(PgEnum(ApprovalStatus, name="approval_status"), nullable=False, default=ApprovalStatus.pending)
    certificate_template_url = Column(Text, nullable=True)
    certificate_uploaded     = Column(Boolean, nullable=False, default=False)
    created_at               = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at               = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class EventWinner(Base):
    __tablename__ = "event_winners"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id   = Column(UUID(as_uuid=True), nullable=False, index=True)
    position   = Column(PgEnum(WinnerPosition, name="winner_position"), nullable=False)
    name       = Column(Text, nullable=False)
    reg_no     = Column(String, nullable=False)
    team_name  = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class EventProposal(Base):
    __tablename__ = "event_proposals"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id     = Column(UUID(as_uuid=True), nullable=False, unique=True)
    submitted_by = Column(UUID(as_uuid=True), nullable=False)
    status       = Column(PgEnum(ApprovalStatus, name="approval_status"), nullable=False, default=ApprovalStatus.pending)
    admin_notes  = Column(Text, nullable=True)
    reviewed_by  = Column(UUID(as_uuid=True), nullable=True)
    reviewed_at  = Column(DateTime(timezone=True), nullable=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id      = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id       = Column(UUID(as_uuid=True), nullable=False, index=True)
    full_name     = Column(Text, nullable=False)
    email         = Column(String, nullable=False)
    phone         = Column(String, nullable=True)
    year_of_study = Column(String, nullable=True)
    branch        = Column(String, nullable=True)
    payment_id    = Column(UUID(as_uuid=True), nullable=True)
    registered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Attendance(Base):
    __tablename__ = "attendance"

    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id  = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id   = Column(UUID(as_uuid=True), nullable=False, index=True)
    marked_by = Column(UUID(as_uuid=True), nullable=True)
    marked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Certificate(Base):
    __tablename__ = "certificates"

    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id        = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id         = Column(UUID(as_uuid=True), nullable=False, index=True)
    certificate_url = Column(Text, nullable=True)
    issued_at       = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)