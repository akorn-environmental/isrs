-- Migration: Add Jake Spencer, Lily Maddox, and Jessie Mandirola as admin users
-- Created: 2025-01-06

INSERT INTO admin_users (email, role, full_name, created_at)
VALUES
  ('jakespencer6596@gmail.com', 'admin', 'Jake Spencer', NOW()),
  ('lilymaddox14@gmail.com', 'admin', 'Lily Maddox', NOW()),
  ('mandiroj@gmail.com', 'admin', 'Jessie Mandirola', NOW())
ON CONFLICT (email)
DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Verify the insertions
SELECT email, role, full_name, created_at
FROM admin_users
WHERE email IN (
  'jakespencer6596@gmail.com',
  'lilymaddox14@gmail.com',
  'mandiroj@gmail.com'
);
