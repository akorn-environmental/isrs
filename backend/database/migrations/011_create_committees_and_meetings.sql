-- Migration 011: Create Committees and Meetings System
-- Creates tables for ISRS board, committees, and meeting management

-- =====================================================
-- COMMITTEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('board', 'advisory_panel', 'standing', 'ad_hoc')),
  description TEXT,
  purpose TEXT,
  chair_id UUID REFERENCES attendee_profiles(id),
  vice_chair_id UUID REFERENCES attendee_profiles(id),
  is_active BOOLEAN DEFAULT TRUE,
  meeting_frequency VARCHAR(50), -- e.g., 'monthly', 'quarterly', 'as_needed'
  typical_meeting_duration INTEGER, -- in minutes
  email_list VARCHAR(255), -- committee email if exists
  formed_date DATE,
  dissolved_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_committees_type ON committees(type);
CREATE INDEX idx_committees_active ON committees(is_active);
CREATE INDEX idx_committees_chair ON committees(chair_id);

COMMENT ON TABLE committees IS 'ISRS committees including Board, Advisory Panel, and various committees';
COMMENT ON COLUMN committees.type IS 'Type: board, advisory_panel, standing (permanent), or ad_hoc (temporary)';
COMMENT ON COLUMN committees.meeting_frequency IS 'How often the committee typically meets';

-- =====================================================
-- COMMITTEE MEMBERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES attendee_profiles(id) ON DELETE CASCADE,
  role VARCHAR(100), -- e.g., 'Chair', 'Vice Chair', 'Secretary', 'Member'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  term_length VARCHAR(50), -- e.g., '2 years', '1 year'
  voting_member BOOLEAN DEFAULT TRUE,
  notes TEXT,
  calendar_link VARCHAR(500), -- Personal Calendly/booking link
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(committee_id, member_id, start_date)
);

CREATE INDEX idx_committee_members_committee ON committee_members(committee_id);
CREATE INDEX idx_committee_members_member ON committee_members(member_id);
CREATE INDEX idx_committee_members_active ON committee_members(is_active);

COMMENT ON TABLE committee_members IS 'Members of each committee with their roles and terms';
COMMENT ON COLUMN committee_members.calendar_link IS 'Personal scheduling link (Calendly, etc.) for individual member';

-- =====================================================
-- MEETINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_type VARCHAR(50) CHECK (meeting_type IN ('regular', 'special', 'emergency', 'workshop', 'retreat')),

  -- Scheduling
  scheduled_start TIMESTAMP NOT NULL,
  scheduled_end TIMESTAMP NOT NULL,
  timezone VARCHAR(50) DEFAULT 'America/New_York',

  -- Location/Format
  location VARCHAR(255),
  is_virtual BOOLEAN DEFAULT TRUE,
  meeting_url VARCHAR(500), -- Zoom, Teams, etc.
  meeting_password VARCHAR(100),
  dial_in_number VARCHAR(50),

  -- Status
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  cancelled_reason TEXT,

  -- Meeting details
  agenda_url VARCHAR(500),
  minutes_url VARCHAR(500),
  recording_url VARCHAR(500),

  -- Recurring meetings
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern VARCHAR(50), -- 'weekly', 'monthly', 'quarterly'
  recurrence_end_date DATE,
  parent_meeting_id UUID REFERENCES meetings(id), -- for recurring meetings

  -- Quorum and attendance
  quorum_required INTEGER, -- minimum attendees needed
  attendance_count INTEGER DEFAULT 0,

  -- Organizer
  created_by UUID REFERENCES attendee_profiles(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meetings_committee ON meetings(committee_id);
CREATE INDEX idx_meetings_scheduled_start ON meetings(scheduled_start);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_created_by ON meetings(created_by);
CREATE INDEX idx_meetings_parent ON meetings(parent_meeting_id);

COMMENT ON TABLE meetings IS 'All committee and board meetings';
COMMENT ON COLUMN meetings.meeting_type IS 'Type of meeting: regular scheduled, special, emergency, etc.';
COMMENT ON COLUMN meetings.status IS 'Current status: draft, scheduled, in_progress, completed, cancelled';

-- =====================================================
-- MEETING ATTENDEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  attendee_id UUID NOT NULL REFERENCES attendee_profiles(id) ON DELETE CASCADE,

  -- Invitation
  invitation_sent_at TIMESTAMP,
  invitation_status VARCHAR(50) DEFAULT 'pending' CHECK (invitation_status IN ('pending', 'sent', 'failed')),

  -- RSVP
  rsvp_status VARCHAR(50) DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'accepted', 'declined', 'tentative', 'no_response')),
  rsvp_at TIMESTAMP,
  rsvp_note TEXT,

  -- Attendance
  attended BOOLEAN,
  check_in_time TIMESTAMP,
  check_out_time TIMESTAMP,

  -- Role in meeting
  role VARCHAR(100), -- 'presenter', 'facilitator', 'note_taker', 'attendee'
  is_required BOOLEAN DEFAULT FALSE, -- required for quorum

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(meeting_id, attendee_id)
);

CREATE INDEX idx_meeting_attendees_meeting ON meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_attendee ON meeting_attendees(attendee_id);
CREATE INDEX idx_meeting_attendees_rsvp ON meeting_attendees(rsvp_status);

COMMENT ON TABLE meeting_attendees IS 'Invitations, RSVPs, and attendance tracking for meetings';
COMMENT ON COLUMN meeting_attendees.is_required IS 'Whether this person is required for quorum';

-- =====================================================
-- MEETING AGENDA ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  item_order INTEGER NOT NULL,
  duration_minutes INTEGER, -- estimated time for this item

  item_type VARCHAR(50) CHECK (item_type IN ('discussion', 'decision', 'information', 'presentation', 'vote')),
  presenter_id UUID REFERENCES attendee_profiles(id),

  -- Attachments
  attachment_url VARCHAR(500),
  attachment_name VARCHAR(255),

  -- Completion
  is_completed BOOLEAN DEFAULT FALSE,
  outcome TEXT, -- what was decided/discussed

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_agenda_items_meeting ON meeting_agenda_items(meeting_id);
CREATE INDEX idx_agenda_items_order ON meeting_agenda_items(item_order);
CREATE INDEX idx_agenda_items_presenter ON meeting_agenda_items(presenter_id);

COMMENT ON TABLE meeting_agenda_items IS 'Agenda items for each meeting';
COMMENT ON COLUMN meeting_agenda_items.item_type IS 'Type: discussion, decision, information, presentation, or vote';

-- =====================================================
-- MEETING VOTES TABLE (for decisions requiring votes)
-- =====================================================
CREATE TABLE IF NOT EXISTS meeting_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  agenda_item_id UUID REFERENCES meeting_agenda_items(id) ON DELETE SET NULL,

  motion_text TEXT NOT NULL,
  motion_by UUID REFERENCES attendee_profiles(id), -- who made the motion
  seconded_by UUID REFERENCES attendee_profiles(id), -- who seconded

  vote_type VARCHAR(50) CHECK (vote_type IN ('simple_majority', 'two_thirds', 'unanimous', 'roll_call')),

  votes_yes INTEGER DEFAULT 0,
  votes_no INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  votes_absent INTEGER DEFAULT 0,

  passed BOOLEAN,
  vote_time TIMESTAMP DEFAULT NOW(),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_meeting_votes_meeting ON meeting_votes(meeting_id);
CREATE INDEX idx_meeting_votes_agenda_item ON meeting_votes(agenda_item_id);

COMMENT ON TABLE meeting_votes IS 'Formal votes taken during meetings';

-- =====================================================
-- INITIAL DATA - Create default committees
-- =====================================================

-- Board of Directors
INSERT INTO committees (name, type, description, meeting_frequency, typical_meeting_duration, is_active)
VALUES
  ('Board of Directors', 'board', 'ISRS Board of Directors - governing body of the society', 'quarterly', 120, TRUE),
  ('Advisory Panel', 'advisory_panel', 'ISRS Advisory Panel - provides guidance and expertise to the board', 'biannual', 90, TRUE),
  ('Conference Planning Committee', 'standing', 'Plans and organizes the annual ISRS conference', 'monthly', 60, TRUE),
  ('Publications Committee', 'standing', 'Oversees society publications and communications', 'monthly', 60, TRUE),
  ('Membership Committee', 'standing', 'Manages membership recruitment, retention, and benefits', 'quarterly', 60, TRUE),
  ('Finance Committee', 'standing', 'Oversees financial matters and budget', 'quarterly', 90, TRUE)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE committees IS 'Migration 011: Created committees and meetings system for ISRS governance';
