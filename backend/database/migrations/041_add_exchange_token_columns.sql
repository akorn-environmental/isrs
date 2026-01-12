-- Migration 041: Add Exchange Token Columns to User Sessions
-- Adds support for cross-origin token exchange authentication flow
-- Required for passwordless authentication when frontend and backend are on different domains

-- Add exchange token columns to user_sessions table
ALTER TABLE user_sessions
ADD COLUMN IF NOT EXISTS exchange_token VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS exchange_token_expires TIMESTAMP;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_exchange_token ON user_sessions(exchange_token) WHERE exchange_token IS NOT NULL;

-- Update the cleanup function to also remove expired exchange tokens
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Delete unused magic links that have expired
  DELETE FROM user_sessions
  WHERE token_expires_at < NOW()
  AND token_used = FALSE;

  -- Delete expired sessions
  DELETE FROM user_sessions
  WHERE session_expires_at < NOW();

  -- Clean up expired exchange tokens (older than 5 minutes)
  UPDATE user_sessions
  SET exchange_token = NULL,
      exchange_token_expires = NULL
  WHERE exchange_token_expires < NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN user_sessions.exchange_token IS 'One-time exchange token for cross-origin authentication (60 second validity)';
COMMENT ON COLUMN user_sessions.exchange_token_expires IS 'Expiration timestamp for the exchange token';
