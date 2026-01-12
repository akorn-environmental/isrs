-- Migration: Add lead assignment functionality to funding prospects
-- Date: 2025-11-02
-- Description: Link contacts to funding prospects as leads and track email notifications

-- Add lead_contacts array and ICSR funding history to funding_prospects
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funding_prospects' AND column_name='lead_contact_ids') THEN
    ALTER TABLE funding_prospects ADD COLUMN lead_contact_ids UUID[];
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funding_prospects' AND column_name='last_notification_sent') THEN
    ALTER TABLE funding_prospects ADD COLUMN last_notification_sent TIMESTAMP;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funding_prospects' AND column_name='has_funded_icsr') THEN
    ALTER TABLE funding_prospects ADD COLUMN has_funded_icsr BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funding_prospects' AND column_name='icsr_funding_years') THEN
    ALTER TABLE funding_prospects ADD COLUMN icsr_funding_years TEXT[]; -- e.g., ['2020', '2022', '2024']
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='funding_prospects' AND column_name='icsr_funding_notes') THEN
    ALTER TABLE funding_prospects ADD COLUMN icsr_funding_notes TEXT; -- Details about past ICSR funding
  END IF;
END $$;

-- Create junction table for detailed lead tracking
CREATE TABLE IF NOT EXISTS funding_prospect_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  funding_prospect_id UUID REFERENCES funding_prospects(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  assigned_by VARCHAR(255),
  assigned_at TIMESTAMP DEFAULT NOW(),
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP,
  response_received BOOLEAN DEFAULT FALSE,
  response_date TIMESTAMP,
  notes TEXT,
  UNIQUE(funding_prospect_id, contact_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_funding_prospect_leads_funding ON funding_prospect_leads(funding_prospect_id);
CREATE INDEX IF NOT EXISTS idx_funding_prospect_leads_contact ON funding_prospect_leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_funding_prospect_leads_assigned ON funding_prospect_leads(assigned_at);

-- Add comment
COMMENT ON TABLE funding_prospect_leads IS 'Tracks which board members/contacts are assigned as leads for specific funding prospects';
