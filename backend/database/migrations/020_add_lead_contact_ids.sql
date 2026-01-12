-- Migration 020: Add lead_contact_ids column to funding_prospects
-- Allows assigning multiple board/AP members as leads for each prospect

ALTER TABLE funding_prospects
ADD COLUMN IF NOT EXISTS lead_contact_ids UUID[] DEFAULT '{}';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_funding_prospects_lead_contacts
ON funding_prospects USING GIN (lead_contact_ids);

-- Add comment
COMMENT ON COLUMN funding_prospects.lead_contact_ids IS 'Array of contact UUIDs assigned as leads for this funding prospect';
