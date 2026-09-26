"""baseline: full CampusConnect schema (22 tables, enums, triggers)

Revision ID: 0001
Revises:
Create Date: 2026-09-26

This baseline is the exact contents of database/schema.sql at the time
Alembic was introduced (copied to alembic/sql/0001_baseline_schema.sql so it
ships inside the backend Docker image).

It is safe on every database we have:
- Fresh/empty DB (e.g. a new Neon branch): runs the full schema.
- DB already built from schema.sql (Neon prod, docker-compose local DB):
  detects the existing `users` table and does nothing, so `alembic upgrade
  head` simply records revision 0001 as applied. No manual `stamp` needed.

From here on, schema changes go in NEW migrations only — don't edit
schema.sql or this file.
"""
from collections.abc import Sequence
from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

SCHEMA_SQL = Path(__file__).resolve().parent.parent / "sql" / "0001_baseline_schema.sql"


def upgrade() -> None:
    bind = op.get_bind()
    if sa.inspect(bind).has_table("users"):
        # Existing database created from schema.sql — adopt it as-is.
        return
    bind.exec_driver_sql(SCHEMA_SQL.read_text())


def downgrade() -> None:
    # Deliberately not supported: downgrading the baseline would drop every
    # table (and all production data). Restore from a Neon backup/branch instead.
    raise NotImplementedError("Refusing to drop the entire CampusConnect schema.")
