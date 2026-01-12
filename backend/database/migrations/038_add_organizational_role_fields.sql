-- Migration: Add organizational role fields to contacts
-- Using both booleans for key roles and array for flexibility

-- Board member fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_board_member BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS board_title VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS board_term_start DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS board_term_end DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_past_board_member BOOLEAN DEFAULT FALSE;

-- Advisory Panel / Committee fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_ap_member BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS ap_role VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS committee_memberships TEXT[];

-- Volunteer/Contractor fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_volunteer BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS volunteer_roles TEXT[];
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS volunteer_hours_ytd INTEGER;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_contractor BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contractor_type VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contract_start DATE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contract_end DATE;

-- Funder/Sponsor fields
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_funder BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS is_sponsor BOOLEAN DEFAULT FALSE;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS funding_amount DECIMAL(12,2);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS funding_type VARCHAR(100);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS sponsor_level VARCHAR(50);
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS sponsor_since DATE;

-- Flexible roles array for additional classifications
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS organizational_roles TEXT[];

-- Create indexes for commonly queried role fields
CREATE INDEX IF NOT EXISTS idx_contacts_is_board_member ON contacts(is_board_member) WHERE is_board_member = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_is_ap_member ON contacts(is_ap_member) WHERE is_ap_member = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_is_volunteer ON contacts(is_volunteer) WHERE is_volunteer = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_is_funder ON contacts(is_funder) WHERE is_funder = TRUE;
CREATE INDEX IF NOT EXISTS idx_contacts_is_sponsor ON contacts(is_sponsor) WHERE is_sponsor = TRUE;
