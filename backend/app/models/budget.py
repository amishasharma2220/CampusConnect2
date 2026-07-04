import uuid
from sqlalchemy import Column, String, Text, Numeric, Date, DateTime, Enum as PgEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base
import enum


class BudgetType(str, enum.Enum):
    inflow  = "inflow"
    outflow = "outflow"


class BudgetCategory(str, enum.Enum):
    Sponsorship       = "Sponsorship"
    Registration_Fees = "Registration Fees"
    Ticket_Sales      = "Ticket Sales"
    Venue_Logistics   = "Venue & Logistics"
    Prizes            = "Prizes"
    Food_Beverages    = "Food & Beverages"
    Speaker_Fees      = "Speaker Fees"
    Production        = "Production"
    Marketing         = "Marketing"
    Miscellaneous     = "Miscellaneous"


class ClubBudget(Base):
    __tablename__ = "club_budget"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    club_id     = Column(UUID(as_uuid=True), nullable=False, index=True)
    event_id    = Column(UUID(as_uuid=True), nullable=True)
    event_name  = Column(Text, nullable=False)
    type        = Column(PgEnum(BudgetType, name="budget_type"), nullable=False)
    category    = Column(PgEnum(BudgetCategory, name="budget_category"), nullable=False)
    amount      = Column(Numeric(12, 2), nullable=False)
    description = Column(Text, nullable=True)
    date        = Column(Date, nullable=False)
    created_by  = Column(UUID(as_uuid=True), nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)