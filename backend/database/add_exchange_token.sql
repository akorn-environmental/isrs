-- Add exchange token columns to user_sessions table
ALTER TABLE user_sessions 
ADD COLUMN IF NOT EXISTS exchange_token VARCHAR(128),
ADD COLUMN IF NOT EXISTS exchange_token_expires TIMESTAMP WITH TIME ZONE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_sessions_exchange_token 
ON user_sessions(exchange_token) 
WHERE exchange_token IS NOT NULL;
