import uuid
from sqlalchemy import Column, String, Text, Numeric, DateTime, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class PaymentStatus(str, enum.Enum):
    pending  = "pending"
    paid     = "paid"
    failed   = "failed"
    refunded = "refunded"


class Payment(Base):
    __tablename__ = "payments"

    id                  = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id             = Column(UUID(as_uuid=True), nullable=False, index=True)
    razorpay_order_id   = Column(String, nullable=True, unique=True)
    razorpay_payment_id = Column(String, nullable=True, unique=True)
    razorpay_signature  = Column(Text, nullable=True)
    amount              = Column(Numeric(10, 2), nullable=False)
    currency            = Column(String, nullable=False, default="INR")
    status              = Column(PgEnum(PaymentStatus, name="payment_status"), nullable=False, default=PaymentStatus.pending)
    entity_type         = Column(String, nullable=False)
    entity_id           = Column(UUID(as_uuid=True), nullable=False)
    created_at          = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at          = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)