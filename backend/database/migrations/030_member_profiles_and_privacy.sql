-- Migration 030: Member Profiles, Directory, and Privacy Features
-- Enhances attendee_profiles for public member directory and adds privacy controls

-- Add privacy and directory fields to attendee_profiles
ALTER TABLE attendee_profiles
ADD COLUMN IF NOT EXISTS directory_opt_in BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS directory_visible_fields JSONB DEFAULT '{"name": true, "photo": true, "country": true, "organization": true, "title": true, "bio": true, "expertise": true, "contact_email": false, "contact_phone": false, "website": true, "linkedin": true, "conference_history": true}'::jsonb,
ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS privacy_consent_given BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_consent_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS privacy_consent_ip VARCHAR(50),
ADD COLUMN IF NOT EXISTS terms_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS terms_accepted_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS data_export_requested_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS account_deletion_requested_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"email_updates": true, "conference_news": true, "member_digest": true, "research_alerts": false}'::jsonb;

-- Create table for conference participation history (enriched from registrations)
CREATE TABLE IF NOT EXISTS member_conference_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendee_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,
  conference_id UUID REFERENCES conference_editions(id) ON DELETE CASCADE NOT NULL,

  -- Participation Details
  attendance_type VARCHAR(50), -- 'in-person', 'virtual', 'hybrid'
  roles TEXT[], -- ['presenter', 'exhibitor', 'sponsor', 'volunteer', 'organizer']

  -- Presentations given at this conference
  presentations JSONB, -- [{title, type, session, co_authors}]

  -- Sponsorship/Exhibition
  sponsor_level VARCHAR(100), -- If they were a sponsor
  booth_number VARCHAR(50), -- If they were an exhibitor

  -- Engagement metrics
  sessions_attended INTEGER DEFAULT 0,
  networking_events_attended INTEGER DEFAULT 0,

  -- Visibility in directory for this conference
  show_in_history BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(attendee_id, conference_id)
);

-- Create table for data export requests (GDPR compliance)
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attendee_id UUID REFERENCES attendee_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Request details
  request_type VARCHAR(50) DEFAULT 'data_export', -- 'data_export', 'account_deletion'
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

  -- Processing
  requested_by_email VARCHAR(255) NOT NULL,
  requested_by_ip VARCHAR(50),
  processed_at TIMESTAMP,
  processed_by VARCHAR(255), -- Admin who processed

  -- Export details (for data_export type)
  export_file_url TEXT,
  export_file_expires_at TIMESTAMP,

  -- Deletion details (for account_deletion type)
  deletion_confirmed BOOLEAN DEFAULT FALSE,
  deletion_completed_at TIMESTAMP,
  deletion_reason TEXT,

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create table for profile view/search analytics (privacy-friendly)
CREATE TABLE IF NOT EXISTS directory_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Aggregated data only (no individual tracking)
  date DATE NOT NULL,
  search_term VARCHAR(255),
  filter_type VARCHAR(50), -- 'country', 'expertise', 'organization', 'conference'
  filter_value VARCHAR(255),
  result_count INTEGER,

  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(date, search_term, filter_type, filter_value)
);

-- Function to calculate profile completion score
CREATE OR REPLACE FUNCTION calculate_profile_completion(attendee_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  profile RECORD;
BEGIN
  SELECT * INTO profile FROM attendee_profiles WHERE id = attendee_uuid;

  IF profile IS NULL THEN
    RETURN 0;
  END IF;

  -- Required fields (5 points each)
  IF profile.first_name IS NOT NULL AND profile.first_name != '' THEN score := score + 5; END IF;
  IF profile.last_name IS NOT NULL AND profile.last_name != '' THEN score := score + 5; END IF;
  IF profile.user_email IS NOT NULL AND profile.user_email != '' THEN score := score + 5; END IF;
  IF profile.country IS NOT NULL AND profile.country != '' THEN score := score + 5; END IF;

  -- Organization (10 points)
  IF profile.organization_id IS NOT NULL OR (profile.organization_name IS NOT NULL AND profile.organization_name != '') THEN
    score := score + 10;
  END IF;

  -- Professional details (10 points each)
  IF profile.position IS NOT NULL AND profile.position != '' THEN score := score + 10; END IF;
  IF profile.bio IS NOT NULL AND profile.bio != '' THEN score := score + 10; END IF;

  -- Contact info (5 points each)
  IF profile.phone IS NOT NULL AND profile.phone != '' THEN score := score + 5; END IF;
  IF profile.city IS NOT NULL AND profile.city != '' THEN score := score + 5; END IF;

  -- Professional presence (5 points each)
  IF profile.website IS NOT NULL AND profile.website != '' THEN score := score + 5; END IF;
  IF profile.linkedin_url IS NOT NULL AND profile.linkedin_url != '' THEN score := score + 5; END IF;
  IF profile.profile_photo_url IS NOT NULL AND profile.profile_photo_url != '' THEN score := score + 5; END IF;

  -- Research areas (10 points)
  IF profile.research_areas IS NOT NULL AND array_length(profile.research_areas, 1) > 0 THEN
    score := score + 10;
  END IF;

  -- Expertise keywords (5 points)
  IF profile.expertise_keywords IS NOT NULL AND array_length(profile.expertise_keywords, 1) > 0 THEN
    score := score + 5;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion score
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_score := calculate_profile_completion(NEW.id);

  -- Mark profile as completed if score is 80 or higher
  IF NEW.profile_completion_score >= 80 AND NEW.profile_completed_at IS NULL THEN
    NEW.profile_completed_at := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update profile completion score
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON attendee_profiles;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE INSERT OR UPDATE ON attendee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion_score();

-- Function to populate conference history from existing data
CREATE OR REPLACE FUNCTION populate_conference_history()
RETURNS void AS $$
BEGIN
  -- Insert records from conference_registrations
  INSERT INTO member_conference_history (attendee_id, conference_id, attendance_type, roles)
  SELECT
    cr.attendee_id,
    cr.conference_id,
    CASE
      WHEN cr.is_virtual THEN 'virtual'
      ELSE 'in-person'
    END as attendance_type,
    ARRAY[
      CASE WHEN cr.is_presenter THEN 'presenter' END,
      CASE WHEN cr.willing_to_volunteer THEN 'volunteer' END
    ]::TEXT[] as roles
  FROM conference_registrations cr
  WHERE cr.payment_status = 'paid'
  ON CONFLICT (attendee_id, conference_id) DO NOTHING;

  -- Update with presentation data from abstract_submissions
  UPDATE member_conference_history mch
  SET presentations = (
    SELECT jsonb_agg(
      jsonb_build_object(
        'title', abs.title,
        'type', abs.presentation_type,
        'session', abs.session_name,
        'co_authors', abs.co_authors
      )
    )
    FROM abstract_submissions abs
    WHERE abs.attendee_id = mch.attendee_id
      AND abs.conference_id = mch.conference_id
      AND abs.status IN ('accepted', 'accepted_oral', 'accepted_poster')
  )
  WHERE EXISTS (
    SELECT 1 FROM abstract_submissions abs
    WHERE abs.attendee_id = mch.attendee_id
      AND abs.conference_id = mch.conference_id
      AND abs.status IN ('accepted', 'accepted_oral', 'accepted_poster')
  );
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendee_directory_opt_in ON attendee_profiles(directory_opt_in) WHERE directory_opt_in = TRUE;
CREATE INDEX IF NOT EXISTS idx_attendee_profile_score ON attendee_profiles(profile_completion_score DESC);
CREATE INDEX IF NOT EXISTS idx_attendee_privacy_consent ON attendee_profiles(privacy_consent_given);
CREATE INDEX IF NOT EXISTS idx_conference_history_attendee ON member_conference_history(attendee_id);
CREATE INDEX IF NOT EXISTS idx_conference_history_conference ON member_conference_history(conference_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_export_attendee ON data_export_requests(attendee_id);

-- Create view for public member directory (only opt-in members)
CREATE OR REPLACE VIEW member_directory AS
SELECT
  ap.id,
  ap.first_name,
  ap.last_name,
  ap.first_name || ' ' || ap.last_name as full_name,
  ap.profile_photo_url,
  ap.country,
  ap.city,
  ap.organization_name,
  COALESCE(o.name, ap.organization_name) as organization,
  ap.position,
  ap.bio,
  ap.research_areas,
  ap.expertise_keywords,
  ap.website,
  ap.linkedin_url,
  ap.twitter_handle,
  -- Only show contact info if visible in preferences
  CASE
    WHEN ap.directory_visible_fields->>'contact_email' = 'true' THEN ap.user_email
    ELSE NULL
  END as email,
  CASE
    WHEN ap.directory_visible_fields->>'contact_phone' = 'true' THEN ap.phone
    ELSE NULL
  END as phone,
  -- Conference history (if visible)
  CASE
    WHEN ap.directory_visible_fields->>'conference_history' = 'true' THEN (
      SELECT jsonb_agg(
        jsonb_build_object(
          'year', year_data.year,
          'name', year_data.name,
          'location', year_data.location,
          'roles', year_data.roles,
          'presentations', year_data.presentations,
          'sponsor_level', year_data.sponsor_level
        ) ORDER BY year_data.year DESC
      )
      FROM (
        SELECT
          ce.year,
          ce.name,
          ce.location,
          mch.roles,
          mch.presentations,
          mch.sponsor_level
        FROM member_conference_history mch
        JOIN conference_editions ce ON mch.conference_id = ce.id
        WHERE mch.attendee_id = ap.id
          AND mch.show_in_history = TRUE
      ) year_data
    )
    ELSE NULL
  END as conference_history,
  ap.profile_completion_score,
  ap.created_at,
  ap.updated_at
FROM attendee_profiles ap
LEFT JOIN organizations o ON ap.organization_id = o.id
WHERE ap.directory_opt_in = TRUE
  AND ap.account_status = 'active'
  AND ap.privacy_consent_given = TRUE;

-- Populate conference history from existing data
SELECT populate_conference_history();

-- Update profile completion scores for all existing profiles
UPDATE attendee_profiles
SET profile_completion_score = calculate_profile_completion(id);

COMMENT ON TABLE member_conference_history IS 'Tracks member participation across ICSR conferences for profile display';
COMMENT ON TABLE data_export_requests IS 'GDPR compliance: tracks data export and account deletion requests';
COMMENT ON VIEW member_directory IS 'Public-facing member directory showing only opted-in members with privacy preferences applied';
