from pydantic import BaseModel, Field


class ClubMembershipOrderRequest(BaseModel):
    club_slug: str


class ClubMembershipOrderResponse(BaseModel):
    order_id: str
    amount: int = Field(description="Amount in paise, as Razorpay Checkout expects.")
    currency: str
    key_id: str
    club_slug: str
    club_name: str
    prefill_name: str
    prefill_email: str


class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    year: str | None = None
    branch: str | None = None


class PaymentVerifyResponse(BaseModel):
    status: str
    club_slug: str
    club_name: str
    payment_id: str
