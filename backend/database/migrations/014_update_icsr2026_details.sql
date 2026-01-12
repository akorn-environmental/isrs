-- Update ICSR2026 Conference Details
-- Corrects conference name, location, dates, and Zeffy URL

-- Update the 2026 conference record with correct details
UPDATE conference_editions
SET
  name = 'ICSR2026 - International Conference on Shellfish Restoration',
  theme = 'Bridging Science, Culture, and Conservation',
  location = 'Little Creek Casino Resort, Puget Sound, Washington',
  venue_name = 'Little Creek Casino Resort',
  start_date = '2026-10-04',
  end_date = '2026-10-08',
  registration_close_date = '2026-09-30',
  early_bird_deadline = '2026-03-01',
  abstract_submission_deadline = '2026-05-01',
  early_bird_fee = 375.00,
  regular_fee = 475.00,
  student_fee = 350.00,
  late_fee = 575.00,
  website = 'https://www.zeffy.com/en-US/ticketing/icsr2026-international-conference-on-shellfish-restoration',
  updated_at = NOW()
WHERE year = 2026;

-- Verify the update
SELECT
  year,
  name,
  location,
  start_date,
  end_date,
  website
FROM conference_editions
WHERE year = 2026;
