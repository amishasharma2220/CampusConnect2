from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.club import ClubCategory, MemberRole


class ClubOut(BaseModel):
    id: UUID
    slug: str
    name: str
    short_name: str | None
    faculty: str
    department: str
    category: ClubCategory
    description: str | None
    long_description: str | None
    logo_url: str | None
    banner_url: str | None
    members_count: int
    fee: int
    faculty_advisor: str | None
    faculty_email: str | None
    founded_year: int | None
    instagram_url: str | None
    linkedin_url: str | None
    email: str | None
    is_active: bool

    class Config:
        from_attributes = True


class ClubMemberOut(BaseModel):
    id: UUID
    user_id: UUID
    club_id: UUID
    role: MemberRole
    department: str | None
    year: str | None
    joined_at: datetime
    full_name: str | None = None
    avatar_url: str | None = None

    class Config:
        from_attributes = True


class ClubUpdateRequest(BaseModel):
    description: str | None = None
    long_description: str | None = None
    logo_url: str | None = None
    banner_url: str | None = None
    faculty_advisor: str | None