import uuid
from sqlalchemy import Column, String, Text, Numeric, Boolean, DateTime, Enum as PgEnum, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class ListingStatus(str, enum.Enum):
    active  = "active"
    sold    = "sold"
    removed = "removed"


class ListingCategory(str, enum.Enum):
    textbooks   = "textbooks"
    electronics = "electronics"
    clothing    = "clothing"
    stationery  = "stationery"
    furniture   = "furniture"
    other       = "other"


class MarketplaceListing(Base):
    __tablename__ = "marketplace_listings"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id     = Column(UUID(as_uuid=True), nullable=False, index=True)
    title         = Column(Text, nullable=False)
    description   = Column(Text, nullable=True)
    price         = Column(Numeric(10, 2), nullable=False)
    is_negotiable = Column(Boolean, nullable=False, default=True)
    category      = Column(PgEnum(ListingCategory, name="listing_category"), nullable=False, default=ListingCategory.other)
    condition     = Column(String, nullable=True)
    images        = Column(ARRAY(String), nullable=False, default=[])
    status        = Column(PgEnum(ListingStatus, name="listing_status"), nullable=False, default=ListingStatus.active)
    created_at    = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at    = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


class MarketplaceMessage(Base):
    __tablename__ = "marketplace_messages"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    listing_id  = Column(UUID(as_uuid=True), nullable=False, index=True)
    sender_id   = Column(UUID(as_uuid=True), nullable=False)
    receiver_id = Column(UUID(as_uuid=True), nullable=False)
    message     = Column(Text, nullable=False)
    is_read     = Column(Boolean, nullable=False, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)