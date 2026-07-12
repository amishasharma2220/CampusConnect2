from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
import hashlib
import secrets

from app.models.user import User, Session as UserSession
from app.models.profile import Profile
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.schemas.user import RegisterRequest, LoginRequest


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, data: RegisterRequest) -> User:
    existing = get_user_by_email(db, data.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists."
        )

    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        role=data.role,
        is_verified=False,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Check if reg number already exists — if so, skip it
    reg_number = data.registration_number or None
    if reg_number:
        existing_profile = db.query(Profile).filter(
            Profile.registration_number == reg_number
        ).first()
        if existing_profile:
            reg_number = None

    profile = Profile(
        user_id=user.id,
        full_name=data.full_name,
        registration_number=reg_number,
        branch=data.branch,
        year_of_study=data.year_of_study,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, data: LoginRequest) -> User:
    user = get_user_by_email(db, data.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled."
        )
    user.last_login_at = datetime.utcnow()
    db.commit()
    return user


def create_tokens(db: Session, user: User) -> dict:
    access_token = create_access_token(subject=str(user.id))
    refresh_token = create_refresh_token(subject=str(user.id))

    # Store hashed refresh token in DB
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    session = UserSession(
        user_id=user.id,
        refresh_token_hash=token_hash,
        expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    db.add(session)
    db.commit()

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    full_name = profile.full_name if profile else ""

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "role": user.role.value,
        "user_id": str(user.id),
        "full_name": full_name,
    }


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token."
        )

    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    session = db.query(UserSession).filter(
        UserSession.refresh_token_hash == token_hash
    ).first()

    if not session or session.expires_at.replace(tzinfo=None) < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again."
        )

    user = get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")

    # Rotate refresh token
    db.delete(session)
    return create_tokens(db, user)


def logout_user(db: Session, refresh_token: str):
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    session = db.query(UserSession).filter(
        UserSession.refresh_token_hash == token_hash
    ).first()
    if session:
        db.delete(session)
        db.commit()