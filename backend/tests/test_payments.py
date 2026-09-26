"""
Tests for club membership payments (app/api/v1/routes/payments.py).

Razorpay's order API is mocked; signatures are generated exactly the way
Razorpay does it (HMAC-SHA256 of "order_id|payment_id" with the key secret),
so the real verification code path is exercised.
"""

import hashlib
import hmac

import pytest

from app.core.config import settings
from app.models.club import Club, ClubCategory, ClubMember
from app.models.payment import Payment, PaymentStatus
from app.services import razorpay

TEST_KEY_ID = "rzp_test_dummykey"
TEST_SECRET = "test_secret_not_real"


@pytest.fixture()
def razorpay_test_mode(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", TEST_KEY_ID)
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", TEST_SECRET)
    created = []

    def fake_create_order(amount_paise, receipt, notes):
        order = {"id": f"order_test_{len(created) + 1}", "amount": amount_paise, "currency": "INR", "receipt": receipt}
        created.append({"amount": amount_paise, "notes": notes})
        return order

    monkeypatch.setattr(razorpay, "create_order", fake_create_order)
    return created


@pytest.fixture()
def paid_club(db):
    club = Club(slug="pytest-paid-club", name="Pytest Paid Club", faculty="FoSTA", department="CSE",
                category=ClubCategory.Technical, fee=300, members_count=10)
    db.add(club)
    db.commit()
    db.refresh(club)
    return club


def _sign(order_id, payment_id, secret=TEST_SECRET):
    return hmac.new(secret.encode(), f"{order_id}|{payment_id}".encode(), hashlib.sha256).hexdigest()


def _create_order(client, headers, slug):
    return client.post("/api/v1/payments/club-membership/order", headers=headers, json={"club_slug": slug})


def test_order_requires_login(client, paid_club, razorpay_test_mode):
    assert _create_order(client, {}, paid_club.slug).status_code == 401


def test_order_uses_fee_from_database(client, db, student_user, student_headers, paid_club, razorpay_test_mode):
    response = _create_order(client, student_headers, paid_club.slug)
    assert response.status_code == 201
    body = response.json()
    assert body["amount"] == 30000  # ₹300 in paise, from the club row
    assert body["key_id"] == TEST_KEY_ID
    assert body["prefill_email"] == student_user.email

    payment = db.query(Payment).filter(Payment.razorpay_order_id == body["order_id"]).one()
    assert payment.status == PaymentStatus.pending
    assert payment.entity_id == paid_club.id
    assert int(payment.amount) == 300


def test_order_for_unknown_club_is_404(client, student_headers, razorpay_test_mode):
    assert _create_order(client, student_headers, "no-such-club").status_code == 404


def test_order_without_razorpay_keys_is_503(client, student_headers, paid_club, monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "")
    assert _create_order(client, student_headers, paid_club.slug).status_code == 503


def test_verify_valid_signature_adds_member(client, db, student_user, student_headers, paid_club, razorpay_test_mode):
    order_id = _create_order(client, student_headers, paid_club.slug).json()["order_id"]
    body = {
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_test_123",
        "razorpay_signature": _sign(order_id, "pay_test_123"),
        "year": "2",
        "branch": "B.Tech CSE",
    }
    response = client.post("/api/v1/payments/verify", headers=student_headers, json=body)
    assert response.status_code == 200
    assert response.json() == {"status": "paid", "club_slug": paid_club.slug, "club_name": paid_club.name, "payment_id": "pay_test_123"}

    member = db.query(ClubMember).filter(ClubMember.club_id == paid_club.id, ClubMember.user_id == student_user.id).one()
    assert (member.year, member.department, member.is_active) == ("2", "B.Tech CSE", True)
    db.refresh(paid_club)
    assert paid_club.members_count == 11

    # Verifying again is idempotent: still one membership, count unchanged.
    again = client.post("/api/v1/payments/verify", headers=student_headers, json=body)
    assert again.status_code == 200
    assert db.query(ClubMember).filter(ClubMember.club_id == paid_club.id).count() == 1
    db.refresh(paid_club)
    assert paid_club.members_count == 11

    # And the student can't start a second payment for the same club.
    assert _create_order(client, student_headers, paid_club.slug).status_code == 409


def test_verify_forged_signature_is_rejected(client, db, student_user, student_headers, paid_club, razorpay_test_mode):
    order_id = _create_order(client, student_headers, paid_club.slug).json()["order_id"]
    response = client.post("/api/v1/payments/verify", headers=student_headers, json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_test_123",
        "razorpay_signature": _sign(order_id, "pay_test_123", secret="wrong-secret"),
    })
    assert response.status_code == 400
    assert db.query(Payment).filter(Payment.razorpay_order_id == order_id).one().status == PaymentStatus.failed
    assert db.query(ClubMember).filter(ClubMember.user_id == student_user.id).count() == 0


def test_cannot_verify_someone_elses_order(client, student_headers, club_admin_headers, paid_club, razorpay_test_mode):
    order_id = _create_order(client, student_headers, paid_club.slug).json()["order_id"]
    response = client.post("/api/v1/payments/verify", headers=club_admin_headers, json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_test_123",
        "razorpay_signature": _sign(order_id, "pay_test_123"),
    })
    assert response.status_code == 404
