-- Migration: Add fields from spreadsheet that are missing in contacts table
-- These fields contain valuable enrichment data

-- Add new columns to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_type VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin VARCHAR(500);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS website VARCHAR(500);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Active';
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_international BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS conference_role VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS engagement_score INTEGER;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS priority_level VARCHAR(20);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS research_interests TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source_file VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS import_batch VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS email_valid BOOLEAN DEFAULT TRUE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS profile_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS job_title VARCHAR(255);

-- Add indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_contacts_contact_type ON contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_contacts_priority_level ON contacts(priority_level);
CREATE INDEX IF NOT EXISTS idx_contacts_engagement_score ON contacts(engagement_score);
CREATE INDEX IF NOT EXISTS idx_contacts_is_international ON contacts(is_international);

-- Add comment for documentation
COMMENT ON COLUMN contacts.contact_type IS 'Type: Academic, Government, Non-Profit, Private, Tribal';
COMMENT ON COLUMN contacts.tags IS 'Array of tags/keywords for categorization';
COMMENT ON COLUMN contacts.engagement_score IS 'Engagement level 0-100';
COMMENT ON COLUMN contacts.priority_level IS 'Priority: Low, Medium, High';
