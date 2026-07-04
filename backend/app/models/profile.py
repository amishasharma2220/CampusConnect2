import uuid
from sqlalchemy import Column, String, Text, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id             = Column(UUID(as_uuid=True), nullable=False, unique=True, index=True)
    full_name           = Column(Text, nullable=False, default="")
    registration_number = Column(String, nullable=True, unique=True)
    branch              = Column(String, nullable=True)
    year_of_study       = Column(String, nullable=True)
    phone               = Column(String, nullable=True)
    avatar_url          = Column(Text, nullable=True)
    bio                 = Column(Text, nullable=True)
    linkedin_url        = Column(Text, nullable=True)
    github_url          = Column(Text, nullable=True)
    events_attended     = Column(Integer, nullable=False, default=0)
    certificates_earned = Column(Integer, nullable=False, default=0)
    created_at          = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at          = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)