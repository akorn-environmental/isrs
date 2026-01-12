-- Migration 010: Add emergency contact authorization field
-- Date: 2025-11-03
-- Description: Adds authorization checkbox field for emergency contact consent

-- Add emergency_contact_authorization column
ALTER TABLE conference_registrations
ADD COLUMN IF NOT EXISTS emergency_contact_authorization BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN conference_registrations.emergency_contact_authorization IS 'Attendee authorization for conference admins to contact emergency contact in case of emergency';

-- Migration Complete
SELECT 'Migration 010: Added emergency_contact_authorization column to conference_registrations' AS status;
