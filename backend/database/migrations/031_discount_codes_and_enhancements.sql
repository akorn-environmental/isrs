-- Conference Registration Enhancements
-- Discount codes, group registrations, and additional features

-- Discount Codes System
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,

  -- Discount Details
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed_amount'
  discount_value DECIMAL(10,2) NOT NULL, -- 25 for 25% off, or 50.00 for $50 off

  -- Applicability
  applies_to_registration_types TEXT[], -- ['early_bird', 'regular', 'student'] or NULL for all
  minimum_attendees INTEGER DEFAULT 1, -- For group discounts

  -- Validity
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,

  -- Usage Limits
  max_uses INTEGER, -- NULL for unlimited
  uses_count INTEGER DEFAULT 0,
  max_uses_per_user INTEGER DEFAULT 1,

  -- Conference Specific
  conference_id UUID REFERENCES conference_editions(id),

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track discount code usage
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  discount_code_id UUID REFERENCES discount_codes(id) NOT NULL,
  registration_id UUID REFERENCES conference_registrations(id) NOT NULL,

  -- Usage Details
  discount_amount DECIMAL(10,2) NOT NULL,
  original_amount DECIMAL(10,2) NOT NULL,
  final_amount DECIMAL(10,2) NOT NULL,

  -- Metadata
  used_at TIMESTAMP DEFAULT NOW(),
  user_email VARCHAR(255),

  UNIQUE(discount_code_id, registration_id)
);

-- Group Registrations
CREATE TABLE IF NOT EXISTS group_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conference_id UUID REFERENCES conference_editions(id) NOT NULL,

  -- Group Details
  group_name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(255),
  group_organizer_email VARCHAR(255) NOT NULL,
  group_organizer_name VARCHAR(255) NOT NULL,
  group_organizer_phone VARCHAR(50),

  -- Registration Details
  total_attendees INTEGER NOT NULL,
  registration_type VARCHAR(50) NOT NULL,

  -- Pricing
  per_person_fee DECIMAL(10,2) NOT NULL,
  group_discount_percent DECIMAL(5,2) DEFAULT 0,
  total_fee DECIMAL(10,2) NOT NULL,

  -- Payment
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_date TIMESTAMP,
  payment_reference VARCHAR(255),

  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'

  -- Metadata
  special_requests TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Link individual registrations to group
ALTER TABLE conference_registrations
ADD COLUMN IF NOT EXISTS group_registration_id UUID REFERENCES group_registrations(id),
ADD COLUMN IF NOT EXISTS is_group_organizer BOOLEAN DEFAULT FALSE;

-- Session/Workshop Selections (enhance existing session_attendance)
-- The session_attendance table already exists, but let's add some helpful columns
ALTER TABLE session_attendance
ADD COLUMN IF NOT EXISTS selection_priority INTEGER, -- User's preference ranking
ADD COLUMN IF NOT EXISTS waitlisted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;

-- Registration modifications tracking
CREATE TABLE IF NOT EXISTS registration_modifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES conference_registrations(id) NOT NULL,

  -- Modification Details
  modification_type VARCHAR(50) NOT NULL, -- 'personal_info', 'dietary', 'sessions', 'cancellation'
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,

  -- Who made the change
  modified_by VARCHAR(255), -- Email or 'system' or 'admin'
  modification_reason TEXT,

  -- Metadata
  modified_at TIMESTAMP DEFAULT NOW()
);

-- Email confirmations and communications log
CREATE TABLE IF NOT EXISTS registration_emails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  registration_id UUID REFERENCES conference_registrations(id) NOT NULL,

  -- Email Details
  email_type VARCHAR(50) NOT NULL, -- 'confirmation', 'payment_receipt', 'reminder', 'modification'
  recipient_email VARCHAR(255) NOT NULL,
  subject TEXT NOT NULL,

  -- Status
  sent_at TIMESTAMP,
  delivery_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,

  -- Content
  template_used VARCHAR(100),
  email_content TEXT,

  -- External IDs
  email_provider_id VARCHAR(255), -- SendGrid/Mailgun message ID

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conference capacity and limits
ALTER TABLE conference_editions
ADD COLUMN IF NOT EXISTS max_attendees INTEGER,
ADD COLUMN IF NOT EXISTS current_attendee_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enable_waitlist BOOLEAN DEFAULT TRUE;

-- Session capacity
ALTER TABLE conference_sessions
ADD COLUMN IF NOT EXISTS max_capacity INTEGER,
ADD COLUMN IF NOT EXISTS current_registrations INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS enable_waitlist BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS requires_additional_fee BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS additional_fee DECIMAL(10,2);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_conference ON discount_codes(conference_id);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_discount_usage_code ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_usage_registration ON discount_code_usage(registration_id);
CREATE INDEX IF NOT EXISTS idx_group_registrations_conference ON group_registrations(conference_id);
CREATE INDEX IF NOT EXISTS idx_group_registrations_organizer ON group_registrations(group_organizer_email);
CREATE INDEX IF NOT EXISTS idx_registrations_group ON conference_registrations(group_registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_modifications_reg ON registration_modifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_emails_reg ON registration_emails(registration_id);
CREATE INDEX IF NOT EXISTS idx_registration_emails_type ON registration_emails(email_type);

-- Update attendee count trigger for conference editions
CREATE OR REPLACE FUNCTION update_conference_attendee_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE conference_editions
    SET current_attendee_count = current_attendee_count + 1
    WHERE id = NEW.conference_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
      UPDATE conference_editions
      SET current_attendee_count = current_attendee_count + 1
      WHERE id = NEW.conference_id;
    ELSIF OLD.status = 'confirmed' AND NEW.status != 'confirmed' THEN
      UPDATE conference_editions
      SET current_attendee_count = current_attendee_count - 1
      WHERE id = NEW.conference_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE conference_editions
    SET current_attendee_count = current_attendee_count - 1
    WHERE id = OLD.conference_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attendee_count
AFTER INSERT OR UPDATE OR DELETE ON conference_registrations
FOR EACH ROW
EXECUTE FUNCTION update_conference_attendee_count();

-- Update session registration count trigger
CREATE OR REPLACE FUNCTION update_session_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE conference_sessions
    SET current_registrations = current_registrations + 1
    WHERE id = NEW.session_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE conference_sessions
    SET current_registrations = current_registrations - 1
    WHERE id = OLD.session_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_session_count
AFTER INSERT OR DELETE ON session_attendance
FOR EACH ROW
EXECUTE FUNCTION update_session_registration_count();

-- Sample discount codes for ICSR2026
INSERT INTO discount_codes (code, description, discount_type, discount_value, valid_until, max_uses, is_active, conference_id)
SELECT
  'EARLYBIRD2026',
  'Early bird special - 10% off',
  'percentage',
  10,
  '2026-03-01'::TIMESTAMP,
  100,
  TRUE,
  id
FROM conference_editions
WHERE year = 2026
ON CONFLICT (code) DO NOTHING;

INSERT INTO discount_codes (code, description, discount_type, discount_value, applies_to_registration_types, valid_until, max_uses, is_active, conference_id)
SELECT
  'STUDENT50',
  'Student discount - $50 off',
  'fixed_amount',
  50,
  ARRAY['student'],
  '2026-09-30'::TIMESTAMP,
  NULL,
  TRUE,
  id
FROM conference_editions
WHERE year = 2026
ON CONFLICT (code) DO NOTHING;

INSERT INTO discount_codes (code, description, discount_type, discount_value, minimum_attendees, valid_until, is_active, conference_id)
SELECT
  'GROUP5',
  'Group discount - 15% off for 5+ attendees',
  'percentage',
  15,
  5,
  '2026-09-30'::TIMESTAMP,
  TRUE,
  id
FROM conference_editions
WHERE year = 2026
ON CONFLICT (code) DO NOTHING;

-- Update ICSR2026 with capacity limits
UPDATE conference_editions
SET
  max_attendees = 500,
  current_attendee_count = 0,
  enable_waitlist = TRUE
WHERE year = 2026;
