"""
Health checks.

- GET /health        Liveness: the process is up. No database call, so it's
                     cheap enough for Docker's HEALTHCHECK every 30 seconds.
- GET /health/ready  Readiness: also checks the database. Returns 503 when
                     the database can't be reached. Point Render's health
                     check and your uptime monitor here.

Both accept HEAD as well as GET: uptime monitors such as UptimeRobot send
HEAD requests, and a GET-only route would answer them with 405.
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


@router.api_route("/health", methods=["GET", "HEAD"])
def health():
    return {"status": "ok"}


@router.api_route("/health/ready", methods=["GET", "HEAD"])
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
