#!/usr/bin/env python3
"""
Add admin user to ISRS production database
"""

import os
import sys
from datetime import datetime
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import DictCursor

# Load environment variables
load_dotenv()

def add_admin_user(email, first_name="Aaron", last_name="Kornbluth"):
    """Add an admin user to the database"""

    # Get database URL from environment
    database_url = os.getenv('DATABASE_URL')

    if not database_url:
        print("❌ ERROR: DATABASE_URL not found in .env file")
        return False

    try:
        # Connect to database
        print(f"🔌 Connecting to database...")
        conn = psycopg2.connect(database_url)
        cursor = conn.cursor(cursor_factory=DictCursor)

        # Check if users table exists
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_schema = 'public'
                AND table_name = 'users'
            );
        """)

        table_exists = cursor.fetchone()[0]

        if not table_exists:
            print("❌ ERROR: 'users' table does not exist!")
            print("   You may need to run database migrations first")
            return False

        # Check if user already exists
        cursor.execute("SELECT id, email FROM users WHERE email = %s", (email,))
        existing_user = cursor.fetchone()

        if existing_user:
            print(f"✅ User already exists: {existing_user['email']}")
            print(f"   User ID: {existing_user['id']}")

            # Update to make sure they're an admin
            cursor.execute("""
                UPDATE users
                SET is_admin = TRUE,
                    is_active = TRUE,
                    updated_at = NOW()
                WHERE email = %s
            """, (email,))

            conn.commit()
            print(f"✅ Updated user to admin status")
            return True

        # Create new user
        print(f"➕ Creating new user: {email}")

        cursor.execute("""
            INSERT INTO users (
                email,
                first_name,
                last_name,
                is_admin,
                is_active,
                created_at,
                updated_at
            )
            VALUES (%s, %s, %s, TRUE, TRUE, NOW(), NOW())
            RETURNING id, email
        """, (email, first_name, last_name))

        new_user = cursor.fetchone()
        conn.commit()

        print(f"✅ User created successfully!")
        print(f"   User ID: {new_user['id']}")
        print(f"   Email: {new_user['email']}")
        print(f"   Admin: True")
        print(f"   Active: True")

        cursor.close()
        conn.close()

        return True

    except psycopg2.Error as e:
        print(f"❌ Database error: {e}")
        return False

    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 64)
    print("ADD ADMIN USER TO ISRS DATABASE")
    print("=" * 64)
    print()

    # Email to add
    email = "aaron.kornbluth@gmail.com"

    success = add_admin_user(email)

    print()
    print("=" * 64)

    if success:
        print("✅ SUCCESS - You can now login with magic link!")
        print()
        print("Next steps:")
        print("  1. Go to: https://www.shellfish-society.org/login.html")
        print("  2. Enter your email: aaron.kornbluth@gmail.com")
        print("  3. Click 'Send Magic Link'")
        print("  4. Check your email for the login link")
    else:
        print("❌ FAILED - Could not add user")
        print()
        print("Possible issues:")
        print("  1. Database migrations not run (tables don't exist)")
        print("  2. Database connection issues")
        print("  3. Permission issues")

    print("=" * 64)

    sys.exit(0 if success else 1)
