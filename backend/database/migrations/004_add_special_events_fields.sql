-- Migration: Add special events and activity fields to conference_registrations
-- Date: 2025-11-02
-- Description: Add columns for special event selections, t-shirt size, guest count, CE credits, and room sharing

ALTER TABLE conference_registrations
  -- Social Events
  ADD COLUMN welcome_reception BOOLEAN DEFAULT FALSE,
  ADD COLUMN low_country_boil BOOLEAN DEFAULT FALSE,

  -- Field Trips
  ADD COLUMN dolphin_tours BOOLEAN DEFAULT FALSE,
  ADD COLUMN sea_turtle_center BOOLEAN DEFAULT FALSE,
  ADD COLUMN restoration_site_tour BOOLEAN DEFAULT FALSE,

  -- Special Activities
  ADD COLUMN golf_tournament BOOLEAN DEFAULT FALSE,

  -- T-Shirt
  ADD COLUMN tshirt_size VARCHAR(10),

  -- Guests
  ADD COLUMN guest_count INTEGER DEFAULT 0,
  ADD COLUMN guest_fee DECIMAL(10,2) DEFAULT 0,

  -- Continuing Education
  ADD COLUMN continuing_education BOOLEAN DEFAULT FALSE,
  ADD COLUMN license_number VARCHAR(100),
  ADD COLUMN licensing_org VARCHAR(255),

  -- Room Sharing
  ADD COLUMN room_sharing BOOLEAN DEFAULT FALSE,
  ADD COLUMN roommate_notes TEXT;

-- Create index for event tracking
CREATE INDEX idx_conference_registrations_events ON conference_registrations(conference_id, welcome_reception, low_country_boil, golf_tournament);
