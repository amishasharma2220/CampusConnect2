from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import RegisterRequest, LoginRequest, TokenResponse, RefreshRequest
from app.services import auth as auth_service
from app.core.security import decode_token
from app.models.profile import Profile

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = auth_service.create_user(db, data)
    return auth_service.create_tokens(db, user)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, data)
    return auth_service.create_tokens(db, user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)):
    return auth_service.refresh_access_token(db, data.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    auth_service.logout_user(db, data.refresh_token)


@router.get("/me")
def get_me(
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated.")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token.")
    user = auth_service.get_user_by_id(db, payload["sub"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
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
