-- Migration: Update icsr2024_presentation_title to support multiple presentations
-- Change from TEXT to TEXT[] to support contacts who presented multiple times

-- First, backup existing data by converting single text values to array format
UPDATE contacts
SET icsr2024_presentation_title = ARRAY[icsr2024_presentation_title]::TEXT[]
WHERE icsr2024_presentation_title IS NOT NULL
  AND icsr2024_presentation_title != '';

-- Drop the old column
ALTER TABLE contacts DROP COLUMN IF EXISTS icsr2024_presentation_title;

-- Add the new array column
ALTER TABLE contacts ADD COLUMN icsr2024_presentation_titles TEXT[];

-- Add comment
COMMENT ON COLUMN contacts.icsr2024_presentation_titles IS 'Array of presentation titles for ICSR2024 - supports multiple presentations per contact';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contacts_icsr2024_presentations ON contacts USING GIN(icsr2024_presentation_titles);
