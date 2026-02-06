-- Add test organizations and contacts from example email
-- Run with: psql $DATABASE_URL -f add_test_contacts.sql

-- Insert Organizations (if they don't exist)
INSERT INTO organizations (id, name, type, notes, created_at, updated_at)
VALUES
  (gen_random_uuid(), 'TBD Economics, LLC', 'Private', 'From test email example', NOW(), NOW()),
  (gen_random_uuid(), 'NRDC', 'NGO', 'From test email example', NOW(), NOW()),
  (gen_random_uuid(), 'Sustainable Seas Technology', 'Private', 'From test email example', NOW(), NOW()),
  (gen_random_uuid(), 'Endangered Habitats League', 'NGO', 'From test email example', NOW(), NOW()),
  (gen_random_uuid(), 'Ocean Defenders', 'NGO', 'From test email example', NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Insert Contacts with organization links
-- Tracy Rouleau
INSERT INTO contacts (id, email, first_name, last_name, full_name, organization_id, role, title, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'tracy@tbdeconomics.com',
  'Tracy',
  'Rouleau',
  'Tracy Rouleau',
  (SELECT id FROM organizations WHERE name = 'TBD Economics, LLC'),
  'Founder',
  'Founder',
  'From test email example',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'tracy@tbdeconomics.com');

-- Francine Kershaw
INSERT INTO contacts (id, email, first_name, last_name, full_name, organization_id, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'fkershaw@nrdc.org',
  'Francine',
  'Kershaw',
  'Francine Kershaw',
  (SELECT id FROM organizations WHERE name = 'NRDC'),
  'From test email example',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'fkershaw@nrdc.org');

-- Kim Kirchberg-Sawicki (compound last name test)
INSERT INTO contacts (id, email, first_name, last_name, full_name, organization_id, role, title, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'admin@sustainableseastechnology.org',
  'Kim',
  'Kirchberg-Sawicki',
  'Kim Kirchberg-Sawicki',
  (SELECT id FROM organizations WHERE name = 'Sustainable Seas Technology'),
  'President',
  'President',
  'From test email example - compound last name',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'admin@sustainableseastechnology.org');

-- Dan Silver
INSERT INTO contacts (id, email, first_name, last_name, full_name, organization_id, role, title, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'dsilverla@me.com',
  'Dan',
  'Silver',
  'Dan Silver',
  (SELECT id FROM organizations WHERE name = 'Endangered Habitats League'),
  'Executive Director',
  'Executive Director',
  'From test email example',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'dsilverla@me.com');

-- Michael Beck (no organization)
INSERT INTO contacts (id, email, first_name, last_name, full_name, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'beckehl@icloud.com',
  'Michael',
  'Beck',
  'Michael Beck',
  'From test email example',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'beckehl@icloud.com');

-- Kurt Lieber
INSERT INTO contacts (id, email, first_name, last_name, full_name, organization_id, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'kurt@oceandefenders.org',
  'Kurt',
  'Lieber',
  'Kurt Lieber',
  (SELECT id FROM organizations WHERE name = 'Ocean Defenders'),
  'From test email example',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'kurt@oceandefenders.org');

-- Aaron Kornbluth (you!)
INSERT INTO contacts (id, email, first_name, last_name, full_name, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'aaron.kornbluth@gmail.com',
  'Aaron',
  'Kornbluth',
  'Aaron Kornbluth',
  'From test email example - PRIMARY CONTACT',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'aaron.kornbluth@gmail.com');

-- Brooke Wibberley
INSERT INTO contacts (id, email, first_name, last_name, full_name, organization_id, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'brooke@tbdeconomics.com',
  'Brooke',
  'Wibberley',
  'Brooke Wibberley',
  (SELECT id FROM organizations WHERE name = 'TBD Economics, LLC'),
  'From test email example',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'brooke@tbdeconomics.com');

-- Cathy Chadwick
INSERT INTO contacts (id, email, first_name, last_name, full_name, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  'chadgroup@outlook.com',
  'Cathy',
  'Chadwick',
  'Cathy Chadwick',
  'From test email example',
  NOW(),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE email = 'chadgroup@outlook.com');

-- Display results
SELECT
  c.full_name,
  c.email,
  o.name as organization,
  c.role
FROM contacts c
LEFT JOIN organizations o ON c.organization_id = o.id
WHERE c.notes LIKE '%test email example%'
ORDER BY c.created_at DESC;

SELECT COUNT(*) as total_contacts FROM contacts;
SELECT COUNT(*) as total_organizations FROM organizations;
