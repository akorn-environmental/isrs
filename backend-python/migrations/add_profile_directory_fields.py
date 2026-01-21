#!/usr/bin/env python3
"""
Migration: Add profile directory and research fields to attendee_profiles
Date: 2026-01-21
Description: Adds research_areas, expertise_keywords, website, linkedin_url, orcid,
             directory_opt_in, and directory_visible_fields to support member directory
"""

import os
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncpg
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def run_migration():
    """Add profile directory and research fields to attendee_profiles table."""

    # Connect to database
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")

    # Convert postgresql:// to postgresql:// for asyncpg
    if database_url.startswith("postgresql://"):
        database_url = database_url

    print("Connecting to database...")
    conn = await asyncpg.connect(database_url)

    try:
        print("\n=== Starting Profile Directory Fields Migration ===\n")

        # Add research_areas column
        print("1. Adding research_areas column...")
        await conn.execute("""
            ALTER TABLE attendee_profiles
            ADD COLUMN IF NOT EXISTS research_areas TEXT;
        """)
        print("   ✓ research_areas added")

        # Add expertise_keywords column
        print("2. Adding expertise_keywords column...")
        await conn.execute("""
            ALTER TABLE attendee_profiles
            ADD COLUMN IF NOT EXISTS expertise_keywords TEXT;
        """)
        print("   ✓ expertise_keywords added")

        # Add website column
        print("3. Adding website column...")
        await conn.execute("""
            ALTER TABLE attendee_profiles
            ADD COLUMN IF NOT EXISTS website TEXT;
        """)
        print("   ✓ website added")

        # Add linkedin_url column
        print("4. Adding linkedin_url column...")
        await conn.execute("""
            ALTER TABLE attendee_profiles
            ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
        """)
        print("   ✓ linkedin_url added")

        # Add orcid column
        print("5. Adding orcid column...")
        await conn.execute("""
            ALTER TABLE attendee_profiles
            ADD COLUMN IF NOT EXISTS orcid VARCHAR(19);
        """)
        print("   ✓ orcid added")

        # Add directory_opt_in column
        print("6. Adding directory_opt_in column...")
        await conn.execute("""
            ALTER TABLE attendee_profiles
            ADD COLUMN IF NOT EXISTS directory_opt_in BOOLEAN DEFAULT FALSE;
        """)
        print("   ✓ directory_opt_in added (default: false)")

        # Add directory_visible_fields column
        print("7. Adding directory_visible_fields column...")
        await conn.execute("""
            ALTER TABLE attendee_profiles
            ADD COLUMN IF NOT EXISTS directory_visible_fields JSONB DEFAULT '{}';
        """)
        print("   ✓ directory_visible_fields added (default: {})")

        # Add index on directory_opt_in for faster directory queries
        print("8. Adding index on directory_opt_in...")
        await conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_attendee_profiles_directory_opt_in
            ON attendee_profiles(directory_opt_in)
            WHERE directory_opt_in = true;
        """)
        print("   ✓ Index created on directory_opt_in")

        # Verify columns were added
        print("\n9. Verifying columns...")
        columns = await conn.fetch("""
            SELECT column_name, data_type, column_default
            FROM information_schema.columns
            WHERE table_name = 'attendee_profiles'
            AND column_name IN (
                'research_areas', 'expertise_keywords', 'website',
                'linkedin_url', 'orcid', 'directory_opt_in', 'directory_visible_fields'
            )
            ORDER BY column_name;
        """)

        print("\n   Columns added:")
        for col in columns:
            default = col['column_default'] or 'NULL'
            print(f"   - {col['column_name']:30s} {col['data_type']:15s} (default: {default})")

        print(f"\n   ✓ All {len(columns)} columns verified")

        # Count profiles
        count = await conn.fetchval("SELECT COUNT(*) FROM attendee_profiles")
        print(f"\n   Total profiles: {count}")

        print("\n=== Migration Complete! ===\n")
        print("Summary:")
        print("- Added 7 new columns to attendee_profiles")
        print("- Added index on directory_opt_in for performance")
        print("- All existing profiles default to directory_opt_in=false")
        print("- Users can now opt-in to member directory and customize visibility")

    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        raise

    finally:
        await conn.close()
        print("\nDatabase connection closed.")

if __name__ == "__main__":
    asyncio.run(run_migration())
