import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class UserRole(str, enum.Enum):
    student = "student"
    club_admin = "club_admin"
    university_admin = "university_admin"


class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(String, nullable=False, unique=True, index=True)
    password_hash = Column(Text, nullable=False)
    role          = Column(PgEnum(UserRole, name="user_role"), nullable=False, default=UserRole.student)
    is_verified   = Column(Boolean, nullable=False, default=False)
    is_active     = Column(Boolean, nullable=False, default=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class Session(Base):
    __tablename__ = "sessions"

    id                 = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id            = Column(UUID(as_uuid=True), nullable=False)
    refresh_token_hash = Column(Text, nullable=False, unique=True)
    expires_at         = Column(DateTime(timezone=True), nullable=False)
    created_at         = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), nullable=False)
    token      = Column(Text, nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at    = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class PasswordReset(Base):
    __tablename__ = "password_resets"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), nullable=False)
    token      = Column(Text, nullable=False, unique=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at    = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)