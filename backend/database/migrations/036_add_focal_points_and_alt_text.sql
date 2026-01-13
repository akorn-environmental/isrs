-- Migration 036: Add Focal Points and Alt Text to Photos
-- Created: 2026-01-13
-- Purpose: Enable responsive image cropping and enhanced accessibility

-- Add focal point columns for responsive cropping
ALTER TABLE photos ADD COLUMN IF NOT EXISTS focal_point_x DECIMAL(5,2) DEFAULT 50.00;
ALTER TABLE photos ADD COLUMN IF NOT EXISTS focal_point_y DECIMAL(5,2) DEFAULT 50.00;

-- Add explicit alt text column for accessibility
-- This is separate from ai_analysis to allow manual override
ALTER TABLE photos ADD COLUMN IF NOT EXISTS alt_text TEXT;

-- Add constraints to ensure focal points are percentages (0-100)
ALTER TABLE photos ADD CONSTRAINT focal_point_x_range
  CHECK (focal_point_x >= 0 AND focal_point_x <= 100);

ALTER TABLE photos ADD CONSTRAINT focal_point_y_range
  CHECK (focal_point_y >= 0 AND focal_point_y <= 100);

-- Add comments explaining the columns
COMMENT ON COLUMN photos.focal_point_x IS 'Focal point X coordinate as percentage from left (0-100). Used for responsive image cropping. Default is 50 (center).';
COMMENT ON COLUMN photos.focal_point_y IS 'Focal point Y coordinate as percentage from top (0-100). Used for responsive image cropping. Default is 50 (center).';
COMMENT ON COLUMN photos.alt_text IS 'General accessibility alt text for screen readers. Separate from AI analysis species data. Can be AI-generated or manually entered.';

-- Create index for focal point lookups
CREATE INDEX IF NOT EXISTS idx_photos_focal_point ON photos(focal_point_x, focal_point_y);

-- Report on migration
DO $$
DECLARE
  photo_count INTEGER;
  with_default_focal INTEGER;
BEGIN
  SELECT COUNT(*) INTO photo_count FROM photos;
  SELECT COUNT(*) INTO with_default_focal FROM photos WHERE focal_point_x = 50 AND focal_point_y = 50;

  RAISE NOTICE '✅ Migration 036 complete';
  RAISE NOTICE '   Total photos: %', photo_count;
  RAISE NOTICE '   Photos with default focal point (50, 50): %', with_default_focal;
  RAISE NOTICE '   New columns: focal_point_x, focal_point_y, alt_text';
END $$;
