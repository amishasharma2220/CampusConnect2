"""Tests for club admin requests (app/api/v1/routes/club_admin_requests.py)."""

import pytest

from app.core.security import create_access_token, hash_password
from app.models.club import Club, ClubCategory
from app.models.club_admin_request import ClubAdminRequest
from app.models.user import User, UserRole

BASE = "/api/v1/club-admin-requests"
ADMIN = "/api/v1/admin/club-admin-requests"


def _club(db, slug, admin_user_id=None):
    club = Club(slug=slug, name=f"Club {slug}", faculty="FoSTA", department="CSE",
                category=ClubCategory.Technical, admin_user_id=admin_user_id)
    db.add(club)
    db.commit()
    db.refresh(club)
    return club


def _student(db, email):
    user = User(email=email, password_hash=hash_password("TestPass123!"), role=UserRole.student, is_verified=True, is_active=True)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user, {"Authorization": f"Bearer {create_access_token(subject=user.id)}"}


@pytest.fixture()
def free_club(db):
    return _club(db, "pytest-free-club")


def _request(client, headers, slug, position="President", message="I lead this club."):
    return client.post(BASE, headers=headers, json={"club_slug": slug, "position": position, "message": message})


def test_student_can_request_and_see_status(client, student_headers, free_club):
    response = _request(client, student_headers, free_club.slug)
    assert response.status_code == 201
    assert response.json()["status"] == "pending"

    mine = client.get(f"{BASE}/mine", headers=student_headers).json()
    assert [(r["club_slug"], r["status"], r["position"]) for r in mine] == [(free_club.slug, "pending", "President")]


def test_request_requires_login(client, free_club):
    assert _request(client, {}, free_club.slug).status_code == 401


def test_only_one_pending_request_per_student(client, db, student_headers, free_club):
    other = _club(db, "pytest-other-club")
    assert _request(client, student_headers, free_club.slug).status_code == 201
    assert _request(client, student_headers, other.slug).status_code == 409


def test_cannot_request_club_that_already_has_admin(client, db, student_headers, club_admin_user):
    taken = _club(db, "pytest-taken-club", admin_user_id=club_admin_user.id)
    assert _request(client, student_headers, taken.slug).status_code == 409


def test_non_students_and_bad_positions_are_rejected(client, club_admin_headers, student_headers, free_club):
    assert _request(client, club_admin_headers, free_club.slug).status_code == 400
    assert _request(client, student_headers, free_club.slug, position="Supreme Leader").status_code == 422
    assert _request(client, student_headers, "no-such-club").status_code == 404


def test_positions_endpoint_lists_leadership_roles(client):
    positions = client.get(f"{BASE}/positions").json()
    assert "President" in positions and "Member" not in positions


def test_admin_list_requires_university_admin(client, student_headers, club_admin_headers):
    assert client.get(ADMIN, headers=student_headers).status_code == 403
    assert client.get(ADMIN, headers=club_admin_headers).status_code == 403
    assert client.get(ADMIN).status_code == 401


def test_approve_makes_student_club_admin_and_closes_rivals(client, db, student_user, student_headers, admin_headers, free_club):
    _rival, rival_headers = _student(db, "rival@test.campusconnect-test.dev")
    mine = _request(client, student_headers, free_club.slug).json()
    theirs = _request(client, rival_headers, free_club.slug).json()

    listed = client.get(ADMIN, headers=admin_headers).json()
    assert {r["id"] for r in listed} >= {mine["id"], theirs["id"]}
    assert next(r for r in listed if r["id"] == mine["id"])["student_email"] == student_user.email

    response = client.post(f"{ADMIN}/{mine['id']}/review", headers=admin_headers, json={"status": "approved", "admin_notes": "Welcome!"})
    assert response.status_code == 200
    assert response.json()["status"] == "approved"

    db.refresh(student_user)
    db.refresh(free_club)
    assert student_user.role == UserRole.club_admin
    assert free_club.admin_user_id == student_user.id

    # The rival's pending request for the same club is closed automatically.
    rival_req = db.query(ClubAdminRequest).filter(ClubAdminRequest.id == theirs["id"]).one()
    assert rival_req.status.value == "rejected"

    # The new club admin can now open their club dashboard.
    my_club = client.get("/api/v1/club-admin/my-club", headers=student_headers)
    assert my_club.status_code == 200


def test_reject_keeps_student_role_and_allows_new_request(client, db, student_user, student_headers, admin_headers, free_club):
    req = _request(client, student_headers, free_club.slug).json()
    decision = {"status": "rejected", "admin_notes": "Please ask your faculty advisor."}
    response = client.post(f"{ADMIN}/{req['id']}/review", headers=admin_headers, json=decision)
    assert response.status_code == 200
    db.refresh(student_user)
    assert student_user.role == UserRole.student
    assert client.get(f"{BASE}/mine", headers=student_headers).json()[0]["admin_notes"] == "Please ask your faculty advisor."

    # Reviewing twice is refused; asking again is allowed.
    assert client.post(f"{ADMIN}/{req['id']}/review", headers=admin_headers, json={"status": "approved"}).status_code == 409
    assert _request(client, student_headers, free_club.slug).status_code == 201


def test_approve_refused_if_club_got_an_admin_meanwhile(client, db, student_headers, admin_headers, club_admin_user, free_club):
    req = _request(client, student_headers, free_club.slug).json()
    free_club.admin_user_id = club_admin_user.id
    db.commit()
    response = client.post(f"{ADMIN}/{req['id']}/review", headers=admin_headers, json={"status": "approved"})
    assert response.status_code == 409
