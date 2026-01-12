-- Migration 012: User Authentication System (Magic Links)
-- Creates tables for passwordless authentication and user sessions

-- User Sessions (magic link tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendee_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Magic Link Token
  magic_link_token VARCHAR(255) UNIQUE NOT NULL,
  token_expires_at TIMESTAMP NOT NULL,
  token_used BOOLEAN DEFAULT FALSE,
  token_used_at TIMESTAMP,

  -- Session Info
  session_token VARCHAR(255) UNIQUE,
  session_expires_at TIMESTAMP,
  last_activity TIMESTAMP,

  -- Security
  ip_address VARCHAR(50),
  user_agent TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Update attendee_profiles to track account status
ALTER TABLE attendee_profiles
ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Add interested_in_abstract_submission to registrations
ALTER TABLE conference_registrations
ADD COLUMN IF NOT EXISTS interested_in_abstract_submission BOOLEAN DEFAULT FALSE;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_email ON user_sessions(email);
CREATE INDEX IF NOT EXISTS idx_user_sessions_magic_token ON user_sessions(magic_link_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_attendee ON user_sessions(attendee_id);
CREATE INDEX IF NOT EXISTS idx_attendee_email_verified ON attendee_profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_registrations_interested_abstract ON conference_registrations(interested_in_abstract_submission);

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_sessions
  WHERE token_expires_at < NOW()
  AND token_used = FALSE;

  DELETE FROM user_sessions
  WHERE session_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE user_sessions IS 'Stores magic link tokens and active user sessions for passwordless authentication';
COMMENT ON COLUMN user_sessions.magic_link_token IS 'One-time use token sent via email for login';
COMMENT ON COLUMN user_sessions.session_token IS 'Long-lived session token stored in browser after magic link is used';
