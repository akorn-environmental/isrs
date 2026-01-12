-- Add Board Members and Key Personnel with Admin Access
-- This migration adds board members, AP members, and conference planners to the auth system

-- First, ensure all these people exist in contacts table
-- Then grant them appropriate admin roles

-- Board Members & Key Personnel
INSERT INTO contacts (email, first_name, last_name, full_name, role, title, created_at)
VALUES
  ('Betsy@restorationfund.org', 'Betsy', 'Peabody', 'Betsy Peabody', 'Board Member', 'Board Member', NOW()),
  ('mrisse@uga.edu', 'Mark', 'Risse', 'Mark Risse', 'Board Member', 'Board Member', NOW()),
  ('kmosher@billionoysterproject.org', 'Katie', 'Mosher', 'Katie Mosher', 'Board Member', 'Board Member', NOW()),
  ('andylacatell@gmail.com', 'Andy', 'Lacatell', 'Andy Lacatell', 'Board Member', 'Board Member', NOW()),
  ('luck@vims.edu', 'Mark', 'Luckenbach', 'Mark Luckenbach', 'Board Member', 'Board Member', NOW()),
  ('Bircha59@gmail.com', 'Anne', 'Birch', 'Anne Birch', 'Board Member', 'Board Member', NOW()),
  ('bhancock@tnc.org', 'Boze', 'Hancock', 'Boze Hancock', 'Board Member', 'Board Member', NOW()),
  ('michael.doall@stonybrook.edu', 'Michael', 'Doall', 'Michael Doall', 'Board Member', 'Board Member', NOW()),
  ('tristan@oysters.co.uk', 'Tristan', 'Hugh-Jones', 'Tristan Hugh-Jones', 'Board Member', 'Board Member', NOW()),
  ('simon.branigan@tnc.org', 'Simon', 'Branigan', 'Simon Branigan', 'Board Member', 'Board Member', NOW()),
  ('carlibertrand@hotmail.com', 'Carli', 'Bertrand', 'Carli Bertrand', 'AP Member', 'AP Member', NOW()),
  ('kingsleysmithp@dnr.sc.gov', 'Peter', 'Kingsley-Smith', 'Peter Kingsley-Smith', 'Conference Planner', 'Conference Planner', NOW()),
  ('msmussel@oceanequities.org', 'Dorothy', 'Leonard', 'Dorothy Leonard', 'AP Member', 'AP Member', NOW()),
  ('beth@oystersouth.com', 'Beth', 'Walton', 'Beth Walton', 'Conference Planner', 'Conference Planner', NOW()),
  ('lcoen1@fau.edu', 'Loren', 'Coen', 'Loren Coen', 'AP Member', 'AP Member', NOW()),
  ('ladon.swann@usm.edu', 'LaDon', 'Swann', 'LaDon Swann', 'Conference Planner', 'Conference Planner', NOW()),
  ('erinflahertyconsulting@gmail.com', 'Erin', 'Flaherty', 'Erin Flaherty', 'Conference Planner', 'Conference Planner', NOW()),
  ('devoemr@cofc.edu', 'M Richard', 'DeVoe', 'M Richard DeVoe', 'AP Member', 'AP Member', NOW()),
  ('lisa.paton@gmail.com', 'Lisa', 'Paton', 'Lisa Paton', 'AP Member', 'AP Member', NOW())
ON CONFLICT (email)
DO UPDATE SET
  role = EXCLUDED.role,
  title = EXCLUDED.title,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Grant admin access to all these users
-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  access_level VARCHAR(50) NOT NULL DEFAULT 'full',
  can_edit_profiles BOOLEAN DEFAULT true,
  can_view_financials BOOLEAN DEFAULT true,
  can_manage_conferences BOOLEAN DEFAULT true,
  can_manage_contacts BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add all board members and key personnel as admins
INSERT INTO admin_users (email, role, access_level)
VALUES
  ('Betsy@restorationfund.org', 'board_member', 'full'),
  ('mrisse@uga.edu', 'board_member', 'full'),
  ('kmosher@billionoysterproject.org', 'board_member', 'full'),
  ('andylacatell@gmail.com', 'board_member', 'full'),
  ('luck@vims.edu', 'board_member', 'full'),
  ('Bircha59@gmail.com', 'board_member', 'full'),
  ('bhancock@tnc.org', 'board_member', 'full'),
  ('michael.doall@stonybrook.edu', 'board_member', 'full'),
  ('tristan@oysters.co.uk', 'board_member', 'full'),
  ('simon.branigan@tnc.org', 'board_member', 'full'),
  ('carlibertrand@hotmail.com', 'ap_member', 'full'),
  ('kingsleysmithp@dnr.sc.gov', 'conference_planner', 'full'),
  ('msmussel@oceanequities.org', 'ap_member', 'full'),
  ('beth@oystersouth.com', 'conference_planner', 'full'),
  ('lcoen1@fau.edu', 'ap_member', 'full'),
  ('ladon.swann@usm.edu', 'conference_planner', 'full'),
  ('erinflahertyconsulting@gmail.com', 'conference_planner', 'full'),
  ('devoemr@cofc.edu', 'ap_member', 'full'),
  ('lisa.paton@gmail.com', 'ap_member', 'full')
ON CONFLICT (email)
DO UPDATE SET
  role = EXCLUDED.role,
  access_level = EXCLUDED.access_level,
  updated_at = NOW();

-- Verify the additions
SELECT c.email, c.first_name, c.last_name, c.role, c.title, au.access_level
FROM contacts c
LEFT JOIN admin_users au ON c.email = au.email
WHERE c.email IN (
  'Betsy@restorationfund.org', 'mrisse@uga.edu', 'kmosher@billionoysterproject.org',
  'andylacatell@gmail.com', 'luck@vims.edu', 'Bircha59@gmail.com',
  'bhancock@tnc.org', 'michael.doall@stonybrook.edu', 'tristan@oysters.co.uk',
  'simon.branigan@tnc.org', 'carlibertrand@hotmail.com', 'kingsleysmithp@dnr.sc.gov',
  'msmussel@oceanequities.org', 'beth@oystersouth.com', 'lcoen1@fau.edu',
  'ladon.swann@usm.edu', 'erinflahertyconsulting@gmail.com', 'devoemr@cofc.edu',
  'lisa.paton@gmail.com'
)
ORDER BY c.role, c.last_name;
