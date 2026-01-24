#!/usr/bin/env python3
"""
Fix photos table schema - add missing columns.

This migration ensures the photos table has all required columns that may
have been missed during initial creation (when create_all doesn't add
columns to existing tables).
"""
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

# Load environment variables
load_dotenv(Path(__file__).parent.parent / '.env')

DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set")
    sys.exit(1)

engine = create_engine(DATABASE_URL)


def get_existing_columns(table_name: str) -> set:
    """Get list of existing columns in a table."""
    inspector = inspect(engine)
    columns = inspector.get_columns(table_name)
    return {col['name'] for col in columns}


def add_column_if_missing(conn, table_name: str, column_name: str, column_def: str, existing_columns: set):
    """Add a column if it doesn't exist."""
    if column_name not in existing_columns:
        print(f"  Adding column: {column_name}")
        conn.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_def}"))
        return True
    else:
        print(f"  Column exists: {column_name}")
        return False


def main():
    print("=" * 60)
    print("PHOTOS TABLE SCHEMA FIX MIGRATION")
    print("=" * 60)

    # Check if photos table exists
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if 'photos' not in tables:
        print("Photos table does not exist - nothing to fix.")
        print("The table will be created with correct schema on app startup.")
        return

    existing_columns = get_existing_columns('photos')
    print(f"\nExisting columns: {len(existing_columns)}")

    with engine.begin() as conn:
        changes = 0

        # Core columns from migration 003
        print("\n--- Core Photo Columns ---")

        if add_column_if_missing(conn, 'photos', 'filename',
            "VARCHAR(255) NOT NULL DEFAULT ''", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'original_filename',
            "VARCHAR(255) NOT NULL DEFAULT ''", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 's3_key',
            "VARCHAR(512) NOT NULL DEFAULT ''", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 's3_url',
            "VARCHAR(1024) NOT NULL DEFAULT ''", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'thumbnail_s3_key',
            "VARCHAR(512)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'thumbnail_url',
            "VARCHAR(1024)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'mime_type',
            "VARCHAR(100) NOT NULL DEFAULT ''", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'file_size',
            "INTEGER NOT NULL DEFAULT 0", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'sha1_hash',
            "VARCHAR(40)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'width',
            "INTEGER", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'height',
            "INTEGER", existing_columns):
            changes += 1

        # Attribution columns
        print("\n--- Attribution Columns ---")

        if add_column_if_missing(conn, 'photos', 'photographer_name',
            "VARCHAR(255)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'photographer_email',
            "VARCHAR(255)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'copyright_holder',
            "VARCHAR(255)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'license_type',
            "VARCHAR(50) DEFAULT 'All Rights Reserved'", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'license_url',
            "VARCHAR(512)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'attribution_required',
            "BOOLEAN DEFAULT TRUE", existing_columns):
            changes += 1

        # AI analysis columns
        print("\n--- AI Analysis Columns ---")

        if add_column_if_missing(conn, 'photos', 'ai_analysis',
            "JSONB", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'ai_processed',
            "BOOLEAN DEFAULT FALSE", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'ai_processed_at',
            "TIMESTAMP WITH TIME ZONE", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'species_identified',
            "VARCHAR(255)[]", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'habitat_type',
            "VARCHAR(50)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'restoration_technique',
            "VARCHAR(50)", existing_columns):
            changes += 1

        # Location columns
        print("\n--- Location Columns ---")

        if add_column_if_missing(conn, 'photos', 'location_name',
            "VARCHAR(255)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'gps_latitude',
            "DOUBLE PRECISION", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'gps_longitude',
            "DOUBLE PRECISION", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'country',
            "VARCHAR(100)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'state_province',
            "VARCHAR(100)", existing_columns):
            changes += 1

        # Approval workflow columns (from migration 004)
        print("\n--- Approval Workflow Columns ---")

        if add_column_if_missing(conn, 'photos', 'approval_status',
            "VARCHAR(20) DEFAULT 'pending' NOT NULL", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'approval_notes',
            "TEXT", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'approved_by',
            "UUID REFERENCES attendee_profiles(id)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'approved_at',
            "TIMESTAMP WITH TIME ZONE", existing_columns):
            changes += 1

        # Legal consent columns
        print("\n--- Legal Consent Columns ---")

        if add_column_if_missing(conn, 'photos', 'usage_rights_agreed',
            "BOOLEAN DEFAULT FALSE NOT NULL", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'liability_waiver_agreed',
            "BOOLEAN DEFAULT FALSE NOT NULL", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'consent_timestamp',
            "TIMESTAMP WITH TIME ZONE", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'consent_ip_address',
            "VARCHAR(45)", existing_columns):
            changes += 1

        # Video support columns
        print("\n--- Video Support Columns ---")

        if add_column_if_missing(conn, 'photos', 'media_type',
            "VARCHAR(20) DEFAULT 'photo' NOT NULL", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'duration_seconds',
            "INTEGER", existing_columns):
            changes += 1

        # Additional columns
        print("\n--- Additional Columns ---")

        if add_column_if_missing(conn, 'photos', 'caption',
            "TEXT", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'description',
            "TEXT", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'taken_at',
            "TIMESTAMP WITH TIME ZONE", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'project_name',
            "VARCHAR(255)", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'alt_text',
            "TEXT", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'focal_point_x',
            "DOUBLE PRECISION", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'focal_point_y',
            "DOUBLE PRECISION", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'is_public',
            "BOOLEAN DEFAULT FALSE", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'is_featured',
            "BOOLEAN DEFAULT FALSE", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'status',
            "VARCHAR(20) DEFAULT 'active'", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'tags',
            "VARCHAR(255)[]", existing_columns):
            changes += 1

        # Relationship columns
        print("\n--- Relationship Columns ---")

        if add_column_if_missing(conn, 'photos', 'uploaded_by',
            "UUID REFERENCES attendee_profiles(id) NOT NULL", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'uploaded_at',
            "TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'conference_id',
            "UUID REFERENCES conferences(id)", existing_columns):
            changes += 1

        # Timestamps
        print("\n--- Timestamp Columns ---")

        if add_column_if_missing(conn, 'photos', 'created_at',
            "TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL", existing_columns):
            changes += 1

        if add_column_if_missing(conn, 'photos', 'updated_at',
            "TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL", existing_columns):
            changes += 1

        # Create indexes if they don't exist
        print("\n--- Creating Indexes ---")

        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_photos_s3_key ON photos(s3_key)"
            ))
            print("  Created index: idx_photos_s3_key")
        except Exception as e:
            print(f"  Index idx_photos_s3_key may already exist: {e}")

        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_photos_sha1_hash ON photos(sha1_hash)"
            ))
            print("  Created index: idx_photos_sha1_hash")
        except Exception as e:
            print(f"  Index idx_photos_sha1_hash may already exist: {e}")

        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_photos_approval_status ON photos(approval_status)"
            ))
            print("  Created index: idx_photos_approval_status")
        except Exception as e:
            print(f"  Index idx_photos_approval_status may already exist: {e}")

        try:
            conn.execute(text(
                "CREATE INDEX IF NOT EXISTS idx_photos_media_type ON photos(media_type)"
            ))
            print("  Created index: idx_photos_media_type")
        except Exception as e:
            print(f"  Index idx_photos_media_type may already exist: {e}")

    print("\n" + "=" * 60)
    print(f"MIGRATION COMPLETE - {changes} columns added")
    print("=" * 60)


if __name__ == '__main__':
    main()
