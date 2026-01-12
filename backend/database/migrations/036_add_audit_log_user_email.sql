-- Migration: Add user_email column to audit_log table
-- The code uses user_email but the schema originally had changed_by

-- Add user_email column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_log' AND column_name = 'user_email'
    ) THEN
        ALTER TABLE audit_log ADD COLUMN user_email VARCHAR(255);
    END IF;
END $$;

-- Also add details column if it doesn't exist (used for JSON details)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'audit_log' AND column_name = 'details'
    ) THEN
        ALTER TABLE audit_log ADD COLUMN details JSONB;
    END IF;
END $$;

-- Create index on user_email for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_log_user_email ON audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
