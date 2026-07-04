import uuid
from sqlalchemy import Column, String, Text, Date, Boolean, DateTime, Enum as PgEnum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class LostFoundType(str, enum.Enum):
    lost  = "lost"
    found = "found"


class LostFoundStatus(str, enum.Enum):
    open     = "open"
    resolved = "resolved"


class LostFoundItem(Base):
    __tablename__ = "lost_found_items"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reported_by   = Column(UUID(as_uuid=True), nullable=False)
    type          = Column(PgEnum(LostFoundType, name="lost_found_type"), nullable=False)
    title         = Column(Text, nullable=False)
    description   = Column(Text, nullable=True)
    location      = Column(Text, nullable=True)
    date_occurred = Column(Date, nullable=True)
    images        = Column(ARRAY(String), nullable=False, default=[])
    contact_info  = Column(Text, nullable=True)
    status        = Column(PgEnum(LostFoundStatus, name="lost_found_status"), nullable=False, default=LostFoundStatus.open)
    resolved_at   = Column(DateTime(timezone=True), nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)