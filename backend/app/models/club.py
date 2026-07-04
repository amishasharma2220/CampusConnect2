import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class ClubCategory(str, enum.Enum):
    Technical    = "Technical"
    Cultural     = "Cultural"
    Sports       = "Sports"
    Literary     = "Literary"
    Social       = "Social"
    Professional = "Professional"
    Media        = "Media"
    Wellness     = "Wellness"


class MemberRole(str, enum.Enum):
    President         = "President"
    Vice_President    = "Vice President"
    General_Secretary = "General Secretary"
    Technical_Head    = "Technical Head"
    Creative_Head     = "Creative Head"
    Marketing_Head    = "Marketing Head"
    Content_Head      = "Content Head"
    Event_Coordinator = "Event Coordinator"
    Core_Member       = "Core Member"
    Executive_Member  = "Executive Member"
    Member            = "Member"


class Club(Base):
    __tablename__ = "clubs"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug             = Column(String, nullable=False, unique=True, index=True)
    name             = Column(Text, nullable=False)
    short_name       = Column(String, nullable=True)
    faculty          = Column(String, nullable=False)
    department       = Column(String, nullable=False)
    category         = Column(PgEnum(ClubCategory, name="club_category"), nullable=False)
    description      = Column(Text, nullable=True)
    long_description = Column(Text, nullable=True)
    logo_url         = Column(Text, nullable=True)
    banner_url       = Column(Text, nullable=True)
    members_count    = Column(Integer, nullable=False, default=0)
    fee              = Column(Integer, nullable=False, default=250)
    faculty_advisor  = Column(String, nullable=True)
    faculty_email    = Column(String, nullable=True)
    founded_year     = Column(Integer, nullable=True)
    instagram_url    = Column(Text, nullable=True)
    linkedin_url     = Column(Text, nullable=True)
    email            = Column(String, nullable=True)
    admin_user_id    = Column(UUID(as_uuid=True), nullable=True)
    is_active        = Column(Boolean, nullable=False, default=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at       = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class ClubMember(Base):
    __tablename__ = "club_members"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    club_id    = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id    = Column(UUID(as_uuid=True), nullable=False, index=True)
    role       = Column(PgEnum(MemberRole, name="member_role"), nullable=False, default=MemberRole.Member)
    department = Column(String, nullable=True)
    year       = Column(String, nullable=True)
    is_active  = Column(Boolean, nullable=False, default=True)
    joined_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)