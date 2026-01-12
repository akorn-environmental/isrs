-- Migration: Add Beta Testing Admins
-- Created: 2025-01-14
-- Adds Henry Ohrstrom as admin and promotes Lisa Paton to super_admin

-- Add full_name column if it doesn't exist
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Add Henry Ohrstrom as admin
INSERT INTO admin_users (email, role, full_name, access_level, created_at)
VALUES
  ('hdohrstrom@gmail.com', 'admin', 'Henry Ohrstrom', 'full', NOW())
ON CONFLICT (email)
DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  access_level = EXCLUDED.access_level,
  updated_at = NOW();

-- Update Lisa Paton to super_admin
UPDATE admin_users
SET
  role = 'super_admin',
  access_level = 'full',
  updated_at = NOW()
WHERE email = 'lisa.paton@gmail.com';

-- Ensure Jake Spencer and Jessie Mandirola are set to admin (not super_admin)
UPDATE admin_users
SET
  role = 'admin',
  access_level = 'full',
  updated_at = NOW()
WHERE email IN ('jakespencer6596@gmail.com', 'mandiroj@gmail.com');

-- Verify the beta testing admin users
SELECT email, role, full_name, access_level, created_at
FROM admin_users
WHERE email IN (
  'jakespencer6596@gmail.com',
  'mandiroj@gmail.com',
  'hdohrstrom@gmail.com',
  'lisa.paton@gmail.com'
)
ORDER BY
  CASE role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    ELSE 3
  END,
  email;
