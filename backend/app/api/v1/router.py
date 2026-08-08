from fastapi import APIRouter
from app.api.v1.routes import auth, events, clubs, club_admin

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(events.router)
router.include_router(clubs.router)
router.include_router(club_admin.router)