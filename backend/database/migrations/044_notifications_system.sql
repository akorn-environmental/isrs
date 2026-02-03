-- Migration: Add notifications system for email parsing
-- Creates tables for notifications and processed S3 emails

-- Notifications table for dashboard
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Track processed S3 emails to prevent duplicates
CREATE TABLE IF NOT EXISTS processed_s3_emails (
  id SERIAL PRIMARY KEY,
  s3_key VARCHAR(500) UNIQUE NOT NULL,
  message_id VARCHAR(500),
  parsed_email_id INTEGER REFERENCES parsed_emails(id),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for processed S3 emails
CREATE INDEX IF NOT EXISTS idx_processed_s3_emails_message_id ON processed_s3_emails(message_id);
CREATE INDEX IF NOT EXISTS idx_processed_s3_emails_parsed_email_id ON processed_s3_emails(parsed_email_id);

-- Weekly digest preferences (for future enhancement)
CREATE TABLE IF NOT EXISTS weekly_digest_preferences (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT true,
  send_day VARCHAR(10) DEFAULT 'monday',
  send_time TIME DEFAULT '09:00:00',
  last_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin user gets weekly digest by default
INSERT INTO weekly_digest_preferences (user_email, enabled)
VALUES ('aaron@shellfish-society.org', true)
ON CONFLICT (user_email) DO NOTHING;

-- Grant permissions (adjust schema as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO isrs_backend;
-- GRANT SELECT, INSERT ON processed_s3_emails TO isrs_backend;
-- GRANT SELECT, UPDATE ON weekly_digest_preferences TO isrs_backend;
