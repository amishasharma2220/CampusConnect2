
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.rate_limit import client_ip, limiter
from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.profile import Profile
from app.schemas.user import (
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    limiter.hit(f"register-ip:{client_ip(request)}", limit=5, window_seconds=600)
    user = auth_service.create_user(db, data)
    return auth_service.create_tokens(db, user)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    # Per-IP stops one machine hammering many accounts; per-email stops
    # password guessing on one account from many machines.
    limiter.hit(f"login-ip:{client_ip(request)}", limit=20, window_seconds=60)
    limiter.hit(f"login-email:{data.email.lower()}", limit=10, window_seconds=900)
    user = auth_service.authenticate_user(db, data)
    return auth_service.create_tokens(db, user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    limiter.hit(f"refresh-ip:{client_ip(request)}", limit=30, window_seconds=60)
    return auth_service.refresh_access_token(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    auth_service.logout_user(db, data.refresh_token)


@router.get("/me")
def get_me(
    db: Session = Depends(get_db),
    authorization: str | None = Header(None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token.")
    user = auth_service.get_user_by_id(db, payload["sub"])
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Invalid token.")
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    return {
        "id": str(user.id),
        "email": user.email,
        "role": user.role.value,
        "is_verified": user.is_verified,
        "full_name": profile.full_name if profile else "",
        "registration_number": profile.registration_number if profile else None,
        "branch": profile.branch if profile else None,
        "year_of_study": profile.year_of_study if profile else None,
        "avatar_url": profile.avatar_url if profile else None,
    }
