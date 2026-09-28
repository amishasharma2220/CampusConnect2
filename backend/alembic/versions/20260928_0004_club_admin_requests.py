"""club admin requests: students ask to manage a club, university admins review

Revision ID: 0004
Revises: 0003
Create Date: 2026-09-28 15:22:32.184315

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = '0004'
down_revision: str | Sequence[str] | None = '0003'
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table('club_admin_requests',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('club_id', sa.UUID(), nullable=False),
    sa.Column('position', sa.String(), nullable=False),
    sa.Column('message', sa.Text(), nullable=True),
    # Reuses the existing approval_status enum type (created by the baseline).
    sa.Column('status', postgresql.ENUM('pending', 'approved', 'rejected', name='approval_status', create_type=False),
              nullable=False, server_default='pending'),
    sa.Column('admin_notes', sa.Text(), nullable=True),
    sa.Column('reviewed_by', sa.UUID(), nullable=True),
    sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    sa.ForeignKeyConstraint(['club_id'], ['clubs.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['reviewed_by'], ['users.id'], ondelete='SET NULL'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_club_admin_requests_club_id'), 'club_admin_requests', ['club_id'], unique=False)
    op.create_index(op.f('ix_club_admin_requests_user_id'), 'club_admin_requests', ['user_id'], unique=False)
    # At most one pending request per student.
    op.create_index(
        'uq_club_admin_requests_one_pending_per_user', 'club_admin_requests', ['user_id'],
        unique=True, postgresql_where=sa.text("status = 'pending'"),
    )


def downgrade() -> None:
    op.drop_index('uq_club_admin_requests_one_pending_per_user', table_name='club_admin_requests')
    op.drop_index(op.f('ix_club_admin_requests_user_id'), table_name='club_admin_requests')
    op.drop_index(op.f('ix_club_admin_requests_club_id'), table_name='club_admin_requests')
    op.drop_table('club_admin_requests')
