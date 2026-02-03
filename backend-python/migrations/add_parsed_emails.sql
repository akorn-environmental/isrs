-- Migration: Add parsed_emails table for email parsing system
-- Date: 2026-02-03
-- Description: Creates table to store emails received through admin@shellfish-society.org with AI-extracted data

CREATE TABLE IF NOT EXISTS parsed_emails (
    id SERIAL PRIMARY KEY,

    -- Email metadata
    message_id VARCHAR(500) UNIQUE NOT NULL,
    s3_key VARCHAR(500),
    from_email VARCHAR(255),
    to_emails JSONB,
    cc_emails JSONB,
    subject VARCHAR(500),
    date TIMESTAMP WITH TIME ZONE,

    -- Email content
    body_text TEXT,
    body_html TEXT,
    attachments JSONB,

    -- AI-extracted data
    extracted_contacts JSONB,
    action_items JSONB,
    topics JSONB,
    overall_confidence FLOAT,

    -- Processing status
    status VARCHAR(50) DEFAULT 'pending',
    requires_review BOOLEAN DEFAULT FALSE,
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    email_metadata JSONB,
    error_message TEXT,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_parsed_emails_message_id ON parsed_emails(message_id);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_s3_key ON parsed_emails(s3_key);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_from_email ON parsed_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_status ON parsed_emails(status);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_created_at ON parsed_emails(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_requires_review ON parsed_emails(requires_review) WHERE requires_review = TRUE;

-- Add comment
COMMENT ON TABLE parsed_emails IS 'Stores emails received through admin@shellfish-society.org with AI-extracted data';
