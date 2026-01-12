-- Correct User Roles Based on Actual Positions
-- Dorothy Leonard = Board Chair
-- M Richard DeVoe = Board Vice Chair
-- Beth Walton = Board Member (was Conference Planner)
-- Andy Lacatell, Anne Birch, Boze Hancock, Michael Doall = AP Members (were Board Members)
-- Erin Flaherty = Partner with Access (was Conference Planner)

-- Update contacts table
UPDATE contacts
SET role = 'Board Chair', title = 'Board Chair', updated_at = NOW()
WHERE email = 'msmussel@oceanequities.org';

UPDATE contacts
SET role = 'Board Vice Chair', title = 'Board Vice Chair', updated_at = NOW()
WHERE email = 'devoemr@cofc.edu';

UPDATE contacts
SET role = 'Board Member', title = 'Board Member', updated_at = NOW()
WHERE email = 'beth@oystersouth.com';

UPDATE contacts
SET role = 'AP Member', title = 'AP Member', updated_at = NOW()
WHERE email IN ('andylacatell@gmail.com', 'Bircha59@gmail.com', 'bhancock@tnc.org', 'michael.doall@stonybrook.edu');

UPDATE contacts
SET role = 'Partner', title = 'Partner with Access', updated_at = NOW()
WHERE email = 'erinflahertyconsulting@gmail.com';

-- Update admin_users table
UPDATE admin_users
SET role = 'board_chair', updated_at = NOW()
WHERE email = 'msmussel@oceanequities.org';

UPDATE admin_users
SET role = 'board_vice_chair', updated_at = NOW()
WHERE email = 'devoemr@cofc.edu';

UPDATE admin_users
SET role = 'board_member', updated_at = NOW()
WHERE email = 'beth@oystersouth.com';

UPDATE admin_users
SET role = 'ap_member', updated_at = NOW()
WHERE email IN ('andylacatell@gmail.com', 'Bircha59@gmail.com', 'bhancock@tnc.org', 'michael.doall@stonybrook.edu');

UPDATE admin_users
SET role = 'partner', updated_at = NOW()
WHERE email = 'erinflahertyconsulting@gmail.com';

-- Verify corrections
SELECT c.email, c.first_name, c.last_name, c.role, c.title, au.role as admin_role, au.access_level
FROM contacts c
LEFT JOIN admin_users au ON c.email = au.email
WHERE c.email IN (
  'msmussel@oceanequities.org',
  'devoemr@cofc.edu',
  'beth@oystersouth.com',
  'andylacatell@gmail.com',
  'Bircha59@gmail.com',
  'bhancock@tnc.org',
  'michael.doall@stonybrook.edu',
  'erinflahertyconsulting@gmail.com'
)
ORDER BY
  CASE
    WHEN c.role = 'Board Chair' THEN 1
    WHEN c.role = 'Board Vice Chair' THEN 2
    WHEN c.role = 'Board Member' THEN 3
    WHEN c.role = 'AP Member' THEN 4
    WHEN c.role = 'Partner' THEN 5
    ELSE 6
  END,
  c.last_name;
