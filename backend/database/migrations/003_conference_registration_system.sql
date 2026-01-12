-- Conference Registration System Schema
-- Complete system for conference registration, abstract submission, travel planning, and management

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS registration_waitlist CASCADE;
DROP TABLE IF EXISTS conference_announcements CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;
DROP TABLE IF EXISTS session_attendance CASCADE;
DROP TABLE IF EXISTS conference_sessions CASCADE;
DROP TABLE IF EXISTS travel_arrangements CASCADE;
DROP TABLE IF EXISTS abstract_submissions CASCADE;
DROP TABLE IF EXISTS conference_registrations CASCADE;
DROP TABLE IF EXISTS attendee_profiles CASCADE;
DROP TABLE IF EXISTS conference_editions CASCADE;

-- Conference Editions (can support multiple years)
CREATE TABLE IF NOT EXISTS conference_editions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year INTEGER UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  theme TEXT,
  location VARCHAR(255),
  venue_name VARCHAR(255),
  venue_address TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Registration Dates
  registration_open_date DATE NOT NULL,
  registration_close_date DATE NOT NULL,
  early_bird_deadline DATE,
  abstract_submission_deadline DATE,

  -- Fees
  early_bird_fee DECIMAL(10,2),
  regular_fee DECIMAL(10,2),
  student_fee DECIMAL(10,2),
  late_fee DECIMAL(10,2),

  -- Links & Info
  website TEXT,
  logo_url TEXT,
  description TEXT,
  program_url TEXT,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendee Profiles (reusable across conferences)
CREATE TABLE IF NOT EXISTS attendee_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_email VARCHAR(255) UNIQUE NOT NULL,
  contact_id UUID REFERENCES contacts(id), -- Link to existing contact if available

  -- Basic Info
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  organization_name VARCHAR(255), -- In case org not in our system
  position VARCHAR(255),
  department VARCHAR(255),

  -- Contact Details
  phone VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),

  -- Professional Profile
  bio TEXT,
  cv_url TEXT,
  profile_photo_url TEXT,
  website TEXT,
  linkedin_url TEXT,
  twitter_handle VARCHAR(100),
  orcid VARCHAR(50),

  -- Research Interests
  research_areas TEXT[],
  expertise_keywords TEXT[],

  -- Preferences
  preferred_language VARCHAR(50) DEFAULT 'en',
  timezone VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conference Registrations
CREATE TABLE IF NOT EXISTS conference_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,
  attendee_id UUID REFERENCES attendee_profiles(id) NOT NULL,

  -- Registration Details
  registration_number VARCHAR(50) UNIQUE, -- e.g., ISRS2026-001
  registration_type VARCHAR(50) NOT NULL, -- 'early_bird', 'regular', 'student', 'late'
  registration_date TIMESTAMP DEFAULT NOW(),

  -- Payment Details
  registration_fee DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'partially_paid', 'refunded', 'cancelled'
  payment_method VARCHAR(50), -- 'zeffy', 'credit_card', 'bank_transfer', 'check'
  payment_date TIMESTAMP,
  payment_reference VARCHAR(255), -- Zeffy transaction ID or other reference
  zeffy_checkout_url TEXT,

  -- Attendance Details
  attending_days TEXT[], -- ['2026-06-15', '2026-06-16', '2026-06-17']
  is_virtual BOOLEAN DEFAULT FALSE,
  is_presenter BOOLEAN DEFAULT FALSE,
  is_first_time BOOLEAN DEFAULT FALSE,

  -- Dietary & Accessibility
  dietary_restrictions TEXT,
  dietary_notes TEXT,
  accessibility_needs TEXT,
  special_requirements TEXT,

  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(50),
  emergency_contact_relationship VARCHAR(100),

  -- Preferences & Interests
  interested_in_workshops BOOLEAN DEFAULT FALSE,
  interested_in_field_trips BOOLEAN DEFAULT FALSE,
  interested_in_social_events BOOLEAN DEFAULT TRUE,
  needs_accommodation_help BOOLEAN DEFAULT FALSE,
  willing_to_volunteer BOOLEAN DEFAULT FALSE,

  -- Communication Preferences
  opt_in_mailing_list BOOLEAN DEFAULT TRUE,
  opt_in_future_conferences BOOLEAN DEFAULT TRUE,

  -- Administrative
  status VARCHAR(50) DEFAULT 'confirmed', -- 'pending', 'confirmed', 'cancelled', 'waitlist'
  cancellation_date TIMESTAMP,
  cancellation_reason TEXT,
  admin_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(conference_id, attendee_id)
);

-- Abstract Submissions
CREATE TABLE IF NOT EXISTS abstract_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,
  attendee_id UUID REFERENCES attendee_profiles(id) NOT NULL,
  registration_id UUID REFERENCES conference_registrations(id),

  -- Submission Info
  submission_number VARCHAR(50) UNIQUE, -- e.g., ABS2026-001
  title TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[],

  -- Presentation Details
  presentation_type VARCHAR(50) NOT NULL, -- 'oral', 'poster', 'workshop', 'keynote'
  presentation_preference VARCHAR(50), -- 'oral_preferred', 'poster_preferred', 'either'
  topic_area VARCHAR(100),
  session_preference VARCHAR(255),

  -- Authors
  presenting_author_id UUID REFERENCES attendee_profiles(id),
  corresponding_author_email VARCHAR(255),
  co_authors JSONB, -- [{name, affiliation, email, orcid}, ...]

  -- Files
  abstract_file_url TEXT,
  supplementary_files JSONB, -- [{filename, url, type}, ...]

  -- Review Process
  submission_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'submitted', -- 'draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn'
  review_status VARCHAR(50), -- 'pending', 'assigned', 'in_progress', 'completed'

  -- Review Scores & Comments
  reviewer_assignments JSONB, -- [{reviewer_id, status, score, comments}, ...]
  average_score DECIMAL(3,2),
  reviewer_comments TEXT,
  internal_notes TEXT,

  -- Decision
  decision VARCHAR(50), -- 'accept_oral', 'accept_poster', 'reject', 'revise_resubmit'
  decision_date TIMESTAMP,
  decision_notes TEXT,

  -- Scheduling (if accepted)
  scheduled_date DATE,
  scheduled_start_time TIME,
  scheduled_end_time TIME,
  session_id UUID, -- Will reference conference_sessions
  session_name VARCHAR(255),
  room VARCHAR(100),
  presentation_order INTEGER,

  -- Additional Info
  requires_av BOOLEAN DEFAULT TRUE,
  special_equipment_needed TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Travel Arrangements
CREATE TABLE IF NOT EXISTS travel_arrangements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES conference_registrations(id) NOT NULL,

  -- Arrival Details
  arrival_date DATE,
  arrival_time TIME,
  arrival_flight VARCHAR(100),
  arrival_airport VARCHAR(100),
  arrival_notes TEXT,

  -- Departure Details
  departure_date DATE,
  departure_time TIME,
  departure_flight VARCHAR(100),
  departure_airport VARCHAR(100),
  departure_notes TEXT,

  -- Accommodation
  needs_accommodation BOOLEAN DEFAULT FALSE,
  hotel_name VARCHAR(255),
  hotel_address TEXT,
  hotel_check_in DATE,
  hotel_check_out DATE,
  hotel_confirmation VARCHAR(100),
  hotel_phone VARCHAR(50),
  room_type VARCHAR(100),
  roommate_preferences TEXT,

  -- Transportation
  needs_shuttle BOOLEAN DEFAULT FALSE,
  needs_airport_pickup BOOLEAN DEFAULT FALSE,
  needs_airport_dropoff BOOLEAN DEFAULT FALSE,
  has_rental_car BOOLEAN DEFAULT FALSE,

  -- Special Requests
  special_requests TEXT,
  accessibility_transport_needs TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conference Sessions (scheduled program)
CREATE TABLE IF NOT EXISTS conference_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,

  -- Session Info
  session_code VARCHAR(50), -- e.g., "S1A", "P2B"
  session_name VARCHAR(255) NOT NULL,
  session_type VARCHAR(50) NOT NULL, -- 'keynote', 'oral', 'poster', 'workshop', 'panel', 'social', 'break'
  topic_area VARCHAR(100),
  description TEXT,

  -- Scheduling
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  room VARCHAR(100),
  building VARCHAR(100),
  capacity INTEGER,

  -- Organization
  chair_id UUID REFERENCES attendee_profiles(id),
  co_chair_id UUID REFERENCES attendee_profiles(id),
  moderator_notes TEXT,

  -- Details
  is_parallel BOOLEAN DEFAULT FALSE,
  track VARCHAR(100), -- For parallel sessions
  requires_registration BOOLEAN DEFAULT FALSE, -- For workshops

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Session Attendance (track who's attending which sessions)
CREATE TABLE IF NOT EXISTS session_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES conference_sessions(id) NOT NULL,
  attendee_id UUID REFERENCES attendee_profiles(id) NOT NULL,

  -- Attendance Details
  registered_at TIMESTAMP DEFAULT NOW(),
  attended BOOLEAN,
  check_in_time TIMESTAMP,

  -- Feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(session_id, attendee_id)
);

-- Payment Transactions (detailed payment log)
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES conference_registrations(id) NOT NULL,

  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL, -- 'payment', 'refund', 'partial_refund'
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment Method
  payment_method VARCHAR(50) NOT NULL, -- 'zeffy', 'credit_card', 'bank_transfer', 'check'
  payment_provider VARCHAR(50), -- 'zeffy', 'stripe', 'paypal'

  -- Transaction Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'

  -- References
  external_transaction_id VARCHAR(255), -- Zeffy/Stripe/PayPal ID
  checkout_url TEXT,
  receipt_url TEXT,

  -- Metadata
  transaction_date TIMESTAMP DEFAULT NOW(),
  completed_date TIMESTAMP,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Conference Announcements
CREATE TABLE IF NOT EXISTS conference_announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,

  -- Announcement Details
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  announcement_type VARCHAR(50), -- 'general', 'urgent', 'deadline', 'program_update'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high'

  -- Targeting
  target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'registered', 'presenters', 'volunteers'

  -- Publishing
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Waiting List
CREATE TABLE IF NOT EXISTS registration_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,
  attendee_id UUID REFERENCES attendee_profiles(id) NOT NULL,

  -- Waitlist Details
  position INTEGER,
  registration_type VARCHAR(50),
  added_date TIMESTAMP DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notification_date TIMESTAMP,

  -- Status
  status VARCHAR(50) DEFAULT 'waiting', -- 'waiting', 'offered', 'accepted', 'declined', 'expired'
  offer_expires_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(conference_id, attendee_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_registrations_conference ON conference_registrations(conference_id);
CREATE INDEX IF NOT EXISTS idx_registrations_attendee ON conference_registrations(attendee_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON conference_registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON conference_registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_abstracts_conference ON abstract_submissions(conference_id);
CREATE INDEX IF NOT EXISTS idx_abstracts_attendee ON abstract_submissions(attendee_id);
CREATE INDEX IF NOT EXISTS idx_abstracts_status ON abstract_submissions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_conference ON conference_sessions(conference_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON conference_sessions(session_date, start_time);
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_email ON attendee_profiles(user_email);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_registration ON payment_transactions(registration_id);

-- Insert 2026 Conference
INSERT INTO conference_editions (
  year,
  name,
  theme,
  location,
  venue_name,
  start_date,
  end_date,
  registration_open_date,
  registration_close_date,
  early_bird_deadline,
  abstract_submission_deadline,
  early_bird_fee,
  regular_fee,
  student_fee,
  late_fee,
  website,
  is_active
) VALUES (
  2026,
  'ICSR2026 - International Conference on Shellfish Restoration',
  'Bridging Science, Culture, and Conservation',
  'Little Creek Casino Resort, Puget Sound, Washington',
  'Little Creek Casino Resort',
  '2026-10-04',
  '2026-10-08',
  '2025-12-01',
  '2026-09-30',
  '2026-03-01',
  '2026-05-01',
  375.00,
  475.00,
  350.00,
  575.00,
  'https://www.zeffy.com/en-US/ticketing/icsr2026-international-conference-on-shellfish-restoration',
  TRUE
) ON CONFLICT (year) DO NOTHING;
