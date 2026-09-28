"""
Small in-memory rate limiter for the auth endpoints.

Fixed-window counters per key (e.g. "login-ip:1.2.3.4" or
"login-email:x@muj.manipal.edu"). In-memory is fine for a single Render
instance; with several instances you'd move this to Redis.
"""

import threading
import time

from fastapi import HTTPException, Request

from app.core.config import settings


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[str, tuple[float, int]] = {}
        self._lock = threading.Lock()

    def hit(self, key: str, limit: int, window_seconds: int) -> None:
        """Count one request for `key`; raise 429 once `limit` is exceeded in the window."""
        if not settings.RATE_LIMIT_ENABLED:
            return
        now = time.monotonic()
        with self._lock:
            start, count = self._hits.get(key, (now, 0))
            if now - start >= window_seconds:
                start, count = now, 0
            count += 1
            self._hits[key] = (start, count)
            if len(self._hits) > 10_000:  # drop expired windows so memory stays bounded
                self._hits = {k: v for k, v in self._hits.items() if now - v[0] < 3600}
        if count > limit:
            retry_after = max(1, int(window_seconds - (now - start)))
            raise HTTPException(
                status_code=429,
                detail="Too many attempts. Please wait a bit and try again.",
                headers={"Retry-After": str(retry_after)},
            )

    def reset(self) -> None:
        with self._lock:
            self._hits.clear()


limiter = RateLimiter()


def client_ip(request: Request) -> str:
    """Best-effort real client IP behind Render/Cloudflare proxies."""
    for header in ("cf-connecting-ip", "true-client-ip"):
        if value := request.headers.get(header):
            return value.strip()
    if forwarded := request.headers.get("x-forwarded-for"):
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"
