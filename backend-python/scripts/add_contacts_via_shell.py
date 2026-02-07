"""
Run this script via Render shell to add ICSR2024 contacts
Usage: python scripts/add_contacts_via_shell.py
"""
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, '/opt/render/project/src/backend-python')

from sqlalchemy import text
from app.database import SessionLocal

def run_sql_script():
    """Execute the SQL script to add contacts"""

    # Read SQL file
    sql_file_path = '/opt/render/project/src/backend-python/scripts/add_icsr2024_contacts.sql'

    try:
        with open(sql_file_path, 'r') as f:
            sql_script = f.read()
    except FileNotFoundError:
        print(f"Error: SQL file not found at {sql_file_path}")
        return

    db = SessionLocal()

    try:
        print("=" * 80)
        print("ADDING ICSR2024 CONTACTS TO DATABASE")
        print("=" * 80)
        print()

        # Execute the SQL script
        print("Executing SQL script...")
        result = db.execute(text(sql_script))

        # Fetch summary results
        summary = result.fetchall()

        if summary:
            print("\n✓ SQL Script Executed Successfully!")
            print("\nSummary:")
            print("-" * 80)
            row = summary[0]
            print(f"  Total contacts in query: {row[0]}")
            print(f"  ICSR2024 tagged: {row[1]}")
            print(f"  Planning committee: {row[2]}")
            print(f"  ICSR2026 interested: {row[3]}")

        db.commit()
        print("\n✓ Changes committed to database")
        print("=" * 80)
        print("COMPLETE")
        print("=" * 80)

    except Exception as e:
        print(f"\n✗ Error: {e}")
        db.rollback()
        print("Changes rolled back")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_sql_script()
