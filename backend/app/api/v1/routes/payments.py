"""
Club membership payments via Razorpay.

Flow:
1. POST /payments/club-membership/order
   Server looks up the club's fee (never trusts an amount from the browser),
   creates a Razorpay order, and stores a `pending` row in `payments`.
2. The browser opens Razorpay Checkout with that order_id.
3. POST /payments/verify
   Server checks Razorpay's HMAC signature. Only then is the payment marked
   `paid` and the student added to `club_members`.
"""

import logging
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.db.session import get_db
from app.models.club import Club, ClubMember, MemberRole
from app.models.payment import Payment, PaymentStatus
from app.models.profile import Profile
from app.models.user import User
from app.schemas.payment import (
    ClubMembershipOrderRequest,
    ClubMembershipOrderResponse,
    PaymentVerifyRequest,
    PaymentVerifyResponse,
)
from app.services import razorpay

router = APIRouter(prefix="/payments", tags=["Payments"])
logger = logging.getLogger(__name__)

CLUB_MEMBERSHIP = "club_membership"


def _active_membership(db: Session, club_id, user_id) -> ClubMember | None:
    return (
        db.query(ClubMember)
        .filter(ClubMember.club_id == club_id, ClubMember.user_id == user_id, ClubMember.is_active)
        .first()
    )


@router.post("/club-membership/order", response_model=ClubMembershipOrderResponse, status_code=status.HTTP_201_CREATED)
def create_club_membership_order(
    data: ClubMembershipOrderRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    club = db.query(Club).filter(Club.slug == data.club_slug, Club.is_active).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")
    if _active_membership(db, club.id, user.id):
        raise HTTPException(status_code=409, detail="You are already a member of this club.")
    if not razorpay.is_configured():
        raise HTTPException(status_code=503, detail="Payments are not configured yet. Please try again later.")

    amount_paise = club.fee * 100
    try:
        order = razorpay.create_order(
            amount_paise=amount_paise,
            receipt=f"club-{uuid.uuid4().hex[:12]}",
            notes={"user_id": str(user.id), "club_slug": club.slug, "purpose": CLUB_MEMBERSHIP},
        )
    except razorpay.RazorpayError as exc:
        logger.warning("Razorpay order creation failed: %s", exc)
        raise HTTPException(status_code=502, detail="Could not start the payment. Please try again.") from exc

    db.add(
        Payment(
            user_id=user.id,
            razorpay_order_id=order["id"],
            amount=club.fee,
            currency="INR",
            status=PaymentStatus.pending,
            entity_type=CLUB_MEMBERSHIP,
            entity_id=club.id,
        )
    )
    db.commit()

    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    return ClubMembershipOrderResponse(
        order_id=order["id"],
        amount=amount_paise,
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
        club_slug=club.slug,
        club_name=club.name,
        prefill_name=profile.full_name if profile else "",
        prefill_email=user.email,
    )


@router.post("/verify", response_model=PaymentVerifyResponse)
def verify_payment(
    data: PaymentVerifyRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment = (
        db.query(Payment)
        .filter(Payment.razorpay_order_id == data.razorpay_order_id, Payment.user_id == user.id)
        .first()
    )
    if not payment or payment.entity_type != CLUB_MEMBERSHIP:
        raise HTTPException(status_code=404, detail="Payment not found.")
    club = db.query(Club).filter(Club.id == payment.entity_id).first()
    if not club:
        raise HTTPException(status_code=404, detail="Club not found.")

    if payment.status != PaymentStatus.paid:
        if not razorpay.verify_signature(data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature):
            payment.status = PaymentStatus.failed
            db.commit()
            raise HTTPException(status_code=400, detail="Payment verification failed.")
        payment.status = PaymentStatus.paid
        payment.razorpay_payment_id = data.razorpay_payment_id
        payment.razorpay_signature = data.razorpay_signature

    # Idempotent: calling verify again for a paid order never double-adds.
    if not _active_membership(db, club.id, user.id):
        existing = db.query(ClubMember).filter(ClubMember.club_id == club.id, ClubMember.user_id == user.id).first()
        if existing:
            existing.is_active = True
        else:
            db.add(ClubMember(club_id=club.id, user_id=user.id, role=MemberRole.Member, year=data.year, department=data.branch))
        club.members_count = (club.members_count or 0) + 1

    db.commit()
    return PaymentVerifyResponse(
        status="paid",
        club_slug=club.slug,
        club_name=club.name,
        payment_id=payment.razorpay_payment_id,
    )
