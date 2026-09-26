"""
Tests for the public events API (app/api/v1/routes/events.py).

- GET  /api/v1/events/                 -> only approval_status=approved events
- GET  /api/v1/events/{slug}           -> single event, 404 if unknown
- POST /api/v1/events/                 -> club_admin / university_admin only (201),
                                          student -> 403; new events start pending
                                          and get an EventProposal for admin review
- POST /api/v1/events/{slug}/register  -> 201 first time, 409 on duplicate

Event fixtures are created directly in the DB (inside the per-test
transaction from conftest.py), so they never collide with seeded data
and are rolled back after each test.
"""

import pytest

from app.models.event import ApprovalStatus, Event, EventCategory, EventProposal


def _make_event(db, *, owner, slug, title, approval_status):
    event = Event(
        created_by=owner.id,
        slug=slug,
        title=title,
        category=EventCategory.Tech,
        approval_status=approval_status,
        max_capacity=100,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@pytest.fixture()
def approved_event(db, club_admin_user):
    return _make_event(
        db,
        owner=club_admin_user,
        slug="pytest-approved-event",
        title="Pytest Approved Event",
        approval_status=ApprovalStatus.approved,
    )


@pytest.fixture()
def pending_event(db, club_admin_user):
    return _make_event(
        db,
        owner=club_admin_user,
        slug="pytest-pending-event",
        title="Pytest Pending Event",
        approval_status=ApprovalStatus.pending,
    )


def _registration_payload():
    return {
        "full_name": "Test Student",
        "email": "student@test.campusconnect-test.dev",
        "branch": "CSE",
        "year_of_study": "3",
    }


def test_get_all_events_public(client, approved_event, pending_event):
    response = client.get("/api/v1/events/")
    assert response.status_code == 200
    slugs = {e["slug"] for e in response.json()}
    assert approved_event.slug in slugs
    assert pending_event.slug not in slugs


def test_get_event_by_slug(client, approved_event):
    response = client.get(f"/api/v1/events/{approved_event.slug}")
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == approved_event.title
    assert body["registration_count"] == 0
    assert body["is_registered"] is False

    missing = client.get("/api/v1/events/this-slug-does-not-exist")
    assert missing.status_code == 404


def test_create_event_as_club_admin(client, db, club_admin_headers):
    response = client.post(
        "/api/v1/events/",
        headers=club_admin_headers,
        json={"title": "Pytest Hackathon 2026", "category": "Tech", "venue": "AB1"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["slug"].startswith("pytest-hackathon-2026")
    assert body["approval_status"] == "pending"
    assert body["status"] == "upcoming"

    proposal = db.query(EventProposal).filter(EventProposal.event_id == body["id"]).first()
    assert proposal is not None
    assert proposal.status == ApprovalStatus.pending


def test_create_event_as_student_fails(client, student_headers):
    response = client.post(
        "/api/v1/events/",
        headers=student_headers,
        json={"title": "Student Should Not Create This"},
    )
    assert response.status_code == 403


def test_register_for_event(client, approved_event, student_headers):
    response = client.post(
        f"/api/v1/events/{approved_event.slug}/register",
        headers=student_headers,
        json=_registration_payload(),
    )
    assert response.status_code == 201

    detail = client.get(f"/api/v1/events/{approved_event.slug}", headers=student_headers)
    assert detail.status_code == 200
    assert detail.json()["is_registered"] is True
    assert detail.json()["registration_count"] == 1


def test_duplicate_registration_fails(client, approved_event, student_headers):
    url = f"/api/v1/events/{approved_event.slug}/register"
    first = client.post(url, headers=student_headers, json=_registration_payload())
    assert first.status_code == 201

    second = client.post(url, headers=student_headers, json=_registration_payload())
    assert second.status_code == 409
