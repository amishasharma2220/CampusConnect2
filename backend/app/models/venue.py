import uuid
from sqlalchemy import Column, String, Text, Integer, Float, DateTime, Enum as PgEnum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class VenueType(str, enum.Enum):
    hall         = "hall"
    auditorium   = "auditorium"
    lab          = "lab"
    ground       = "ground"
    seminar_room = "seminar_room"
    open_air     = "open_air"


class Venue(Base):
    __tablename__ = "venues"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name       = Column(Text, nullable=False)
    type       = Column(PgEnum(VenueType, name="venue_type"), nullable=False, default=VenueType.hall)
    capacity   = Column(Integer, nullable=False, default=0)
    location   = Column(Text, nullable=False, default="")
    block      = Column(String, nullable=False, default="")
    floor      = Column(String, nullable=False, default="")
    facilities = Column(ARRAY(String), nullable=False, default=[])
    image_url  = Column(Text, nullable=False, default="")
    directions = Column(Text, nullable=False, default="")
    lat        = Column(Float, nullable=False)
    lng        = Column(Float, nullable=False)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)