from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    # No `role` field: everyone signs up as a student. Admin roles are only
    # granted by a university admin (or the make_admin script). Any "role"
    # sent by a client is ignored.
    email: EmailStr
    # bcrypt only uses the first 72 bytes, so cap the length there.
    password: str = Field(min_length=8, max_length=72)
    full_name: str = Field(min_length=1, max_length=100)
    registration_number: str | None = None
    branch: str | None = None
    year_of_study: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    user_id: str
    full_name: str


class RefreshRequest(BaseModel):
    refresh_token: str


class UserOut(BaseModel):
    id: UUID
    email: str
    role: UserRole
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfileOut(BaseModel):
    id: UUID
    user_id: UUID
    full_name: str
    registration_number: str | None
    branch: str | None
    year_of_study: str | None
    phone: str | None
    avatar_url: str | None
    bio: str | None
    linkedin_url: str | None
    github_url: str | None
    events_attended: int
    certificates_earned: int

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdateRequest(BaseModel):
    full_name: str | None = None
    registration_number: str | None = None
    branch: str | None = None
    year_of_study: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    bio: str | None = None
    linkedin_url: str | None = None
    github_url: str | None = None
