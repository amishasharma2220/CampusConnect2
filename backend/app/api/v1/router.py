from fastapi import APIRouter

from app.api.v1.routes import admin, auth, club_admin, club_admin_requests, clubs, events, payments

router = APIRouter(prefix="/api/v1")
router.include_router(auth.router)
router.include_router(events.router)
router.include_router(clubs.router)
router.include_router(club_admin.router)
router.include_router(admin.router)
router.include_router(payments.router)
router.include_router(club_admin_requests.router)
