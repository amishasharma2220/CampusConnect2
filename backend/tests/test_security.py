"""Phase 7 security tests: signup rules, token handling, roles, rate limits, CORS, headers."""

import pytest

from app.core.config import settings
from app.core.security import create_refresh_token
from app.models.club import Club, ClubCategory
from app.models.user import User, UserRole
from app.scripts import make_admin

REGISTER = "/api/v1/auth/register"


def _register(client, **overrides):
    payload = {"email": "fresher@muj.manipal.edu", "password": "LongEnough123", "full_name": "A Fresher"}
    payload.update(overrides)
    return client.post(REGISTER, json=payload)


# ── Signup ────────────────────────────────────────────────────────────────────
@pytest.mark.parametrize("requested_role", ["university_admin", "club_admin"])
def test_register_ignores_requested_role(client, db, requested_role):
    response = _register(client, role=requested_role)
    assert response.status_code == 201
    assert response.json()["role"] == "student"
    assert db.query(User).filter(User.email == "fresher@muj.manipal.edu").one().role == UserRole.student


def test_register_requires_university_email(client):
    response = _register(client, email="someone@gmail.com")
    assert response.status_code == 400
    assert "@muj.manipal.edu" in response.json()["detail"]


def test_register_rejects_short_password(client):
    assert _register(client, password="short").status_code == 422


# ── Tokens ────────────────────────────────────────────────────────────────────
def test_refresh_token_cannot_be_used_as_access_token(client, university_admin_user):
    refresh_headers = {"Authorization": f"Bearer {create_refresh_token(university_admin_user.id)}"}
    assert client.get("/api/v1/admin/stats", headers=refresh_headers).status_code == 401
    assert client.get("/api/v1/auth/me", headers=refresh_headers).status_code == 401
    assert client.get("/api/v1/club-admin/my-club", headers=refresh_headers).status_code == 401
    assert client.post("/api/v1/events/", headers=refresh_headers, json={"title": "x"}).status_code == 401


def test_disabled_account_is_locked_out(client, db, university_admin_user, admin_headers):
    university_admin_user.is_active = False
    db.commit()
    assert client.get("/api/v1/admin/stats", headers=admin_headers).status_code == 401
    assert client.get("/api/v1/auth/me", headers=admin_headers).status_code == 401


# ── Role management ───────────────────────────────────────────────────────────
@pytest.fixture()
def club(db):
    c = Club(slug="pytest-sec-club", name="Pytest Security Club", faculty="FoSTA", department="CSE", category=ClubCategory.Technical)
    db.add(c)
    db.commit()
    return c


def _set_role(client, headers, user_id, **body):
    return client.patch(f"/api/v1/admin/users/{user_id}/role", headers=headers, json=body)


def test_university_admin_promotes_student_to_club_admin(client, db, admin_headers, student_user, student_headers, club):
    response = _set_role(client, admin_headers, student_user.id, role="club_admin", club_slug=club.slug)
    assert response.status_code == 200
    assert response.json() == {"id": str(student_user.id), "email": student_user.email, "role": "club_admin", "club_slug": club.slug}
    db.refresh(club)
    assert club.admin_user_id == student_user.id
    # The promoted user can now use the club admin dashboard for that club.
    my_club = client.get("/api/v1/club-admin/my-club", headers=student_headers)
    assert my_club.status_code == 200

    # Demoting releases the club.
    assert _set_role(client, admin_headers, student_user.id, role="student").json()["role"] == "student"
    db.refresh(club)
    assert club.admin_user_id is None


def test_only_university_admins_can_change_roles(client, student_headers, club_admin_headers, student_user):
    assert _set_role(client, student_headers, student_user.id, role="club_admin").status_code == 403
    assert _set_role(client, club_admin_headers, student_user.id, role="club_admin").status_code == 403


def test_university_admin_role_cannot_be_granted_via_api(client, admin_headers, student_user):
    assert _set_role(client, admin_headers, student_user.id, role="university_admin").status_code == 422


def test_cannot_change_own_or_other_university_admins(client, db, admin_headers, university_admin_user, test_password):
    assert _set_role(client, admin_headers, university_admin_user.id, role="student").status_code == 400
    other = User(email="dean2@test.campusconnect-test.dev", password_hash="x", role=UserRole.university_admin, is_active=True)
    db.add(other)
    db.commit()
    assert _set_role(client, admin_headers, other.id, role="student").status_code == 403


def test_make_admin_script(db, student_user, monkeypatch, capsys):
    class _NoCloseSession:  # reuse the test transaction; don't let the script close it
        def __getattr__(self, name):
            return (lambda: None) if name == "close" else getattr(db, name)

    monkeypatch.setattr(make_admin, "SessionLocal", _NoCloseSession)
    assert make_admin.main([student_user.email.upper()]) == 0
    db.refresh(student_user)
    assert student_user.role == UserRole.university_admin
    assert "student -> university_admin" in capsys.readouterr().out
    assert make_admin.main(["nobody@muj.manipal.edu"]) == 1


# ── Rate limiting ─────────────────────────────────────────────────────────────
def test_login_is_rate_limited_per_email(client, student_user):
    body = {"email": student_user.email, "password": "WrongPassword!"}
    codes = [client.post("/api/v1/auth/login", json=body).status_code for _ in range(11)]
    assert codes[:10] == [401] * 10
    assert codes[10] == 429
    last = client.post("/api/v1/auth/login", json=body)
    assert last.status_code == 429
    assert int(last.headers["Retry-After"]) > 0


def test_register_is_rate_limited_per_ip(client):
    codes = [_register(client, email=f"user{i}@muj.manipal.edu").status_code for i in range(6)]
    assert codes[:5] == [201] * 5
    assert codes[5] == 429


# ── CORS & headers ────────────────────────────────────────────────────────────
def test_cors_allows_only_configured_origins(client):
    allowed = "https://campus-connect2-alpha.vercel.app"
    ok = client.options("/api/v1/auth/login", headers={"Origin": allowed, "Access-Control-Request-Method": "POST"})
    assert ok.headers.get("access-control-allow-origin") == allowed

    evil = client.options("/api/v1/auth/login", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"})
    assert "access-control-allow-origin" not in evil.headers


def test_security_headers_present(client):
    headers = client.get("/health").headers
    assert headers["x-content-type-options"] == "nosniff"
    assert headers["x-frame-options"] == "DENY"
    assert headers["content-security-policy"] == "default-src 'none'; frame-ancestors 'none'"
    assert "strict-transport-security" not in headers  # only in production


def test_hsts_in_production(client, monkeypatch):
    monkeypatch.setattr(settings, "ENVIRONMENT", "production")
    assert "max-age=31536000" in client.get("/health").headers["strict-transport-security"]


def test_docs_page_is_not_blocked_by_csp(client):
    response = client.get("/api/docs")
    assert response.status_code == 200
    assert "content-security-policy" not in response.headers
