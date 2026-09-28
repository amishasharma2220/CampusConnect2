import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.health import router as health_router
from app.api.v1.router import router
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.middleware import REQUEST_ID_HEADER, RequestContextMiddleware
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.sentry import init_sentry

configure_logging()
init_sentry()

if settings.is_production and len(settings.JWT_SECRET_KEY) < 32:
    logging.getLogger(__name__).warning("JWT_SECRET_KEY is shorter than 32 characters; use a long random value in production.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(SecurityHeadersMiddleware)
# Only our own frontends may call the API from a browser. Auth uses Bearer
# tokens (not cookies), so credentials mode isn't needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", REQUEST_ID_HEADER],
    expose_headers=[REQUEST_ID_HEADER],
)
# Added last = outermost: wraps CORS too, so every response gets an ID.
app.add_middleware(RequestContextMiddleware)

app.include_router(router)
app.include_router(health_router)


@app.get("/")
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "running", "docs": "/api/docs"}
