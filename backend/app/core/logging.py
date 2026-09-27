"""
Logging setup: one line per event, JSON in production, readable text locally.

Every log record gets the current request's ID (see app/core/middleware.py),
so all lines for one request can be found in the Render logs by searching
for its ID. Example production line:

{"ts": "2026-09-27T09:30:00.123Z", "level": "INFO", "logger": "app.request",
 "msg": "POST /api/v1/auth/login 200", "request_id": "3f2a...", "method": "POST",
 "path": "/api/v1/auth/login", "status": 200, "duration_ms": 41.7}
"""

import json
import logging
import sys
from contextvars import ContextVar
from datetime import UTC, datetime

from app.core.config import settings

request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

# Attributes every LogRecord has; anything else was passed via `extra=`.
_STANDARD_ATTRS = set(vars(logging.LogRecord("", 0, "", 0, "", None, None))) | {"message", "asctime", "request_id", "color_message"}


class RequestIdFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get()
        return True


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "ts": datetime.fromtimestamp(record.created, UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "request_id": getattr(record, "request_id", "-"),
        }
        payload.update({k: v for k, v in vars(record).items() if k not in _STANDARD_ATTRS and not k.startswith("_")})
        if record.exc_info:
            payload["exc_info"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def _use_json() -> bool:
    if settings.LOG_FORMAT:
        return settings.LOG_FORMAT.lower() == "json"
    return settings.ENVIRONMENT.lower() in {"production", "staging"}


def configure_logging() -> None:
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(RequestIdFilter())
    if _use_json():
        handler.setFormatter(JsonFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)-5s [%(request_id)s] %(name)s: %(message)s"))

    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(settings.LOG_LEVEL.upper())

    # Route uvicorn's own logs through the same handler. Its per-request
    # access log is replaced by ours (which includes timing and request ID).
    for name in ("uvicorn", "uvicorn.error"):
        uv = logging.getLogger(name)
        uv.handlers = []
        uv.propagate = True
    logging.getLogger("uvicorn.access").disabled = True
