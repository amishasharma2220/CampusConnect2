import uuid
from sqlalchemy import Column, Integer, DateTime, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class PointReason(str, enum.Enum):
    attended_event   = "attended_event"
    won_first        = "won_first"
    won_second       = "won_second"
    won_third        = "won_third"
    organized_event  = "organized_event"
    club_activity    = "club_activity"


class LeaderboardPoints(Base):
    __tablename__ = "leaderboard_points"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), nullable=False, index=True)
    event_id   = Column(UUID(as_uuid=True), nullable=True)
    points     = Column(Integer, nullable=False, default=0)
    reason     = Column(PgEnum(PointReason, name="point_reason"), nullable=False)
    awarded_by = Column(UUID(as_uuid=True), nullable=True)
    awarded_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)