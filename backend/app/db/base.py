from sqlalchemy import Column, DateTime, func
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    """Adds created_at and updated_at to any model."""
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


def enum_values(enum_cls) -> list[str]:
    """values_callable for SQLAlchemy Enum columns: store each member's .value.

    SQLAlchemy stores Python enum member *names* by default. Our Postgres enum
    types use the values (e.g. '1st', 'Vice President'), so any enum whose
    names differ from its values must use this.
    """
    return [member.value for member in enum_cls]
