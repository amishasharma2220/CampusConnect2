from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.club import MemberRole

# Positions a student can claim when asking to manage a club.
LEADERSHIP_POSITIONS = [r.value for r in MemberRole if r not in (MemberRole.Member, MemberRole.Executive_Member)]


class ClubAdminRequestCreate(BaseModel):
    club_slug: str
    position: str
    message: str | None = Field(default=None, max_length=1000)


class ClubAdminRequestOut(BaseModel):
    id: UUID
    club_slug: str
    club_name: str
    position: str
    message: str | None
    status: str
    admin_notes: str | None
    created_at: datetime
    reviewed_at: datetime | None


class ClubAdminRequestAdminOut(ClubAdminRequestOut):
    user_id: UUID
    student_name: str
    student_email: str
    registration_number: str | None


class ClubAdminRequestReview(BaseModel):
    status: Literal["approved", "rejected"]
    admin_notes: str | None = Field(default=None, max_length=1000)
