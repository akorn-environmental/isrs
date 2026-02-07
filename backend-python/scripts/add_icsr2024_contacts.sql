-- Add ICSR2024 Planning Committee and participant contacts
-- Run this on production database

BEGIN;

-- Insert or update contacts (using ON CONFLICT to handle duplicates)
INSERT INTO contacts (name, email, title, organization, phone, alternate_emails, tags, notes, created_at, updated_at)
VALUES
  ('Dorothy Leonard', 'msmussel@oceanequities.org', NULL, 'Ocean Equities LLC', '(410) 562-4880', NULL, ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee - Social media coordination', NOW(), NOW()),
  ('Peter R. Kingsley-Smith', 'kingsleysmithp@dnr.sc.gov', 'Assistant Director, Shellfish Research Section Manager', 'Marine Resources Research Institute, South Carolina Department of Natural Resources', '843-953-9840', ARRAY['KingsleySmithP@dnr.sc.gov'], ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee - Keynote speaker coordination, abstract submissions. Cell: 843-655-8763', NOW(), NOW()),
  ('Mark Risse', 'mrisse@uga.edu', 'Director, P.E.', 'Marine Extension and Georgia Sea Grant', '706-202-9576', NULL, ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee - Opening remarks, tours coordination. Address: 1180 East Broad St, 1030 Chicopee Complex, Athens, GA 30602', NOW(), NOW()),
  ('Loren Coen', 'lcoen1@fau.edu', 'Research Affiliate Professor, Ph.D.', 'Department of Biological Sciences and Harbor Branch Oceanographic Institute at Florida Atlantic University', '239-470-2236', ARRAY['Lcoen1@fau.edu'], ARRAY['ICSR2024', 'Presenter'], 'ICSR2024 - Abstract submission, presenter. Website: http://www.oyster-restoration.org', NOW(), NOW()),
  ('Yank Moore', 'ymoore@jekyllisland.com', 'Director of Conservation', 'Jekyll Island Authority', '912-635-9384', NULL, ARRAY['ICSR2024', 'Field Trip Leader'], 'ICSR2024 - Field trip leader (Jekyll Island conservation tour). Cell: 912-215-9374. Wildlife Response: 912-222-5992', NOW(), NOW()),
  ('Christi Lambert', 'clambert@tnc.org', NULL, 'The Nature Conservancy', NULL, ARRAY['clambert@TNC.ORG'], ARRAY['ICSR2024', 'Planning Committee', 'Field Trip Leader'], 'ICSR2024 Planning Committee - Field trip leader (living shorelines tour, Brunswick and Cannons Point Preserve)', NOW(), NOW()),
  ('Sara Karlsson', 'karlsson@uga.edu', 'Administrative Financial Director', 'Marine Extension and Georgia Sea Grant', '706-542-8849', NULL, ARRAY['ICSR2024', 'Registration'], 'ICSR2024 - Registration coordination. Address: Chicopee Complex, 1180 East Broad St, Athens, GA 30602', NOW(), NOW()),
  ('Betsy Peabody', 'betsy@restorationfund.org', NULL, 'Restoration Fund (PSRF)', NULL, ARRAY['Betsy@restorationfund.org'], ARRAY['ICSR2024', 'Planning Committee', 'ICSR2026'], 'ICSR2024 Planning Committee. Leading ICSR2026 planning coordination', NOW(), NOW()),
  ('Bob Rheault', 'bob@ecsga.org', NULL, 'East Coast Shellfish Growers Association', NULL, NULL, ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee', NOW(), NOW()),
  ('Boze Hancock', 'bhancock@tnc.org', NULL, 'The Nature Conservancy', NULL, ARRAY['bhancock@TNC.ORG'], ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee', NOW(), NOW()),
  ('Kevin Cox', 'kevinfcox@me.com', NULL, NULL, NULL, NULL, ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee', NOW(), NOW()),
  ('James Gilstrap', 'jgil2@uga.edu', NULL, 'University of Georgia', NULL, NULL, ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee', NOW(), NOW()),
  ('LaDon Swann', 'ladon.swann@usm.edu', 'Director, Sea Grant Aquaculture Liaison', 'Mississippi-Alabama Sea Grant Consortium', '251-648-5877', ARRAY['Ladon.Swann@usm.edu'], ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee. Websites: http://masgc.org, http://seagrant.noaa.gov', NOW(), NOW()),
  ('Lisa Paton', 'lisa.paton@gmail.com', NULL, NULL, NULL, ARRAY['Lisa.paton@gmail.com'], ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee', NOW(), NOW()),
  ('Michael Doall', 'michael.doall@stonybrook.edu', 'Associate Director for Bivalve Restoration & Aquaculture', 'School of Marine & Atmospheric Sciences, Stony Brook University', '631-418-4249', NULL, ARRAY['ICSR2024', 'Planning Committee', 'ICSR2026'], 'ICSR2024 Planning Committee. Interested in ICSR2026 planning committee', NOW(), NOW()),
  ('Carli Bertrand', 'carli.bertrand@noaa.gov', NULL, 'NMFS Restoration Center HQ', NULL, NULL, ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee', NOW(), NOW()),
  ('Sherry L. Larkin', 'slarkin@ufl.edu', NULL, 'University of Florida', NULL, NULL, ARRAY['ICSR2024', 'Planning Committee'], 'ICSR2024 Planning Committee', NOW(), NOW()),
  ('Thomas H Bliss', 'tbliss@uga.edu', NULL, 'University of Georgia', NULL, NULL, ARRAY['ICSR2024', 'Tours'], 'ICSR2024 - Lab tour coordination (Skidaway Island shellfish lab and oyster hatchery)', NOW(), NOW()),
  ('Wesley Voyles', 'wesley.voyles@georgiacenter.uga.edu', 'Registration Services', 'Georgia Center, University of Georgia', '706-583-0425', NULL, ARRAY['ICSR2024', 'Registration'], 'ICSR2024 - Registration services. Address: 1197 S. Lumpkin St, Athens, GA 30602', NOW(), NOW()),
  ('Kerstin Scherer', 'kerstin.scherer@awi.de', NULL, 'Alfred Wegener Institute', NULL, NULL, ARRAY['ICSR2024', 'International'], 'ICSR2024 - International attendee coordination (Germany)', NOW(), NOW()),
  ('Bernadette Pogoda', 'bernadette.pogoda@awi.de', NULL, 'Alfred Wegener Institute', NULL, NULL, ARRAY['ICSR2024', 'International', 'Field Trip'], 'ICSR2024 - International attendee (Germany), Jekyll Island Conservation Tour participant', NOW(), NOW()),
  ('Anne Birch', 'bircha59@gmail.com', NULL, NULL, NULL, ARRAY['Bircha59@gmail.com'], ARRAY['ICSR2024', 'ICSR2026'], 'Interested in ICSR2026 planning', NOW(), NOW()),
  ('Jim McFarlane', 'jm2001a@gmail.com', NULL, 'Reef Ball Foundation', '352-262-8660', NULL, ARRAY['ICSR2024', 'Presenter', 'Exhibitor'], 'ICSR2024 - Poster and talk presentation on Reef Balls in shellfish restoration. Exhibit space for Reef Ball models. Research on 20+ years of data.', NOW(), NOW()),
  ('Dionne Hoskins-Brown', 'dionne.hoskins-brown@noaa.gov', NULL, 'NOAA Federal', NULL, ARRAY['Dionne.Hoskins-Brown@noaa.gov'], ARRAY['ICSR2024', 'Presenter'], 'ICSR2024 - Presenter. Co-presenter: Ben Porter', NOW(), NOW()),
  ('Kerstin Wasson', 'kerstin.wasson@gmail.com', NULL, NULL, NULL, NULL, ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant. Arriving JAX 1pm Sunday.', NOW(), NOW()),
  ('Danielle Zacherl', 'dzacherl@fullerton.edu', NULL, 'California State University, Fullerton', NULL, NULL, ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant. Flying into Savannah.', NOW(), NOW()),
  ('Phoebe Racine', 'phoebe.racine@tnc.org', NULL, 'The Nature Conservancy', NULL, NULL, ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant. Flying into Savannah, rental car available for rides.', NOW(), NOW()),
  ('James McArdle', 'jmcardle@swinomish.nsn.us', NULL, 'Swinomish Indian Tribal Community', NULL, NULL, ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant. Driving from Atlanta through Savannah Sunday.', NOW(), NOW()),
  ('Annie Raymond', 'araymond@jamestowntribe.org', NULL, 'Jamestown S''Klallam Tribe', NULL, NULL, ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant', NOW(), NOW()),
  ('Ryan Crim', 'ryan@restorationfund.org', NULL, 'Pacific Shellfish Restoration Fund (PSRF)', NULL, NULL, ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant. Flying out Friday 9/17, 9:10am from JAX.', NOW(), NOW()),
  ('Julieta Martinelli', 'julieta.martinelli@dfw.wa.gov', 'Ph.D., Biologist & Olympia Oyster Program Lead', 'Washington Department of Fish and Wildlife', '425-725-0258', ARRAY['Julieta.Martinelli@dfw.wa.gov'], ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program lead. Flying into Savannah mid-morning Saturday with baby, rental car available.', NOW(), NOW()),
  ('Jacob Harris', 'jacob.harris@amahmutsun.org', NULL, 'Amah Mutsun Tribal Band', NULL, NULL, ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant', NOW(), NOW()),
  ('Bryan DeAngelis', 'bdeangelis@tnc.org', NULL, 'The Nature Conservancy', NULL, ARRAY['bdeangelis@TNC.ORG'], ARRAY['ICSR2024', 'Olympia Oyster Program'], 'ICSR2024 - Olympia oyster restoration program participant', NOW(), NOW()),
  ('Malenthe Teunis', 'm.teunis@bese-products.com', NULL, 'BESE Products BV', NULL, NULL, ARRAY['ICSR2024', 'Exhibitor', 'Sponsor'], 'ICSR2024 - Originally scheduled presenter/exhibitor. Unable to attend, replaced by Peter Vodegel.', NOW(), NOW()),
  ('Peter Vodegel', 'p.s.m.vodegel@bese-products.com', NULL, 'BESE Products BV', NULL, NULL, ARRAY['ICSR2024', 'Presenter', 'Exhibitor'], 'ICSR2024 - Presenter and exhibitor for BESE BV. Presenting on Monday afternoon. Address: Varkensmarkt 9, 4101 CK Culemborg, Netherlands. Phone: +31 345 74 54 00', NOW(), NOW())
ON CONFLICT (email)
DO UPDATE SET
  name = EXCLUDED.name,
  title = COALESCE(EXCLUDED.title, contacts.title),
  organization = COALESCE(EXCLUDED.organization, contacts.organization),
  phone = COALESCE(EXCLUDED.phone, contacts.phone),
  alternate_emails = COALESCE(EXCLUDED.alternate_emails, contacts.alternate_emails),
  tags = EXCLUDED.tags,
  notes = EXCLUDED.notes,
  updated_at = NOW();

COMMIT;

-- Summary
SELECT
  COUNT(*) as total_contacts,
  COUNT(*) FILTER (WHERE 'ICSR2024' = ANY(tags)) as icsr2024_contacts,
  COUNT(*) FILTER (WHERE 'Planning Committee' = ANY(tags)) as planning_committee,
  COUNT(*) FILTER (WHERE 'ICSR2026' = ANY(tags)) as icsr2026_interested
FROM contacts
WHERE email IN (
  'msmussel@oceanequities.org', 'kingsleysmithp@dnr.sc.gov', 'mrisse@uga.edu',
  'lcoen1@fau.edu', 'ymoore@jekyllisland.com', 'clambert@tnc.org',
  'karlsson@uga.edu', 'betsy@restorationfund.org', 'bob@ecsga.org',
  'bhancock@tnc.org', 'kevinfcox@me.com', 'jgil2@uga.edu',
  'ladon.swann@usm.edu', 'lisa.paton@gmail.com', 'michael.doall@stonybrook.edu',
  'carli.bertrand@noaa.gov', 'slarkin@ufl.edu', 'tbliss@uga.edu',
  'wesley.voyles@georgiacenter.uga.edu', 'kerstin.scherer@awi.de',
  'bernadette.pogoda@awi.de', 'bircha59@gmail.com'
);
