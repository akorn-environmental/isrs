"""
Add user_feedback table for feedback widget

Run this in Render Shell: python migrations/add_user_feedback.py
"""
import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()


def run_migration():
    """Add user_feedback table to the database"""

    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        print("ERROR: DATABASE_URL not found in environment")
        return False

    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cur = conn.cursor()

        # Check if table already exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'user_feedback'
            );
        """)
        exists = cur.fetchone()[0]

        if exists:
            print("Table 'user_feedback' already exists. Skipping creation.")
            return True

        print("Creating user_feedback table...")

        # Create the table
        cur.execute("""
            CREATE TABLE user_feedback (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NULL,
                user_name VARCHAR(255) NULL,
                user_email VARCHAR(255) NULL,
                feedback_type VARCHAR(50) NOT NULL,
                message VARCHAR(5000) NOT NULL,
                page_url VARCHAR(500) NULL,
                page_title VARCHAR(255) NULL,
                component_name VARCHAR(100) NULL,
                is_admin_portal VARCHAR(10) DEFAULT 'false',
                status VARCHAR(50) DEFAULT 'new',
                reviewed_by UUID NULL,
                reviewed_at TIMESTAMP WITH TIME ZONE NULL,
                notes VARCHAR(2000) NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        """)
        print("  - Table created")

        # Create indexes
        cur.execute("CREATE INDEX idx_user_feedback_status ON user_feedback (status);")
        print("  - Index on status created")

        cur.execute("CREATE INDEX idx_user_feedback_type ON user_feedback (feedback_type);")
        print("  - Index on feedback_type created")

        cur.execute("CREATE INDEX idx_user_feedback_created_at ON user_feedback (created_at);")
        print("  - Index on created_at created")

        cur.execute("CREATE INDEX idx_user_feedback_user_id ON user_feedback (user_id);")
        print("  - Index on user_id created")

        cur.close()
        conn.close()

        print("\nMigration completed successfully!")
        return True

    except Exception as e:
        print(f"ERROR: Migration failed: {e}")
        return False


if __name__ == "__main__":
    success = run_migration()
    exit(0 if success else 1)
