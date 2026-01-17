"""Add refresh tokens table for token rotation

Revision ID: 001_refresh_tokens
Revises:
Create Date: 2026-01-17 14:45:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_refresh_tokens'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create refresh_tokens table for secure token rotation pattern"""

    op.create_table(
        'refresh_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token', sa.String(255), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('replaced_by_token', sa.String(255), nullable=True),

        # Security metadata for audit trail
        sa.Column('ip_address', sa.String(45), nullable=True),  # IPv4 or IPv6
        sa.Column('user_agent', sa.Text, nullable=True),

        # Foreign key to attendee_profiles
        sa.ForeignKeyConstraint(['user_id'], ['attendee_profiles.id'], ondelete='CASCADE'),
    )

    # Create indexes for performance
    op.create_index('idx_refresh_tokens_token', 'refresh_tokens', ['token'])
    op.create_index('idx_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
    op.create_index('idx_refresh_tokens_expires_at', 'refresh_tokens', ['expires_at'])

    # Index for cleanup queries (find expired/revoked tokens)
    op.create_index(
        'idx_refresh_tokens_cleanup',
        'refresh_tokens',
        ['revoked_at', 'expires_at']
    )


def downgrade() -> None:
    """Remove refresh_tokens table"""

    op.drop_index('idx_refresh_tokens_cleanup', table_name='refresh_tokens')
    op.drop_index('idx_refresh_tokens_expires_at', table_name='refresh_tokens')
    op.drop_index('idx_refresh_tokens_user_id', table_name='refresh_tokens')
    op.drop_index('idx_refresh_tokens_token', table_name='refresh_tokens')
    op.drop_table('refresh_tokens')
