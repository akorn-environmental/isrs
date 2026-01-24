"""Add photos table for gallery and photo management

Revision ID: 003_photos
Revises: 002_user_feedback
Create Date: 2026-01-24 17:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_photos'
down_revision = '002_user_feedback'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create photos table for gallery management with AI analysis"""

    op.create_table(
        'photos',
        # Primary key
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),

        # File information
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('original_filename', sa.String(255), nullable=False),
        sa.Column('s3_key', sa.String(512), nullable=False, unique=True),
        sa.Column('s3_url', sa.String(1024), nullable=False),
        sa.Column('thumbnail_s3_key', sa.String(512), nullable=True),
        sa.Column('thumbnail_url', sa.String(1024), nullable=True),

        # File metadata
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('width', sa.Integer(), nullable=True),
        sa.Column('height', sa.Integer(), nullable=True),
        sa.Column('sha1_hash', sa.String(40), nullable=True),

        # User-provided metadata
        sa.Column('caption', sa.Text(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('taken_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('location_name', sa.String(255), nullable=True),
        sa.Column('gps_latitude', sa.Float(), nullable=True),
        sa.Column('gps_longitude', sa.Float(), nullable=True),
        sa.Column('country', sa.String(100), nullable=True),
        sa.Column('state_province', sa.String(100), nullable=True),
        sa.Column('project_name', sa.String(255), nullable=True),

        # Attribution and licensing
        sa.Column('photographer_name', sa.String(255), nullable=True),
        sa.Column('photographer_email', sa.String(255), nullable=True),
        sa.Column('copyright_holder', sa.String(255), nullable=True),
        sa.Column('license_type', sa.String(50), server_default='All Rights Reserved'),
        sa.Column('license_url', sa.String(512), nullable=True),
        sa.Column('attribution_required', sa.Boolean(), server_default='true'),

        # AI Analysis
        sa.Column('ai_analysis', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('ai_processed', sa.Boolean(), server_default='false'),
        sa.Column('ai_processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('species_identified', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('habitat_type', sa.String(50), nullable=True),
        sa.Column('restoration_technique', sa.String(50), nullable=True),

        # Accessibility and display
        sa.Column('alt_text', sa.Text(), nullable=True),
        sa.Column('focal_point_x', sa.Float(), nullable=True),
        sa.Column('focal_point_y', sa.Float(), nullable=True),

        # Visibility and status
        sa.Column('is_public', sa.Boolean(), server_default='false'),
        sa.Column('is_featured', sa.Boolean(), server_default='false'),
        sa.Column('status', sa.String(20), server_default='active'),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=True),

        # Relationships
        sa.Column('uploaded_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('attendee_profiles.id'), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('conference_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conferences.id'), nullable=True),

        # Timestamps
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    )

    # Create indexes for common queries
    op.create_index('idx_photos_s3_key', 'photos', ['s3_key'], unique=True)
    op.create_index('idx_photos_sha1_hash', 'photos', ['sha1_hash'])
    op.create_index('idx_photos_uploaded_by', 'photos', ['uploaded_by'])
    op.create_index('idx_photos_uploaded_at', 'photos', ['uploaded_at'])
    op.create_index('idx_photos_is_public', 'photos', ['is_public'])
    op.create_index('idx_photos_is_featured', 'photos', ['is_featured'])
    op.create_index('idx_photos_status', 'photos', ['status'])
    op.create_index('idx_photos_conference_id', 'photos', ['conference_id'])

    # GIN index for array columns
    op.execute('CREATE INDEX idx_photos_species_gin ON photos USING GIN (species_identified)')
    op.execute('CREATE INDEX idx_photos_tags_gin ON photos USING GIN (tags)')


def downgrade() -> None:
    """Remove photos table"""

    # Drop GIN indexes
    op.execute('DROP INDEX IF EXISTS idx_photos_tags_gin')
    op.execute('DROP INDEX IF EXISTS idx_photos_species_gin')

    # Drop regular indexes
    op.drop_index('idx_photos_conference_id', table_name='photos')
    op.drop_index('idx_photos_status', table_name='photos')
    op.drop_index('idx_photos_is_featured', table_name='photos')
    op.drop_index('idx_photos_is_public', table_name='photos')
    op.drop_index('idx_photos_uploaded_at', table_name='photos')
    op.drop_index('idx_photos_uploaded_by', table_name='photos')
    op.drop_index('idx_photos_sha1_hash', table_name='photos')
    op.drop_index('idx_photos_s3_key', table_name='photos')

    op.drop_table('photos')
