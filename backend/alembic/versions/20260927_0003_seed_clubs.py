"""seed the 82 MUJ clubs from the frontend's clubsData.ts

Revision ID: 0003
Revises: 0002
Create Date: 2026-09-27

Until now the Clubs pages read a hardcoded list (frontend/src/data/clubsData.ts)
and the `clubs` table was never populated (database/seed_clubs.py was an
unfinished stub). Club membership payments need real club rows, so this data
migration inserts them. Slugs match the frontend ids.

ON CONFLICT (slug) DO NOTHING makes it safe on any database: clubs that
already exist (e.g. created by hand on Neon) are left untouched.
"""
import json
from collections.abc import Sequence
from pathlib import Path

import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: str | Sequence[str] | None = "0002"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "0003_clubs.json"

INSERT = sa.text(
    """
    INSERT INTO clubs (slug, name, faculty, department, category, description, logo_url, members_count)
    VALUES (:slug, :name, :faculty, :department, CAST(:category AS club_category), :description, :logo_url, :members_count)
    ON CONFLICT (slug) DO NOTHING
    """
)


def upgrade() -> None:
    rows = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    op.get_bind().execute(INSERT, rows)


def downgrade() -> None:
    # Data migration: deliberately a no-op. Deleting clubs could remove rows
    # that members, events and payments now point to.
    pass
