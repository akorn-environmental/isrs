-- Migration 022: Add organization text column to contacts
-- Allows storing organization name as text for contacts without organization_id FK

ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization);

-- Add comment
COMMENT ON COLUMN contacts.organization IS 'Organization name as text (alternative to organization_id FK)';
