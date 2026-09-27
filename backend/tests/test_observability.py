"""Tests for Phase 6: request IDs, access logs, JSON logs, 500 handling, health checks."""

import json
import logging

import pytest
from sqlalchemy.exc import OperationalError

from app.core import sentry as sentry_module
from app.core.config import settings
from app.core.logging import JsonFormatter, RequestIdFilter, request_id_var
from app.db.session import get_db
from app.main import app as fastapi_app


def test_request_id_is_generated_and_returned(client):
    response = client.get("/")
    request_id = response.headers.get("X-Request-ID")
    assert request_id and len(request_id) == 32


def test_valid_incoming_request_id_is_reused(client):
    response = client.get("/", headers={"X-Request-ID": "trace-abc_123.x"})
    assert response.headers["X-Request-ID"] == "trace-abc_123.x"


def test_invalid_incoming_request_id_is_replaced(client):
    response = client.get("/", headers={"X-Request-ID": "bad id with spaces <script>"})
    assert response.headers["X-Request-ID"] != "bad id with spaces <script>"
    assert len(response.headers["X-Request-ID"]) == 32


def test_access_log_line_has_request_details(client, caplog):
    with caplog.at_level(logging.INFO, logger="app.request"):
        response = client.get("/api/v1/auth/me")
    record = next(r for r in caplog.records if r.name == "app.request")
    assert (record.method, record.path, record.status) == ("GET", "/api/v1/auth/me", 401)
    assert record.duration_ms >= 0
    assert record.request_id == response.headers["X-Request-ID"]


def test_health_checks_are_not_logged_at_info(client, caplog):
    with caplog.at_level(logging.INFO, logger="app.request"):
        client.get("/health")
    assert not [r for r in caplog.records if r.name == "app.request"]


def test_json_formatter_includes_request_id_and_extras():
    token = request_id_var.set("req-42")
    try:
        record = logging.LogRecord("app.test", logging.INFO, __file__, 1, "hello %s", ("world",), None)
        record.status = 200
        RequestIdFilter().filter(record)
        line = json.loads(JsonFormatter().format(record))
    finally:
        request_id_var.reset(token)
    assert line["msg"] == "hello world"
    assert line["request_id"] == "req-42"
    assert line["status"] == 200
    assert line["level"] == "INFO"
    assert line["ts"].endswith("Z")


@pytest.fixture()
def crashing_route():
    def boom():
        raise RuntimeError("simulated bug")

    fastapi_app.add_api_route("/__test_boom", boom)
    yield "/__test_boom"
    fastapi_app.router.routes = [r for r in fastapi_app.router.routes if getattr(r, "path", None) != "/__test_boom"]


def test_unhandled_error_returns_json_500_with_request_id(client, crashing_route, caplog):
    with caplog.at_level(logging.ERROR, logger="app.request"):
        response = client.get(crashing_route)
    assert response.status_code == 500
    body = response.json()
    assert body["detail"] == "Internal server error."
    assert body["request_id"] == response.headers["X-Request-ID"]
    assert "simulated bug" not in response.text  # no internals leaked to the client
    error = next(r for r in caplog.records if r.levelno == logging.ERROR)
    assert error.exc_info is not None  # traceback logged (and sent to Sentry when enabled)


def test_health_liveness(client):
    assert client.get("/health").json() == {"status": "ok"}


def test_health_ready_checks_database(client):
    response = client.get("/health/ready")
    assert response.status_code == 200
    assert response.json()["database"] == "ok"


def test_health_ready_returns_503_when_database_is_down(client):
    class BrokenSession:
        def execute(self, *args, **kwargs):
            raise OperationalError("SELECT 1", {}, Exception("connection refused"))

    fastapi_app.dependency_overrides[get_db] = lambda: BrokenSession()
    response = client.get("/health/ready")
    assert response.status_code == 503
    assert response.json()["database"] == "unreachable"


def test_sentry_disabled_without_dsn(monkeypatch):
    monkeypatch.setattr(settings, "SENTRY_DSN", "")
    assert sentry_module.init_sentry() is False
