-- Gmail Integration Enhancement
-- Add Gmail-specific fields and OAuth support

-- Gmail OAuth tokens storage
CREATE TABLE IF NOT EXISTS gmail_oauth_tokens (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'Bearer',
  expiry_date BIGINT NOT NULL,
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Gmail-specific fields to parsed_emails
ALTER TABLE parsed_emails
  ADD COLUMN IF NOT EXISTS gmail_message_id VARCHAR(255) UNIQUE,
  ADD COLUMN IF NOT EXISTS gmail_thread_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual',  -- 'manual', 'gmail_api', 'webhook'
  ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS is_forwarded BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_date TIMESTAMP;

-- Create indexes for Gmail integration
CREATE INDEX IF NOT EXISTS idx_parsed_emails_gmail_message ON parsed_emails(gmail_message_id);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_gmail_thread ON parsed_emails(gmail_thread_id);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_source ON parsed_emails(source);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_email_date ON parsed_emails(email_date);

-- Add comment
COMMENT ON TABLE gmail_oauth_tokens IS 'Stores Gmail OAuth credentials for automated email polling';
COMMENT ON COLUMN parsed_emails.gmail_message_id IS 'Gmail unique message ID for duplicate detection';
COMMENT ON COLUMN parsed_emails.source IS 'Source of email: manual, gmail_api, or webhook';
