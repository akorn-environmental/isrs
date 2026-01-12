-- Migration 035: Photo Upload System with AI Analysis
-- Created: 2025-01-17
-- Comprehensive photo management with Claude AI, metadata, and licensing

-- Photo storage table
CREATE TABLE IF NOT EXISTS photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User association
  attendee_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,

  -- File information
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,          -- Full resolution path/URL
  thumbnail_path TEXT,               -- Thumbnail path/URL
  mime_type VARCHAR(100) NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  sha1_hash VARCHAR(40) UNIQUE,     -- For deduplication

  -- Basic metadata
  caption TEXT,
  description TEXT,
  taken_at TIMESTAMP,                -- When photo was taken
  uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,

  -- Location data
  location_name VARCHAR(255),
  gps_latitude DECIMAL(10, 8),
  gps_longitude DECIMAL(11, 8),
  country VARCHAR(100),
  state_province VARCHAR(100),

  -- Project/Conference association
  project_name VARCHAR(255),
  conference_id UUID REFERENCES conference_editions(id) ON DELETE SET NULL,

  -- Copyright & licensing
  photographer_name VARCHAR(255),
  photographer_email VARCHAR(255),
  copyright_holder VARCHAR(255),
  license_type VARCHAR(50),          -- 'CC-BY', 'CC-BY-SA', 'CC-BY-NC', 'CC0', 'All Rights Reserved', etc.
  license_url TEXT,
  usage_rights TEXT,
  attribution_required BOOLEAN DEFAULT true,

  -- AI Analysis (Claude)
  ai_analysis JSONB,                 -- {species, description, keywords, confidence, etc.}
  ai_processed BOOLEAN DEFAULT false,
  ai_processed_at TIMESTAMP,

  -- Species & habitat (from AI or manual)
  species_identified TEXT[],         -- Array of species names
  habitat_type VARCHAR(100),         -- 'intertidal', 'subtidal', 'estuary', etc.
  restoration_technique VARCHAR(100), -- 'reef construction', 'spat collection', etc.

  -- Visibility & status
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'archived', 'flagged', 'deleted'

  -- Tags
  tags TEXT[],                       -- Manual tags

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Photo metadata history (for tracking edits)
CREATE TABLE IF NOT EXISTS photo_metadata_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  changed_by_user_id UUID REFERENCES attendee_profiles(id) ON DELETE SET NULL,
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Photo likes/favorites
CREATE TABLE IF NOT EXISTS photo_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);

-- Photo collections/albums
CREATE TABLE IF NOT EXISTS photo_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Photos in collections (many-to-many)
CREATE TABLE IF NOT EXISTS collection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID REFERENCES photo_collections(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES photos(id) ON DELETE CASCADE NOT NULL,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(collection_id, photo_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_photos_attendee ON photos(attendee_id);
CREATE INDEX IF NOT EXISTS idx_photos_conference ON photos(conference_id);
CREATE INDEX IF NOT EXISTS idx_photos_taken_at ON photos(taken_at);
CREATE INDEX IF NOT EXISTS idx_photos_is_public ON photos(is_public);
CREATE INDEX IF NOT EXISTS idx_photos_is_featured ON photos(is_featured);
CREATE INDEX IF NOT EXISTS idx_photos_sha1 ON photos(sha1_hash);
CREATE INDEX IF NOT EXISTS idx_photos_license ON photos(license_type);
CREATE INDEX IF NOT EXISTS idx_photos_species ON photos USING GIN(species_identified);
CREATE INDEX IF NOT EXISTS idx_photos_tags ON photos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_photos_ai_analysis ON photos USING GIN(ai_analysis);
CREATE INDEX IF NOT EXISTS idx_photo_likes_user ON photo_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_photo_likes_photo ON photo_likes(photo_id);
CREATE INDEX IF NOT EXISTS idx_collections_owner ON photo_collections(owner_id);

-- Full text search on captions and descriptions
CREATE INDEX IF NOT EXISTS idx_photos_search ON photos USING GIN(
  to_tsvector('english', COALESCE(caption, '') || ' ' || COALESCE(description, '') || ' ' || COALESCE(project_name, ''))
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_photo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_photos_updated_at
  BEFORE UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_updated_at();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON photo_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_photo_updated_at();

-- Function to track metadata changes
CREATE OR REPLACE FUNCTION log_photo_metadata_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if specific fields changed
  IF OLD.caption IS DISTINCT FROM NEW.caption THEN
    INSERT INTO photo_metadata_history (photo_id, field_changed, old_value, new_value)
    VALUES (NEW.id, 'caption', OLD.caption, NEW.caption);
  END IF;

  IF OLD.license_type IS DISTINCT FROM NEW.license_type THEN
    INSERT INTO photo_metadata_history (photo_id, field_changed, old_value, new_value)
    VALUES (NEW.id, 'license_type', OLD.license_type, NEW.license_type);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for metadata history
CREATE TRIGGER log_photo_changes
  AFTER UPDATE ON photos
  FOR EACH ROW
  EXECUTE FUNCTION log_photo_metadata_change();

-- Comments
COMMENT ON TABLE photos IS 'Photo storage with AI analysis, metadata, and licensing';
COMMENT ON COLUMN photos.ai_analysis IS 'Claude AI analysis: species identification, scene description, keywords, license detection';
COMMENT ON COLUMN photos.sha1_hash IS 'SHA1 hash for deduplication - prevents uploading same photo twice';
COMMENT ON COLUMN photos.license_type IS 'Creative Commons or proprietary license type';
COMMENT ON COLUMN photos.species_identified IS 'Array of shellfish species identified in photo';
