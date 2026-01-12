-- Migration 018: Create Funding Prospects Management System
-- Based on SAFMC interview tracking system
-- Supports both organization and individual funding prospects

-- Create funding_prospects table
CREATE TABLE IF NOT EXISTS funding_prospects (
  id SERIAL PRIMARY KEY,

  -- Type: organization or individual
  prospect_type VARCHAR(20) NOT NULL CHECK (prospect_type IN ('organization', 'individual')),

  -- Organization information (for org prospects)
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  organization_name VARCHAR(255),
  organization_type VARCHAR(100), -- Foundation, Government, Corporate, Individual

  -- Individual information (for individual prospects or org contacts)
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_title VARCHAR(255),

  -- Funding details
  funding_type VARCHAR(100), -- Grant, Donation, Sponsorship, Partnership
  funding_focus VARCHAR(255), -- Research, Operations, Programs, Conference, etc.
  estimated_amount DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  funding_cycle VARCHAR(100), -- Annual, Quarterly, One-time, Multi-year

  -- Status tracking (adapted from SAFMC interview workflow)
  status VARCHAR(50) NOT NULL DEFAULT 'prospect',
  -- Statuses: prospect, contacted, interested, application_submitted, under_review,
  --           funded, declined, withdrawn, on_hold

  priority VARCHAR(20) DEFAULT 'medium', -- high, medium, low
  tier INTEGER DEFAULT 2 CHECK (tier IN (1, 2, 3)), -- 1=highest priority

  -- Engagement tracking
  first_contact_date DATE,
  last_contact_date DATE,
  next_follow_up_date DATE,
  application_submitted_date DATE,
  decision_date DATE,
  award_date DATE,

  -- Assignment and follow-up
  assigned_to VARCHAR(255), -- Email of board/AP member
  follow_up_flag BOOLEAN DEFAULT FALSE,
  follow_up_assigned_to TEXT, -- Comma-separated emails or JSON array
  follow_up_notes TEXT,

  -- Proposal/application tracking
  proposal_status VARCHAR(50), -- draft, submitted, approved, rejected
  proposal_deadline DATE,
  reporting_requirements TEXT,
  compliance_status VARCHAR(50), -- current, overdue, completed

  -- Award details (if funded)
  awarded_amount DECIMAL(12, 2),
  award_start_date DATE,
  award_end_date DATE,
  award_restrictions TEXT,

  -- Additional information
  website_url VARCHAR(500),
  address TEXT,
  city VARCHAR(100),
  state_province VARCHAR(100),
  country VARCHAR(100) DEFAULT 'United States',
  postal_code VARCHAR(20),

  -- Internal notes and tags
  notes TEXT,
  tags TEXT, -- Comma-separated or JSON array
  internal_notes TEXT, -- Private notes for board/AP only

  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Source tracking
  source VARCHAR(100), -- How we found this prospect: referral, research, event, etc.
  source_details TEXT
);

-- Create indexes for common queries
CREATE INDEX idx_funding_prospects_status ON funding_prospects(status);
CREATE INDEX idx_funding_prospects_priority ON funding_prospects(priority);
CREATE INDEX idx_funding_prospects_tier ON funding_prospects(tier);
CREATE INDEX idx_funding_prospects_type ON funding_prospects(prospect_type);
CREATE INDEX idx_funding_prospects_assigned ON funding_prospects(assigned_to);
CREATE INDEX idx_funding_prospects_follow_up ON funding_prospects(follow_up_flag);
CREATE INDEX idx_funding_prospects_org ON funding_prospects(organization_id);
CREATE INDEX idx_funding_prospects_contact ON funding_prospects(contact_id);
CREATE INDEX idx_funding_prospects_next_followup ON funding_prospects(next_follow_up_date);

-- Create funding_engagements table (interaction history)
CREATE TABLE IF NOT EXISTS funding_engagements (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES funding_prospects(id) ON DELETE CASCADE,

  -- Engagement details
  engagement_type VARCHAR(50) NOT NULL,
  -- Types: email, call, meeting, proposal_submitted, follow_up, site_visit, event, other

  engagement_date DATE NOT NULL,
  duration_minutes INTEGER,

  -- Participants
  isrs_participants TEXT, -- Comma-separated emails
  prospect_participants TEXT,

  -- Content
  subject VARCHAR(500),
  notes TEXT,
  outcome VARCHAR(100), -- positive, neutral, negative, action_required

  -- Follow-up
  requires_follow_up BOOLEAN DEFAULT FALSE,
  follow_up_date DATE,

  -- Attachments/links
  attachments TEXT, -- JSON array of file paths or URLs

  -- Metadata
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_funding_engagements_prospect ON funding_engagements(prospect_id);
CREATE INDEX idx_funding_engagements_date ON funding_engagements(engagement_date);
CREATE INDEX idx_funding_engagements_type ON funding_engagements(engagement_type);

-- Create funding_activities table (audit log)
CREATE TABLE IF NOT EXISTS funding_activities (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES funding_prospects(id) ON DELETE CASCADE,

  action_type VARCHAR(50) NOT NULL,
  -- Types: created, updated, status_changed, assigned, follow_up_added,
  --        engagement_logged, proposal_submitted, awarded, declined

  action_description TEXT,

  -- Changed fields (for updates)
  old_value TEXT,
  new_value TEXT,
  field_name VARCHAR(100),

  -- User tracking
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  ip_address VARCHAR(45),

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_funding_activities_prospect ON funding_activities(prospect_id);
CREATE INDEX idx_funding_activities_user ON funding_activities(user_email);
CREATE INDEX idx_funding_activities_created ON funding_activities(created_at);

-- Update admin_users table to add super_admin role
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Grant super admin privileges to specified users
UPDATE admin_users SET is_super_admin = TRUE
WHERE email IN (
  'akorn@akornenvironmental.com',
  'lisa.paton@example.com', -- Update with actual email
  'dorothy.leonard@example.com', -- Update with actual email
  'erin.flaherty@example.com' -- Update with actual email
);

-- Create view for funding dashboard stats
CREATE OR REPLACE VIEW funding_dashboard_stats AS
SELECT
  COUNT(*) as total_prospects,
  COUNT(*) FILTER (WHERE prospect_type = 'organization') as organization_prospects,
  COUNT(*) FILTER (WHERE prospect_type = 'individual') as individual_prospects,
  COUNT(*) FILTER (WHERE status = 'prospect') as new_prospects,
  COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
  COUNT(*) FILTER (WHERE status = 'interested') as interested,
  COUNT(*) FILTER (WHERE status = 'application_submitted') as applications_submitted,
  COUNT(*) FILTER (WHERE status = 'under_review') as under_review,
  COUNT(*) FILTER (WHERE status = 'funded') as funded,
  COUNT(*) FILTER (WHERE status = 'declined') as declined,
  SUM(estimated_amount) FILTER (WHERE status NOT IN ('declined', 'withdrawn')) as total_estimated_funding,
  SUM(awarded_amount) FILTER (WHERE status = 'funded') as total_awarded_funding,
  COUNT(*) FILTER (WHERE tier = 1) as tier1_prospects,
  COUNT(*) FILTER (WHERE tier = 2) as tier2_prospects,
  COUNT(*) FILTER (WHERE tier = 3) as tier3_prospects,
  COUNT(*) FILTER (WHERE follow_up_flag = TRUE) as prospects_needing_followup,
  COUNT(*) FILTER (WHERE next_follow_up_date <= CURRENT_DATE AND status NOT IN ('funded', 'declined', 'withdrawn')) as overdue_followups
FROM funding_prospects;

-- Add comments for documentation
COMMENT ON TABLE funding_prospects IS 'Main table for tracking funding prospects (organizations and individuals)';
COMMENT ON TABLE funding_engagements IS 'Tracks all interactions and engagements with funding prospects';
COMMENT ON TABLE funding_activities IS 'Audit log of all changes to funding prospects';
COMMENT ON COLUMN funding_prospects.tier IS '1=highest priority, 2=medium priority, 3=lower priority';
COMMENT ON COLUMN funding_prospects.status IS 'Workflow status: prospect, contacted, interested, application_submitted, under_review, funded, declined, withdrawn, on_hold';
