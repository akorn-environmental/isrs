"""Add photo approval workflow and video support columns

Revision ID: 004_photo_approval
Revises: 003_photos
Create Date: 2026-01-24 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_photo_approval'
down_revision = '003_photos'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add approval workflow, legal consent, and video support columns to photos table"""

    # Approval workflow columns
    op.add_column('photos', sa.Column('approval_status', sa.String(20), server_default='pending', nullable=False))
    op.add_column('photos', sa.Column('approval_notes', sa.Text(), nullable=True))
    op.add_column('photos', sa.Column('approved_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('attendee_profiles.id'), nullable=True))
    op.add_column('photos', sa.Column('approved_at', sa.DateTime(timezone=True), nullable=True))

    # Legal consent columns
    op.add_column('photos', sa.Column('usage_rights_agreed', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('photos', sa.Column('liability_waiver_agreed', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('photos', sa.Column('consent_timestamp', sa.DateTime(timezone=True), nullable=True))
    op.add_column('photos', sa.Column('consent_ip_address', sa.String(45), nullable=True))

    # Video support columns
    op.add_column('photos', sa.Column('media_type', sa.String(20), server_default='photo', nullable=False))
    op.add_column('photos', sa.Column('duration_seconds', sa.Integer(), nullable=True))

    # Create indexes for common queries
    op.create_index('idx_photos_approval_status', 'photos', ['approval_status'])
    op.create_index('idx_photos_approved_by', 'photos', ['approved_by'])
    op.create_index('idx_photos_media_type', 'photos', ['media_type'])

    # Update existing photos to be approved (they were uploaded by admins)
    op.execute("UPDATE photos SET approval_status = 'approved' WHERE approval_status = 'pending'")


def downgrade() -> None:
    """Remove approval workflow, legal consent, and video support columns"""

    # Drop indexes
    op.drop_index('idx_photos_media_type', table_name='photos')
    op.drop_index('idx_photos_approved_by', table_name='photos')
    op.drop_index('idx_photos_approval_status', table_name='photos')

    # Drop video support columns
    op.drop_column('photos', 'duration_seconds')
    op.drop_column('photos', 'media_type')

    # Drop legal consent columns
    op.drop_column('photos', 'consent_ip_address')
    op.drop_column('photos', 'consent_timestamp')
    op.drop_column('photos', 'liability_waiver_agreed')
    op.drop_column('photos', 'usage_rights_agreed')

    # Drop approval workflow columns
    op.drop_column('photos', 'approved_at')
    op.drop_column('photos', 'approved_by')
    op.drop_column('photos', 'approval_notes')
    op.drop_column('photos', 'approval_status')
