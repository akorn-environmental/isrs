#!/usr/bin/env python3
"""
Migration: Add address, zip_code, and state to attendee_profiles
Purpose: Support full address collection with ZIP code auto-population
Run this in Render Shell: python migrations/add_address_fields.py
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
        print("\n=== Adding address fields to attendee_profiles ===")

        # Check which columns already exist
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = 'attendee_profiles'
            AND column_name IN ('address', 'zip_code', 'state');
        """)
        existing_columns = [row[0] for row in cursor.fetchall()]

        # Add address column
        if 'address' not in existing_columns:
            cursor.execute("""
                ALTER TABLE attendee_profiles
                ADD COLUMN address VARCHAR(500);
            """)
            print("✓ address column added")
        else:
            print("✓ address column already exists")

        # Add zip_code column
        if 'zip_code' not in existing_columns:
            cursor.execute("""
                ALTER TABLE attendee_profiles
                ADD COLUMN zip_code VARCHAR(20);
            """)
            print("✓ zip_code column added")

            # Add index for ZIP lookups
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_attendee_profiles_zip_code
                ON attendee_profiles(zip_code);
            """)
            print("✓ zip_code index created")
        else:
            print("✓ zip_code column already exists")

        # Add state column
        if 'state' not in existing_columns:
            cursor.execute("""
                ALTER TABLE attendee_profiles
                ADD COLUMN state VARCHAR(100);
            """)
            print("✓ state column added")
        else:
            print("✓ state column already exists")

        # Verify the columns were added
        cursor.execute("""
            SELECT
                column_name,
                data_type,
                character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'attendee_profiles'
            AND column_name IN ('address', 'zip_code', 'state')
            ORDER BY column_name;
        """)
        results = cursor.fetchall()

        if len(results) == 3:
            print(f"\n✅ Migration completed successfully!")
            for result in results:
                print(f"   Column: {result[0]}")
                print(f"   Type: {result[1]}({result[2]})")
        else:
            print(f"\n❌ Migration verification failed - expected 3 columns, found {len(results)}")
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
