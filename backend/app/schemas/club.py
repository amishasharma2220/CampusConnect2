from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.club import ClubCategory, MemberRole


class ClubOut(BaseModel):
    id: UUID
    slug: str
    name: str
    short_name: Optional[str]
    faculty: str
    department: str
    category: ClubCategory
    description: Optional[str]
    long_description: Optional[str]
    logo_url: Optional[str]
    banner_url: Optional[str]
    members_count: int
    fee: int
    faculty_advisor: Optional[str]
    faculty_email: Optional[str]
    founded_year: Optional[int]
    instagram_url: Optional[str]
    linkedin_url: Optional[str]
    email: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class ClubMemberOut(BaseModel):
    id: UUID
    user_id: UUID
    club_id: UUID
    role: MemberRole
    department: Optional[str]
    year: Optional[str]
    joined_at: datetime
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class ClubUpdateRequest(BaseModel):
    description: Optional[str] = None
    long_description: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    faculty_advisor: Optional[str]