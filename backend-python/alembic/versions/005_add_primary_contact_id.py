"""Add primary_contact_id to contacts

Revision ID: 005_primary_contact
Revises: 004_alternate_emails
Create Date: 2026-02-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision = '005_primary_contact'
down_revision = '004_alternate_emails'
branch_labels = None
depends_on = None


def upgrade():
    # Add primary_contact_id field to contacts table
    op.add_column('contacts', sa.Column('primary_contact_id', UUID(as_uuid=True), nullable=True))

    # Add foreign key constraint
    op.create_foreign_key(
        'fk_contacts_primary_contact_id',
        'contacts',
        'contacts',
        ['primary_contact_id'],
        ['id'],
        ondelete='SET NULL'
    )

    # Add index for performance
    op.create_index('ix_contacts_primary_contact_id', 'contacts', ['primary_contact_id'])


def downgrade():
    # Remove index
    op.drop_index('ix_contacts_primary_contact_id', 'contacts')

    # Remove foreign key
    op.drop_constraint('fk_contacts_primary_contact_id', 'contacts', type_='foreignkey')

    # Remove column
    op.drop_column('contacts', 'primary_contact_id')
