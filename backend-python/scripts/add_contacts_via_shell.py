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

        # Split SQL into statements - execute INSERT/UPDATE, then SELECT
        statements = sql_script.split(';')

        # Execute all statements except the last empty one
        print("Executing INSERT statements...")
        for i, stmt in enumerate(statements[:-1]):  # Skip last empty statement
            stmt = stmt.strip()
            if stmt and not stmt.startswith('--'):
                if stmt.upper().startswith('SELECT'):
                    # This is the summary query
                    print("\nFetching summary...")
                    result = db.execute(text(stmt))
                    summary = result.fetchall()
                    if summary:
                        print("\n✓ Contacts Added Successfully!")
                        print("\nSummary:")
                        print("-" * 80)
                        row = summary[0]
                        print(f"  Total contacts: {row[0]}")
                        print(f"  ICSR2024 tagged: {row[1]}")
                        print(f"  Planning committee: {row[2]}")
                        print(f"  ICSR2026 interested: {row[3]}")
                else:
                    # Execute INSERT/UPDATE/COMMIT statements
                    db.execute(text(stmt))

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
