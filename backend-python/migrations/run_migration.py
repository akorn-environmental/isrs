#!/usr/bin/env python3
"""
Migration runner for Asset Zones.
Run this in Render Shell: python migrations/run_migration.py
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
        # Step 1: Create assets table
        print("\n=== Step 1: Creating assets table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS assets (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                s3_key VARCHAR(512) NOT NULL UNIQUE,
                s3_url VARCHAR(1024) NOT NULL,
                file_type VARCHAR(100),
                file_size INTEGER,
                category VARCHAR(50) DEFAULT 'other',
                tags VARCHAR(500),
                description TEXT,
                uploaded_by UUID NOT NULL REFERENCES attendee_profiles(id),
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✓ assets table created/verified")

        # Create indexes for assets
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assets_s3_key ON assets(s3_key);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON assets(uploaded_by);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_assets_uploaded_at ON assets(uploaded_at);")
        print("✓ assets indexes created/verified")

        # Step 2: Create asset_zones table
        print("\n=== Step 2: Creating asset_zones table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS asset_zones (
                id SERIAL PRIMARY KEY,
                zone_id VARCHAR(100) NOT NULL,
                page_path VARCHAR(255) NOT NULL,
                zone_name VARCHAR(255),
                display_mode VARCHAR(50) DEFAULT 'single',
                configuration JSONB DEFAULT '{}',
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✓ asset_zones table created/verified")

        # Create indexes for asset_zones
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asset_zones_zone_id ON asset_zones(zone_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asset_zones_page_path ON asset_zones(page_path);")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_zones_unique ON asset_zones(zone_id, page_path);")
        print("✓ asset_zones indexes created/verified")

        # Step 3: Create asset_zone_assets junction table
        print("\n=== Step 3: Creating asset_zone_assets table ===")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS asset_zone_assets (
                id SERIAL PRIMARY KEY,
                zone_id INTEGER NOT NULL REFERENCES asset_zones(id) ON DELETE CASCADE,
                asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
                sort_order INTEGER DEFAULT 0,
                alt_text VARCHAR(500),
                caption TEXT,
                link_url VARCHAR(1024),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        print("✓ asset_zone_assets table created/verified")

        # Create indexes for asset_zone_assets
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asset_zone_assets_zone_id ON asset_zone_assets(zone_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_asset_zone_assets_asset_id ON asset_zone_assets(asset_id);")
        cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_zone_assets_unique ON asset_zone_assets(zone_id, asset_id);")
        print("✓ asset_zone_assets indexes created/verified")

        # Verify tables were created
        print("\n=== Verification ===")
        cursor.execute("""
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('assets', 'asset_zones', 'asset_zone_assets')
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()
        print(f"Tables created: {[t[0] for t in tables]}")

        print("\n✅ Migration completed successfully!")
        return True

    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        return False
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
