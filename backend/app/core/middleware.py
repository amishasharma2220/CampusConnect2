"""
Request context middleware.

For every request it:
- takes the caller's X-Request-ID (if it looks sane) or generates one,
- makes it available to every log line via a context variable,
- returns it in the X-Request-ID response header,
- writes one access-log line with method, path, status and duration,
- turns unhandled exceptions into a JSON 500 that includes the request ID
  (the exception is logged with its traceback, which Sentry also picks up).
"""

import logging
import re
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.core.logging import request_id_var

logger = logging.getLogger("app.request")

REQUEST_ID_HEADER = "X-Request-ID"
_VALID_REQUEST_ID = re.compile(r"^[A-Za-z0-9._-]{1,64}$")
# Health checks run every few seconds/minutes; don't flood the logs with them.
_QUIET_PATHS = {"/health", "/health/ready"}


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        incoming = request.headers.get(REQUEST_ID_HEADER, "")
        request_id = incoming if _VALID_REQUEST_ID.match(incoming) else uuid.uuid4().hex
        token = request_id_var.set(request_id)
        start = time.perf_counter()
        try:
            try:
                response = await call_next(request)
            except Exception:
                logger.exception("Unhandled error on %s %s", request.method, request.url.path)
                response = JSONResponse(
                    status_code=500,
                    content={"detail": "Internal server error.", "request_id": request_id},
                )
            duration_ms = round((time.perf_counter() - start) * 1000, 1)
            response.headers[REQUEST_ID_HEADER] = request_id
            level = logging.DEBUG if request.url.path in _QUIET_PATHS and response.status_code < 400 else logging.INFO
            logger.log(
                level,
                "%s %s %s",
                request.method,
                request.url.path,
                response.status_code,
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "status": response.status_code,
                    "duration_ms": duration_ms,
                },
            )
            return response
        finally:
            request_id_var.reset(token)
