-- Add attachments column to parsed_emails table
-- This stores attachment metadata extracted from emails

ALTER TABLE parsed_emails
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN parsed_emails.attachments IS 'Array of attachment objects with structure: [{filename: string, content_type: string, size: number, attachment_id: string, gmail_attachment_id: string}]';

-- Create index for querying emails with specific attachment types
CREATE INDEX IF NOT EXISTS idx_parsed_emails_attachments ON parsed_emails USING gin(attachments);
