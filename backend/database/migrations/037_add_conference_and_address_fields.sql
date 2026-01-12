-- Migration: Add conference attendance, address, and social profile fields to contacts
-- These fields align with the ISRS Master Database Google Sheet

-- Conference attendance/presentation fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2024_attended BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2024_presented BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2024_presentation_title TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2026_registered BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2026_registration_type VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS icsr2026_presentation_submitted BOOLEAN DEFAULT FALSE;

-- Address fields (some may already exist)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- Social/professional profile fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS twitter_handle VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS orcid VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS researchgate VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS google_scholar VARCHAR(255);

-- Additional useful fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS biography TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS photo_url VARCHAR(500);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS preferred_contact_method VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS next_followup_date DATE;

-- Membership/subscription fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS member_since DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS membership_expires DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS membership_status VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS dues_paid BOOLEAN DEFAULT FALSE;

-- Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_contacts_icsr2024_attended ON contacts(icsr2024_attended) WHERE icsr2024_attended = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_icsr2026_registered ON contacts(icsr2026_registered) WHERE icsr2026_registered = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_membership_status ON contacts(membership_status);
