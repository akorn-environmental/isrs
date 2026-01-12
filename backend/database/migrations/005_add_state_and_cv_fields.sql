-- Migration: Add state/province field and CV file path to attendee profiles
-- Date: 2025-11-02
-- Description: Add state_province field for US/Canadian registrations and cv_file_path for uploaded CVs

ALTER TABLE attendee_profiles
  ADD COLUMN state_province VARCHAR(100),
  ADD COLUMN cv_file_path TEXT;

-- Add index for state queries
CREATE INDEX idx_attendee_profiles_location ON attendee_profiles(country, state_province);
