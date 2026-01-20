#!/usr/bin/env python3
"""
Fix database user login permission by connecting as the database owner.
Run this script once to grant LOGIN permission to isrs_user.
"""
import os
from sqlalchemy import create_engine, text

# Get the current DATABASE_URL
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("ERROR: DATABASE_URL not set")
    exit(1)

print(f"Current DATABASE_URL user: {DATABASE_URL.split('@')[0].split('//')[-1].split(':')[0]}")

# The DATABASE_URL uses isrs_user which can't login
# We need the INTERNAL database URL with the owner user
# This should be in Render environment as DATABASE_URL (internal)

# Try to connect and grant permission
try:
    # Parse the URL to get connection details
    # postgresql://user:pass@host:port/dbname
    parts = DATABASE_URL.replace('postgresql://', '').replace('postgresql+asyncpg://', '')
    userpass, hostdb = parts.split('@')
    user, password = userpass.split(':')
    host_port, dbname = hostdb.split('/')
    host = host_port.split(':')[0]

    print(f"\nAttempting to connect...")
    print(f"  Host: {host}")
    print(f"  Database: {dbname}")
    print(f"  User: {user}")

    # Try to connect
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Check current status
        result = conn.execute(text(
            "SELECT rolname, rolcanlogin FROM pg_roles WHERE rolname = 'isrs_user'"
        ))
        row = result.fetchone()

        if row:
            print(f"\n✓ Found role: {row[0]}")
            print(f"  Can login: {row[1]}")

            if not row[1]:  # If can't login
                print("\n→ Granting LOGIN permission...")
                conn.execute(text("ALTER ROLE isrs_user WITH LOGIN"))
                conn.commit()
                print("✓ LOGIN permission granted!")

                # Verify
                result = conn.execute(text(
                    "SELECT rolcanlogin FROM pg_roles WHERE rolname = 'isrs_user'"
                ))
                can_login = result.fetchone()[0]
                print(f"✓ Verified: isrs_user can now login = {can_login}")
            else:
                print("✓ isrs_user already has LOGIN permission")
        else:
            print("\n✗ Role 'isrs_user' not found in database")
            print("→ Listing all roles:")
            result = conn.execute(text("SELECT rolname FROM pg_roles ORDER BY rolname"))
            for row in result:
                print(f"  - {row[0]}")

    print("\n✅ Done!")

except Exception as e:
    print(f"\n✗ Error: {e}")
    print("\nThis script needs to run with database owner credentials.")
    print("\nSOLUTION:")
    print("1. Go to Render Dashboard → Your Database")
    print("2. Copy the 'Internal Database URL' (has owner credentials)")
    print("3. Run this script with that URL:")
    print("   DATABASE_URL='<internal-url>' python fix_db_user.py")
    exit(1)
