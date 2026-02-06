"""Add AI extraction columns to parsed_emails table

Revision ID: 006_parsed_email_ai
Revises: 005_primary_contact
Create Date: 2026-02-06

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON

# revision identifiers, used by Alembic.
revision = '006_parsed_email_ai'
down_revision = '005_primary_contact'
branch_labels = None
depends_on = None


def upgrade():
    # Add extracted_contacts column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='parsed_emails' AND column_name='extracted_contacts'
            ) THEN
                ALTER TABLE parsed_emails ADD COLUMN extracted_contacts JSON;
            END IF;
        END $$;
    """)

    # Add action_items column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='parsed_emails' AND column_name='action_items'
            ) THEN
                ALTER TABLE parsed_emails ADD COLUMN action_items JSON;
            END IF;
        END $$;
    """)

    # Add topics column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='parsed_emails' AND column_name='topics'
            ) THEN
                ALTER TABLE parsed_emails ADD COLUMN topics JSON;
            END IF;
        END $$;
    """)

    # Add overall_confidence column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='parsed_emails' AND column_name='overall_confidence'
            ) THEN
                ALTER TABLE parsed_emails ADD COLUMN overall_confidence FLOAT;
            END IF;
        END $$;
    """)

    # Add email_metadata column if it doesn't exist
    op.execute("""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name='parsed_emails' AND column_name='email_metadata'
            ) THEN
                ALTER TABLE parsed_emails ADD COLUMN email_metadata JSON;
            END IF;
        END $$;
    """)


def downgrade():
    # Remove the columns
    op.drop_column('parsed_emails', 'email_metadata')
    op.drop_column('parsed_emails', 'overall_confidence')
    op.drop_column('parsed_emails', 'topics')
    op.drop_column('parsed_emails', 'action_items')
    op.drop_column('parsed_emails', 'extracted_contacts')
