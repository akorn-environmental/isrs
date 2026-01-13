-- Migration 037: Create Asset Zones System
-- Created: 2026-01-13
-- Purpose: Enable zone-based photo assignments for page-specific display
-- Adapted from: akorn asset zones system (modified for ISRS UUID-based photos)

-- Asset zones table: Defines zones on pages where photos can be displayed
CREATE TABLE IF NOT EXISTS asset_zones (
  id SERIAL PRIMARY KEY,
  zone_id VARCHAR(100) UNIQUE NOT NULL,
  page_path VARCHAR(255) NOT NULL,
  zone_name VARCHAR(100) NOT NULL,
  display_mode VARCHAR(50) DEFAULT 'single' CHECK (display_mode IN ('single', 'slideshow', 'grid', 'lightbox')),
  max_assets INTEGER DEFAULT 1,
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES attendee_profiles(id) ON DELETE SET NULL,

  CONSTRAINT unique_zone_id UNIQUE (zone_id),
  CONSTRAINT unique_zone_per_page UNIQUE (page_path, zone_name)
);

-- Asset zone assignments table: Maps photos to zones with display order
-- CRITICAL: Uses photo_id UUID (not asset_id INTEGER) to match ISRS photos table
CREATE TABLE IF NOT EXISTS asset_zone_assignments (
  id SERIAL PRIMARY KEY,
  zone_id VARCHAR(100) NOT NULL REFERENCES asset_zones(zone_id) ON DELETE CASCADE,
  photo_id UUID NOT NULL REFERENCES photos(id) ON DELETE CASCADE,  -- UUID not INTEGER!
  display_order INTEGER DEFAULT 0,
  configuration JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES attendee_profiles(id) ON DELETE SET NULL,

  CONSTRAINT unique_photo_per_zone UNIQUE (zone_id, photo_id)
);

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS idx_asset_zones_page_path ON asset_zones(page_path);
CREATE INDEX IF NOT EXISTS idx_asset_zones_is_active ON asset_zones(is_active);
CREATE INDEX IF NOT EXISTS idx_asset_zone_assignments_zone_id ON asset_zone_assignments(zone_id);
CREATE INDEX IF NOT EXISTS idx_asset_zone_assignments_photo_id ON asset_zone_assignments(photo_id);
CREATE INDEX IF NOT EXISTS idx_asset_zone_assignments_order ON asset_zone_assignments(zone_id, display_order);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic updated_at updates
DROP TRIGGER IF EXISTS asset_zones_updated_at ON asset_zones;
CREATE TRIGGER asset_zones_updated_at
  BEFORE UPDATE ON asset_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS asset_zone_assignments_updated_at ON asset_zone_assignments;
CREATE TRIGGER asset_zone_assignments_updated_at
  BEFORE UPDATE ON asset_zone_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comments explaining the tables
COMMENT ON TABLE asset_zones IS 'Defines zones on pages where photos can be displayed with specific configurations (single, slideshow, grid, lightbox)';
COMMENT ON TABLE asset_zone_assignments IS 'Maps photos to zones with display order. Uses UUID photo_id to reference ISRS photos table.';
COMMENT ON COLUMN asset_zone_assignments.photo_id IS 'UUID reference to photos table (adapted from akorn integer asset_id)';
COMMENT ON COLUMN asset_zones.display_mode IS 'How photos display: single (one photo), slideshow (auto-rotating), grid (multiple photos), lightbox (clickable thumbnails)';
COMMENT ON COLUMN asset_zones.configuration IS 'JSON configuration for display mode (e.g., {autoAdvance: 5000, columns: 3})';
COMMENT ON COLUMN asset_zone_assignments.display_order IS 'Order photos display within zone (0-indexed, lower numbers first)';

-- Report on migration
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 037 complete';
  RAISE NOTICE '   Created tables: asset_zones, asset_zone_assignments';
  RAISE NOTICE '   Created indexes for efficient lookups';
  RAISE NOTICE '   Created triggers for automatic updated_at';
  RAISE NOTICE '   Key adaptation: Uses UUID photo_id (not INTEGER asset_id)';
END $$;
