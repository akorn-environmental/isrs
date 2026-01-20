#!/usr/bin/env python3
"""
Migration runner for Abstract Review and Event Management tables.
Run this in Render Shell: python migrations/run_abstract_review_migration.py
"""
import os
import psycopg2
from psycopg2 import sql

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
        # 1. Create abstract_reviewers table
        print("\n=== Step 1: Creating abstract_reviewers table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS abstract_reviewers (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                abstract_id UUID NOT NULL REFERENCES conference_abstracts(id) ON DELETE CASCADE,
                reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                assigned_by UUID REFERENCES users(id),
                status VARCHAR(50) DEFAULT 'pending',
                notified_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UNIQUE(abstract_id, reviewer_id)
            );
        """)
        print("✓ abstract_reviewers table created/verified")

        # Create indexes for abstract_reviewers
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_abstract_reviewers_abstract ON abstract_reviewers(abstract_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_abstract_reviewers_reviewer ON abstract_reviewers(reviewer_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_abstract_reviewers_status ON abstract_reviewers(status);")
        print("✓ abstract_reviewers indexes created/verified")

        # 2. Create abstract_reviews table
        print("\n=== Step 2: Creating abstract_reviews table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS abstract_reviews (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                abstract_id UUID NOT NULL REFERENCES conference_abstracts(id) ON DELETE CASCADE,
                reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5),
                originality_score INTEGER CHECK (originality_score BETWEEN 1 AND 5),
                methodology_score INTEGER CHECK (methodology_score BETWEEN 1 AND 5),
                clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5),
                impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
                weighted_score DECIMAL(5,2),
                strengths TEXT,
                weaknesses TEXT,
                comments TEXT,
                recommendation VARCHAR(50),
                submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UNIQUE(abstract_id, reviewer_id)
            );
        """)
        print("✓ abstract_reviews table created/verified")

        # Create indexes for abstract_reviews
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_abstract_reviews_abstract ON abstract_reviews(abstract_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_abstract_reviews_reviewer ON abstract_reviews(reviewer_id);")
        print("✓ abstract_reviews indexes created/verified")

        # 3. Create abstract_decisions table
        print("\n=== Step 3: Creating abstract_decisions table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS abstract_decisions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                abstract_id UUID NOT NULL REFERENCES conference_abstracts(id) ON DELETE CASCADE,
                decision VARCHAR(50) NOT NULL,
                decided_by UUID NOT NULL REFERENCES users(id),
                decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                average_score DECIMAL(5,2),
                review_count INTEGER,
                notes TEXT,
                notified_at TIMESTAMP WITH TIME ZONE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        """)
        print("✓ abstract_decisions table created/verified")

        # Create indexes for abstract_decisions
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_abstract_decisions_abstract ON abstract_decisions(abstract_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_abstract_decisions_decision ON abstract_decisions(decision);")
        print("✓ abstract_decisions indexes created/verified")

        # 4. Create review_criteria table
        print("\n=== Step 4: Creating review_criteria table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS review_criteria (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
                display_order INTEGER NOT NULL DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UNIQUE(conference_id, name)
            );
        """)
        print("✓ review_criteria table created/verified")

        # 5. Create conference_events table
        print("\n=== Step 5: Creating conference_events table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conference_events (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                event_type VARCHAR(50) NOT NULL,
                event_date TIMESTAMP WITH TIME ZONE,
                capacity INTEGER,
                current_signups INTEGER DEFAULT 0 NOT NULL,
                allows_guests BOOLEAN DEFAULT FALSE NOT NULL,
                fee_per_person DECIMAL(10,2) DEFAULT 0 NOT NULL,
                status VARCHAR(50) DEFAULT 'open' NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        """)
        print("✓ conference_events table created/verified")

        # Create indexes for conference_events
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conference_events_conference ON conference_events(conference_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_conference_events_type ON conference_events(event_type);")
        print("✓ conference_events indexes created/verified")

        # 6. Create event_signups table
        print("\n=== Step 6: Creating event_signups table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS event_signups (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                event_id UUID NOT NULL REFERENCES conference_events(id) ON DELETE CASCADE,
                user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                guest_count INTEGER DEFAULT 0 NOT NULL,
                total_fee DECIMAL(10,2) DEFAULT 0 NOT NULL,
                status VARCHAR(50) DEFAULT 'confirmed' NOT NULL,
                waitlist_position INTEGER,
                signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
                UNIQUE(event_id, user_id)
            );
        """)
        print("✓ event_signups table created/verified")

        # Create indexes for event_signups
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_event_signups_event ON event_signups(event_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_event_signups_user ON event_signups(user_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_event_signups_status ON event_signups(status);")
        print("✓ event_signups indexes created/verified")

        # Verify tables were created
        print("\n=== Verification ===")
        cursor.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN (
                'abstract_reviewers', 'abstract_reviews', 'abstract_decisions',
                'review_criteria', 'conference_events', 'event_signups'
            )
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print(f"Tables created: {[t[0] for t in tables]}")

        print("\n✅ Migration completed successfully!")
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
