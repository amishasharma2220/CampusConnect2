import uuid
from sqlalchemy import Column, String, Text, Date, DateTime, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class CalendarType(str, enum.Enum):
    academic = "academic"
    event    = "event"
    holiday  = "holiday"
    exam     = "exam"


class AcademicCalendar(Base):
    __tablename__ = "academic_calendar"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title       = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    date        = Column(Date, nullable=False)
    end_date    = Column(Date, nullable=True)
    type        = Column(PgEnum(CalendarType, name="calendar_type"), nullable=False, default=CalendarType.academic)
    club        = Column(String, nullable=True)
    created_by  = Column(UUID(as_uuid=True), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)