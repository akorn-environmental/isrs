#!/usr/bin/env python3
"""
Migration: Update directory opt-in defaults for existing users
Date: 2026-01-21
Description: Set directory_opt_in=true and sensible visibility defaults for all existing users
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

import asyncpg
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def run_migration():
    """Update directory defaults for existing users."""

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL environment variable not set")

    print("Connecting to database...")
    conn = await asyncpg.connect(database_url)

    try:
        print("\n=== Updating Directory Defaults for Existing Users ===\n")

        # Default visible fields - show professional info, hide personal
        default_visible_fields = {
            "organization": True,
            "position": True,
            "country": True,
            "city": True,
            "bio": True,
            "research_areas": True,
            "conference_history": False,
            "contact_email": False
        }

        # Update directory_opt_in to TRUE for all users
        print("1. Setting directory_opt_in=true for all users...")
        result = await conn.execute("""
            UPDATE attendee_profiles
            SET directory_opt_in = true
            WHERE directory_opt_in IS NULL OR directory_opt_in = false;
        """)
        rows_updated = int(result.split()[-1])
        print(f"   ✓ Updated {rows_updated} users to opt-in to directory")

        # Update directory_visible_fields with sensible defaults
        print("2. Setting default visible fields...")
        result = await conn.execute("""
            UPDATE attendee_profiles
            SET directory_visible_fields = $1::jsonb
            WHERE directory_visible_fields IS NULL
               OR directory_visible_fields = '{}'::jsonb;
        """, default_visible_fields)
        rows_updated = int(result.split()[-1])
        print(f"   ✓ Updated {rows_updated} users with default visibility settings")

        # Verify the update
        print("\n3. Verifying updates...")
        stats = await conn.fetchrow("""
            SELECT
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE directory_opt_in = true) as opted_in,
                COUNT(*) FILTER (WHERE directory_visible_fields != '{}') as has_visibility_settings
            FROM attendee_profiles;
        """)

        print(f"\n   Total users: {stats['total_users']}")
        print(f"   Opted into directory: {stats['opted_in']} ({stats['opted_in']*100//stats['total_users'] if stats['total_users'] > 0 else 0}%)")
        print(f"   With visibility settings: {stats['has_visibility_settings']}")

        print("\n=== Migration Complete! ===\n")
        print("All users are now opted into the member directory by default.")
        print("Default visible fields: organization, position, country, city, bio, research_areas")
        print("Users can customize these settings on their profile page.")

    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
        raise

    finally:
        await conn.close()
        print("\nDatabase connection closed.")

if __name__ == "__main__":
    asyncio.run(run_migration())
