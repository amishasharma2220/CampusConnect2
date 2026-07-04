import uuid
from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class NotificationType(str, enum.Enum):
    info    = "info"
    success = "success"
    warning = "warning"
    alert   = "alert"


class Notification(Base):
    __tablename__ = "notifications"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), nullable=False, index=True)
    title      = Column(Text, nullable=False)
    body       = Column(Text, nullable=True)
    type       = Column(PgEnum(NotificationType, name="notification_type"), nullable=False, default=NotificationType.info)
    is_read    = Column(Boolean, nullable=False, default=False)
    action_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)