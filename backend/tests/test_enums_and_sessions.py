"""
Regression tests for two Phase 5 fixes.

1. Enum storage: WinnerPosition / MemberRole / BudgetCategory have Python
   member names that differ from their database values ("first" vs "1st",
   "Vice_President" vs "Vice President"). SQLAlchemy stores enum *names* by
   default, so reading or writing these rows used to fail. The models now
   use values_callable so the DB values are used.

2. Refresh-token sessions: expiry checks now use timezone-aware UTC
   datetimes instead of naive datetime.utcnow().
"""

from datetime import UTC, datetime, timedelta

import pytest

from app.models.club import Club, ClubCategory, ClubMember, MemberRole
from app.models.event import ApprovalStatus, Event, EventCategory, EventStatus, EventWinner, WinnerPosition
from app.models.user import Session as UserSession


@pytest.fixture()
def completed_event_with_winner(db, club_admin_user):
    event = Event(
        created_by=club_admin_user.id,
        slug="pytest-completed-event",
        title="Pytest Completed Event",
        category=EventCategory.Tech,
        approval_status=ApprovalStatus.approved,
        status=EventStatus.completed,
    )
    db.add(event)
    db.flush()
    db.add(EventWinner(event_id=event.id, position=WinnerPosition.first, name="Asha", reg_no="229301001"))
    db.commit()
    return event


def test_completed_events_returns_winner_positions(client, club_admin_headers, completed_event_with_winner):
    response = client.get("/api/v1/club-admin/completed-events", headers=club_admin_headers)
    assert response.status_code == 200
    event = next(e for e in response.json() if e["slug"] == completed_event_with_winner.slug)
    assert event["winners"] == [{"position": "1st", "name": "Asha", "reg_no": "229301001", "team_name": None}]


def test_club_members_with_multi_word_role(client, db, student_user):
    club = Club(slug="pytest-role-club", name="Pytest Role Club", faculty="FoSTA", department="CSE", category=ClubCategory.Technical)
    db.add(club)
    db.flush()
    db.add(ClubMember(club_id=club.id, user_id=student_user.id, role=MemberRole.Vice_President))
    db.commit()

    response = client.get(f"/api/v1/clubs/{club.slug}/members")
    assert response.status_code == 200
    assert [m["role"] for m in response.json()] == ["Vice President"]


def _login(client, email, password):
    response = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200
    return response.json()


def test_refresh_token_issues_new_tokens(client, student_user, test_password):
    tokens = _login(client, student_user.email, test_password)
    response = client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert response.status_code == 200
    assert response.json()["user_id"] == str(student_user.id)


def test_expired_refresh_session_is_rejected(client, db, student_user, test_password):
    tokens = _login(client, student_user.email, test_password)
    session = db.query(UserSession).filter(UserSession.user_id == student_user.id).one()
    session.expires_at = datetime.now(UTC) - timedelta(minutes=1)
    db.commit()

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]})
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()
