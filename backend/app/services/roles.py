"""Role changes shared by the admin role endpoint and club-admin request approval."""

from sqlalchemy.orm import Session

from app.models.club import Club
from app.models.user import User, UserRole


def set_role(db: Session, user: User, role: UserRole, club: Club | None = None) -> None:
    """Give `user` a role (student or club_admin); a club admin manages `club`.

    A user manages at most one club, so any club they managed before is
    released. The caller commits.
    """
    for managed in db.query(Club).filter(Club.admin_user_id == user.id).all():
        if club is None or managed.id != club.id:
            managed.admin_user_id = None
    user.role = role
    if club is not None:
        club.admin_user_id = user.id
