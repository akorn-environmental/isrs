-- Migration: Add Assets and Asset Zones tables
-- Run this SQL on the production database to add asset management and zone functionality

-- ============================================
-- STEP 1: Create assets table (required first)
-- ============================================
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
    uploaded_by INTEGER NOT NULL REFERENCES attendee_profiles(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for assets
CREATE INDEX IF NOT EXISTS idx_assets_s3_key ON assets(s3_key);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_by ON assets(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_assets_uploaded_at ON assets(uploaded_at);

-- Add comment for documentation
COMMENT ON TABLE assets IS 'Asset storage for uploaded files (images, documents, videos)';

-- ============================================
-- STEP 2: Create asset_zones table
-- ============================================

-- Create asset_zones table
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

-- Create indexes for asset_zones
CREATE INDEX IF NOT EXISTS idx_asset_zones_zone_id ON asset_zones(zone_id);
CREATE INDEX IF NOT EXISTS idx_asset_zones_page_path ON asset_zones(page_path);
CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_zones_unique ON asset_zones(zone_id, page_path);

-- Create asset_zone_assets junction table
CREATE TABLE IF NOT EXISTS asset_zone_assets (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER NOT NULL REFERENCES asset_zones(id) ON DELETE CASCADE,
    asset_id INTEGER NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    alt_text VARCHAR(500),
    caption TEXT,
    link_url VARCHAR(1024),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create indexes for asset_zone_assets
CREATE INDEX IF NOT EXISTS idx_asset_zone_assets_zone_id ON asset_zone_assets(zone_id);
CREATE INDEX IF NOT EXISTS idx_asset_zone_assets_asset_id ON asset_zone_assets(asset_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_asset_zone_assets_unique ON asset_zone_assets(zone_id, asset_id);

-- Add comments for documentation
COMMENT ON TABLE asset_zones IS 'Asset zones for managing page-specific image/media locations';
COMMENT ON TABLE asset_zone_assets IS 'Junction table linking assets to zones with ordering';
COMMENT ON COLUMN asset_zones.zone_id IS 'Unique identifier for the zone (e.g., home-hero)';
COMMENT ON COLUMN asset_zones.page_path IS 'URL path where zone appears (e.g., / or /about)';
COMMENT ON COLUMN asset_zones.display_mode IS 'Display mode: single, slideshow, gallery';
COMMENT ON COLUMN asset_zones.configuration IS 'Zone-specific config (transition, speed, objectFit, etc.)';
