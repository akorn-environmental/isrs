#!/usr/bin/env python3
"""
Migration: Add contact_email to attendee_profiles
Purpose: Allow users to provide a separate contact email for public display
Run this in Render Shell: python migrations/add_contact_email.py
"""
import os
import psycopg2

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
        print("\n=== Adding contact_email column to attendee_profiles ===")

        # Check if column already exists
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'attendee_profiles'
            AND column_name = 'contact_email';
        """)

        if cursor.fetchone():
            print("✓ contact_email column already exists")
        else:
            # Add contact_email column
            cursor.execute("""
                ALTER TABLE attendee_profiles
                ADD COLUMN contact_email VARCHAR(255);
            """)
            print("✓ contact_email column added")

            # Add index for contact_email
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_attendee_profiles_contact_email
                ON attendee_profiles(contact_email);
            """)
            print("✓ contact_email index created")

        # Verify the column was added
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'attendee_profiles'
            AND column_name = 'contact_email';
        """)
        result = cursor.fetchone()
        if result:
            print(f"\n✅ Migration completed successfully!")
            print(f"   Column: {result[0]}")
            print(f"   Type: {result[1]}({result[2]})")
        else:
            print("\n❌ Migration verification failed")
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
