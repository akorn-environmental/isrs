-- Migration 034: Unify User Profiles
-- Links admin_users to attendee_profiles to avoid duplicate user records
-- Creates attendee profiles for beta testing team

-- Step 1: Add attendee_id column to admin_users
ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS attendee_id UUID REFERENCES attendee_profiles(id) ON DELETE SET NULL;

-- Step 2: Create attendee profiles for beta testing team
-- These users will have both admin access AND member profiles

-- Lisa Paton (super_admin)
INSERT INTO attendee_profiles (
  user_email,
  first_name,
  last_name,
  account_status,
  email_verified,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'lisa.paton@gmail.com',
  'Lisa',
  'Paton',
  'active',
  TRUE,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (user_email) DO NOTHING
RETURNING id;

-- Jake Spencer (admin)
INSERT INTO attendee_profiles (
  user_email,
  first_name,
  last_name,
  account_status,
  email_verified,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'jakespencer6596@gmail.com',
  'Jake',
  'Spencer',
  'active',
  TRUE,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (user_email) DO NOTHING
RETURNING id;

-- Jessie Mandirola (admin)
INSERT INTO attendee_profiles (
  user_email,
  first_name,
  last_name,
  account_status,
  email_verified,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'mandiroj@gmail.com',
  'Jessie',
  'Mandirola',
  'active',
  TRUE,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (user_email) DO NOTHING
RETURNING id;

-- Henry Ohrstrom (admin)
INSERT INTO attendee_profiles (
  user_email,
  first_name,
  last_name,
  account_status,
  email_verified,
  email_verified_at,
  created_at,
  updated_at
) VALUES (
  'hdohrstrom@gmail.com',
  'Henry',
  'Ohrstrom',
  'active',
  TRUE,
  NOW(),
  NOW(),
  NOW()
) ON CONFLICT (user_email) DO NOTHING
RETURNING id;

-- Step 3: Link admin_users to attendee_profiles
UPDATE admin_users au
SET attendee_id = ap.id
FROM attendee_profiles ap
WHERE au.email = ap.user_email
  AND au.attendee_id IS NULL;

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_users_attendee_id ON admin_users(attendee_id);

-- Step 5: Verify the linkage
SELECT
  au.email,
  au.role,
  au.full_name AS admin_name,
  ap.first_name || ' ' || ap.last_name AS profile_name,
  au.attendee_id,
  ap.account_status
FROM admin_users au
LEFT JOIN attendee_profiles ap ON au.attendee_id = ap.id
WHERE au.email IN (
  'lisa.paton@gmail.com',
  'jakespencer6596@gmail.com',
  'mandiroj@gmail.com',
  'hdohrstrom@gmail.com'
)
ORDER BY
  CASE au.role
    WHEN 'super_admin' THEN 1
    WHEN 'admin' THEN 2
    ELSE 3
  END,
  au.email;
