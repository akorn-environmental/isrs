"""Add user_feedback table for feedback widget submissions

Revision ID: 002_user_feedback
Revises: 001_refresh_tokens
Create Date: 2026-01-23 13:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_user_feedback'
down_revision = '001_refresh_tokens'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create user_feedback table for feedback widget submissions"""

    op.create_table(
        'user_feedback',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),  # Link to attendee_profiles if logged in
        sa.Column('user_name', sa.String(255), nullable=True),
        sa.Column('user_email', sa.String(255), nullable=True),
        sa.Column('feedback_type', sa.String(50), nullable=False),  # bug, feature_request, improvement, general
        sa.Column('message', sa.String(5000), nullable=False),
        sa.Column('page_url', sa.String(500), nullable=True),
        sa.Column('page_title', sa.String(255), nullable=True),
        sa.Column('component_name', sa.String(100), nullable=True),
        sa.Column('is_admin_portal', sa.String(10), server_default='false'),  # 'true' or 'false'
        sa.Column('status', sa.String(50), server_default='new'),  # new, reviewed, in_progress, resolved
        sa.Column('reviewed_by', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('notes', sa.String(2000), nullable=True),  # Admin notes
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=True),
    )

    # Create indexes for common queries
    op.create_index('idx_user_feedback_status', 'user_feedback', ['status'])
    op.create_index('idx_user_feedback_type', 'user_feedback', ['feedback_type'])
    op.create_index('idx_user_feedback_created_at', 'user_feedback', ['created_at'])
    op.create_index('idx_user_feedback_user_id', 'user_feedback', ['user_id'])


def downgrade() -> None:
    """Remove user_feedback table"""

    op.drop_index('idx_user_feedback_user_id', table_name='user_feedback')
    op.drop_index('idx_user_feedback_created_at', table_name='user_feedback')
    op.drop_index('idx_user_feedback_type', table_name='user_feedback')
    op.drop_index('idx_user_feedback_status', table_name='user_feedback')
    op.drop_table('user_feedback')
