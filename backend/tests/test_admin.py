"""
Tests for the university-admin API (app/api/v1/routes/admin.py).

require_admin() returns 401 when there is no/invalid token and 403 when the
token belongs to anyone other than a university_admin.
"""

import pytest

from app.models.club import Club, ClubCategory


@pytest.fixture()
def test_club(db):
    club = Club(
        slug="pytest-coding-club",
        name="Pytest Coding Club",
        short_name="PCC",
        faculty="FoSTA",
        department="CSE",
        category=ClubCategory.Technical,
    )
    db.add(club)
    db.commit()
    db.refresh(club)
    return club


def test_admin_stats_requires_admin_token(client, admin_headers):
    no_token = client.get("/api/v1/admin/stats")
    assert no_token.status_code == 401

    response = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert response.status_code == 200
    body = response.json()
    for key in ("total_clubs", "total_students", "total_events", "pending_proposals"):
        assert key in body


def test_admin_stats_student_token_rejected(client, student_headers):
    response = client.get("/api/v1/admin/stats", headers=student_headers)
    assert response.status_code == 403


def test_get_all_clubs_admin(client, admin_headers, test_club):
    response = client.get("/api/v1/admin/clubs", headers=admin_headers)
    assert response.status_code == 200
    clubs = {c["slug"]: c for c in response.json()}
    assert test_club.slug in clubs
    assert clubs[test_club.slug]["category"] == "Technical"
    assert clubs[test_club.slug]["is_active"] is True
