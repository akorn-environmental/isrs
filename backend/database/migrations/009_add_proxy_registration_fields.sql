-- Migration 009: Add Proxy Registration Fields
-- Allows tracking when someone registers another person for the conference

-- Add columns to conference_registrations table
ALTER TABLE conference_registrations
ADD COLUMN IF NOT EXISTS registered_by_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS registered_by_name VARCHAR(255);

-- Add index for faster lookups of who registered whom
CREATE INDEX IF NOT EXISTS idx_conference_registrations_registered_by
ON conference_registrations(registered_by_email)
WHERE registered_by_email IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN conference_registrations.registered_by_email IS 'Email of the person who registered this attendee (null if self-registered)';
COMMENT ON COLUMN conference_registrations.registered_by_name IS 'Name of the person who registered this attendee (null if self-registered)';

-- Migration Complete
SELECT 'Migration 009 completed: Proxy registration fields added' AS status;
