"""Sentry error tracking. Does nothing unless SENTRY_DSN is set."""

import sentry_sdk

from app.core.config import settings
from app.core.logging import request_id_var


def _tag_request_id(event, hint):
    # Lets you jump from a Sentry error to the matching Render log lines.
    event.setdefault("tags", {})["request_id"] = request_id_var.get()
    return event


def init_sentry() -> bool:
    if not settings.SENTRY_DSN:
        return False
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        release=settings.RENDER_GIT_COMMIT or settings.APP_VERSION,
        traces_sample_rate=settings.SENTRY_TRACES_SAMPLE_RATE,
        send_default_pii=False,  # no emails, IPs, cookies or request bodies
        before_send=_tag_request_id,
    )
    return True
