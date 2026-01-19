-- Migration: Add Focal Points and Accessibility Features to Assets
-- Run this SQL on the production database to add focal point and accessibility fields
-- Date: 2026-01-19

-- ============================================
-- Add focal point columns for responsive image cropping
-- ============================================
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS focal_point_x DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS focal_point_y DOUBLE PRECISION;

-- Add comments for documentation
COMMENT ON COLUMN assets.focal_point_x IS 'Focal point X coordinate (0-100, left to right) for responsive cropping';
COMMENT ON COLUMN assets.focal_point_y IS 'Focal point Y coordinate (0-100, top to bottom) for responsive cropping';

-- ============================================
-- Add accessibility and display columns
-- ============================================
ALTER TABLE assets
ADD COLUMN IF NOT EXISTS alt_text TEXT,
ADD COLUMN IF NOT EXISTS caption TEXT;

-- Add comments for documentation
COMMENT ON COLUMN assets.alt_text IS 'Alt text for accessibility (WCAG compliance)';
COMMENT ON COLUMN assets.caption IS 'Caption text for display with image';

-- ============================================
-- Add constraints for focal point values (0-100 range)
-- ============================================
ALTER TABLE assets
ADD CONSTRAINT check_focal_point_x_range CHECK (focal_point_x IS NULL OR (focal_point_x >= 0 AND focal_point_x <= 100)),
ADD CONSTRAINT check_focal_point_y_range CHECK (focal_point_y IS NULL OR (focal_point_y >= 0 AND focal_point_y <= 100));

-- ============================================
-- Set default focal points for existing assets (center: 50, 50)
-- ============================================
-- Optionally, you can set default focal points for existing image assets
-- UPDATE assets
-- SET focal_point_x = 50.0, focal_point_y = 50.0
-- WHERE category IN ('image', 'logo', 'headshot') AND focal_point_x IS NULL;

-- Migration complete!
