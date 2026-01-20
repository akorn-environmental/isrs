#!/usr/bin/env python3
"""
Migration: Add notification preferences to attendee_profiles
Purpose: Allow users to control which notifications they receive
Run this in Render Shell: python migrations/add_notification_preferences.py
"""
import os
import psycopg2
from psycopg2.extras import Json

def run_migration():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL environment variable not set")
        return False

    print("Connecting to database...")
    conn = psycopg2.connect(database_url)
    conn.autocommit = True
    cursor = conn.cursor()

    try:
        print("\n=== Adding notification preference columns to attendee_profiles ===")

        # Check if columns already exist
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'attendee_profiles'
            AND column_name IN ('notifications_enabled', 'notification_preferences');
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]

        # Add notifications_enabled (master switch)
        if 'notifications_enabled' not in existing_columns:
            cursor.execute("""
                ALTER TABLE attendee_profiles
                ADD COLUMN notifications_enabled BOOLEAN DEFAULT TRUE;
            """)
            print("✓ notifications_enabled column added")
        else:
            print("✓ notifications_enabled column already exists")

        # Add notification_preferences (JSONB for flexibility)
        if 'notification_preferences' not in existing_columns:
            cursor.execute("""
                ALTER TABLE attendee_profiles
                ADD COLUMN notification_preferences JSONB DEFAULT '{
                    "member_directory": true,
                    "conference_announcements": true,
                    "admin_announcements": true,
                    "direct_messages": true,
                    "digest_frequency": "off",
                    "admin_new_registrations": false,
                    "admin_moderation_alerts": false,
                    "admin_system_alerts": false
                }'::jsonb;
            """)
            print("✓ notification_preferences column added with defaults")

            # Create index for JSONB queries
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_attendee_profiles_notification_prefs
                ON attendee_profiles USING GIN (notification_preferences);
            """)
            print("✓ notification_preferences GIN index created")
        else:
            print("✓ notification_preferences column already exists")

        # Verify the columns were added
        cursor.execute("""
            SELECT
                column_name,
                data_type,
                column_default
            FROM information_schema.columns
            WHERE table_name = 'attendee_profiles'
            AND column_name IN ('notifications_enabled', 'notification_preferences')
            ORDER BY column_name;
        """)
        results = cursor.fetchall()

        if len(results) == 2:
            print(f"\n✅ Migration completed successfully!")
            for result in results:
                print(f"   Column: {result[0]}")
                print(f"   Type: {result[1]}")
                if result[2]:
                    default_display = result[2][:80] + "..." if len(result[2]) > 80 else result[2]
                    print(f"   Default: {default_display}")
                print()
        else:
            print(f"\n❌ Migration verification failed - expected 2 columns, found {len(results)}")
            return False

        return True

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    success = run_migration()
    exit(0 if success else 1)
