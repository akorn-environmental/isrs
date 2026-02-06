"""Add alternate_emails field to contacts

Revision ID: 004_alternate_emails
Revises: 003_photos
Create Date: 2026-02-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY


# revision identifiers, used by Alembic.
revision = '004_alternate_emails'
down_revision = '003_photos'
branch_labels = None
depends_on = None


def upgrade():
    # Add alternate_emails array field to contacts table
    op.add_column('contacts', sa.Column('alternate_emails', ARRAY(sa.String(255)), nullable=True))


def downgrade():
    # Remove alternate_emails field
    op.drop_column('contacts', 'alternate_emails')
