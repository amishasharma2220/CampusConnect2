"""
Minimal Razorpay client: create an order and verify a checkout signature.

Uses Razorpay's REST API directly over httpx instead of the `razorpay` SDK
(fewer dependencies, easy to mock in tests). Docs:
https://razorpay.com/docs/api/orders/create/
https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/build-integration/#verify-payment-signature
"""

import hashlib
import hmac

import httpx

from app.core.config import settings

RAZORPAY_API = "https://api.razorpay.com/v1"


class RazorpayError(Exception):
    """Razorpay rejected the request or could not be reached."""


def is_configured() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET)


def create_order(amount_paise: int, receipt: str, notes: dict[str, str]) -> dict:
    """Create a Razorpay order. Amount is in paise (₹1 = 100 paise)."""
    try:
        response = httpx.post(
            f"{RAZORPAY_API}/orders",
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
            json={"amount": amount_paise, "currency": "INR", "receipt": receipt[:40], "notes": notes},
            timeout=15,
        )
    except httpx.HTTPError as exc:
        raise RazorpayError("Could not reach Razorpay.") from exc
    if response.status_code >= 400:
        raise RazorpayError(f"Razorpay returned {response.status_code}.")
    return response.json()


def verify_signature(order_id: str, payment_id: str, signature: str) -> bool:
    """Check the signature Razorpay Checkout returns after a successful payment.

    Razorpay signs "<order_id>|<payment_id>" with HMAC-SHA256 using the key
    secret. Only a real payment for *our* order can produce a valid signature.
    """
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        f"{order_id}|{payment_id}".encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
