"""
Health checks.

- GET /health        Liveness: the process is up. No database call, so it's
                     cheap enough for Docker's HEALTHCHECK every 30 seconds.
- GET /health/ready  Readiness: also checks the database. Returns 503 when
                     the database can't be reached. Point Render's health
                     check and your uptime monitor here.
"""

import logging

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db

router = APIRouter(tags=["Health"])
logger = logging.getLogger(__name__)


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/health/ready")
def health_ready(db: Session = Depends(get_db)):
    info = {
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "commit": settings.RENDER_GIT_COMMIT[:7] or None,
    }
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        logger.exception("Readiness check failed: database unreachable")
        return JSONResponse(status_code=503, content={"status": "error", "database": "unreachable", **info})
    return {"status": "ok", "database": "ok", **info}
