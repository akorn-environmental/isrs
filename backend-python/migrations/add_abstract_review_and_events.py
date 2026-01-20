"""Add abstract review and event management tables

Revision ID: add_abstract_review_and_events
Revises: (previous migration)
Create Date: 2026-01-20

This migration adds:
1. abstract_reviewers - Track reviewer assignments
2. abstract_reviews - Store peer reviews with weighted scoring
3. abstract_decisions - Final acceptance/rejection decisions
4. review_criteria - Configurable review criteria per conference
5. conference_events - Conference special events (clam bake, field trips, etc.)
6. event_signups - Event registrations with capacity management
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from datetime import datetime, timezone

# revision identifiers, used by Alembic.
revision = 'add_abstract_review_and_events'
down_revision = None  # Update this to match your latest migration
branch_labels = None
depends_on = None


def upgrade():
    """Create all new tables for abstract review and event management."""

    # 1. Create abstract_reviewers table
    op.create_table(
        'abstract_reviewers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('abstract_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conference_abstracts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reviewer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('assigned_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id')),
        sa.Column('status', sa.String(50), server_default='pending'),
        sa.Column('notified_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('abstract_id', 'reviewer_id', name='uq_abstract_reviewer')
    )

    # Indexes for abstract_reviewers
    op.create_index('idx_abstract_reviewers_abstract', 'abstract_reviewers', ['abstract_id'])
    op.create_index('idx_abstract_reviewers_reviewer', 'abstract_reviewers', ['reviewer_id'])
    op.create_index('idx_abstract_reviewers_status', 'abstract_reviewers', ['status'])

    # 2. Create abstract_reviews table
    op.create_table(
        'abstract_reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('abstract_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conference_abstracts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('reviewer_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('relevance_score', sa.Integer, sa.CheckConstraint('relevance_score BETWEEN 1 AND 5', name='ck_relevance_score')),
        sa.Column('originality_score', sa.Integer, sa.CheckConstraint('originality_score BETWEEN 1 AND 5', name='ck_originality_score')),
        sa.Column('methodology_score', sa.Integer, sa.CheckConstraint('methodology_score BETWEEN 1 AND 5', name='ck_methodology_score')),
        sa.Column('clarity_score', sa.Integer, sa.CheckConstraint('clarity_score BETWEEN 1 AND 5', name='ck_clarity_score')),
        sa.Column('impact_score', sa.Integer, sa.CheckConstraint('impact_score BETWEEN 1 AND 5', name='ck_impact_score')),
        sa.Column('weighted_score', sa.DECIMAL(5, 2)),
        sa.Column('strengths', sa.Text),
        sa.Column('weaknesses', sa.Text),
        sa.Column('comments', sa.Text),
        sa.Column('recommendation', sa.String(50)),
        sa.Column('submitted_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('abstract_id', 'reviewer_id', name='uq_abstract_review')
    )

    # Indexes for abstract_reviews
    op.create_index('idx_abstract_reviews_abstract', 'abstract_reviews', ['abstract_id'])
    op.create_index('idx_abstract_reviews_reviewer', 'abstract_reviews', ['reviewer_id'])

    # 3. Create abstract_decisions table
    op.create_table(
        'abstract_decisions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('abstract_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conference_abstracts.id', ondelete='CASCADE'), nullable=False),
        sa.Column('decision', sa.String(50), nullable=False),
        sa.Column('decided_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('decided_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('average_score', sa.DECIMAL(5, 2)),
        sa.Column('review_count', sa.Integer),
        sa.Column('notes', sa.Text),
        sa.Column('notified_at', sa.DateTime(timezone=True)),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )

    # Indexes for abstract_decisions
    op.create_index('idx_abstract_decisions_abstract', 'abstract_decisions', ['abstract_id'])
    op.create_index('idx_abstract_decisions_decision', 'abstract_decisions', ['decision'])

    # 4. Create review_criteria table
    op.create_table(
        'review_criteria',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('conference_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conferences.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('weight', sa.DECIMAL(3, 2), nullable=False, server_default='1.0'),
        sa.Column('display_order', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('conference_id', 'name', name='uq_conference_criteria')
    )

    # 5. Create conference_events table
    op.create_table(
        'conference_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('conference_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conferences.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('event_date', sa.DateTime(timezone=True)),
        sa.Column('capacity', sa.Integer),
        sa.Column('current_signups', sa.Integer, server_default='0'),
        sa.Column('allows_guests', sa.Boolean, server_default='false'),
        sa.Column('fee_per_person', sa.DECIMAL(10, 2), server_default='0'),
        sa.Column('status', sa.String(50), server_default='open'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False)
    )

    # Indexes for conference_events
    op.create_index('idx_conference_events_conference', 'conference_events', ['conference_id'])
    op.create_index('idx_conference_events_type', 'conference_events', ['event_type'])

    # 6. Create event_signups table
    op.create_table(
        'event_signups',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('event_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conference_events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('guest_count', sa.Integer, server_default='0'),
        sa.Column('total_fee', sa.DECIMAL(10, 2), server_default='0'),
        sa.Column('status', sa.String(50), server_default='confirmed'),
        sa.Column('waitlist_position', sa.Integer),
        sa.Column('signed_up_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.UniqueConstraint('event_id', 'user_id', name='uq_event_user')
    )

    # Indexes for event_signups
    op.create_index('idx_event_signups_event', 'event_signups', ['event_id'])
    op.create_index('idx_event_signups_user', 'event_signups', ['user_id'])
    op.create_index('idx_event_signups_status', 'event_signups', ['status'])

    # Add default review criteria for ICSR2026
    # First, we need to get the ICSR2026 conference ID
    # This is a data migration that should be done after table creation
    print("✅ Created 6 new tables for abstract review and event management")
    print("⚠️  Next step: Add default review criteria for ICSR2026")


def downgrade():
    """Drop all tables created in upgrade."""

    # Drop in reverse order due to foreign key constraints
    op.drop_table('event_signups')
    op.drop_table('conference_events')
    op.drop_table('review_criteria')
    op.drop_table('abstract_decisions')
    op.drop_table('abstract_reviews')
    op.drop_table('abstract_reviewers')

    print("✅ Rolled back abstract review and event management tables")
