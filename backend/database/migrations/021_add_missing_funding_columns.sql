-- Migration 021: Add missing columns expected by adminController
-- Adds columns that the legacy admin funding endpoints expect

ALTER TABLE funding_prospects
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS date_contacted DATE,
ADD COLUMN IF NOT EXISTS icsr_funding_years TEXT[],
ADD COLUMN IF NOT EXISTS icsr_funding_notes TEXT;

-- Add comments
COMMENT ON COLUMN funding_prospects.contact_person IS 'Legacy column - primary contact person name';
COMMENT ON COLUMN funding_prospects.amount IS 'Legacy column - use estimated_amount for new records';
COMMENT ON COLUMN funding_prospects.date_contacted IS 'Legacy column - use last_contact_date for new records';
COMMENT ON COLUMN funding_prospects.icsr_funding_years IS 'Legacy column - use past_funding_years for new records';
COMMENT ON COLUMN funding_prospects.icsr_funding_notes IS 'Additional notes about past ICSR funding';
