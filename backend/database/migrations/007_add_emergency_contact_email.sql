-- Migration: Add emergency contact email field
-- Date: 2025-11-03
-- Description: Adds email field to emergency contact information

-- Add emergency_contact_email column
ALTER TABLE conference_registrations
ADD COLUMN IF NOT EXISTS emergency_contact_email VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN conference_registrations.emergency_contact_email IS 'Email address of emergency contact person';

-- Migration Complete
SELECT 'Migration 007: Added emergency_contact_email column to conference_registrations' AS status;
