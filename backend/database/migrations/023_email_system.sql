-- Migration 023: Email Communication System
-- Email templates, campaigns, and tracking for bulk communications

-- Email Templates
CREATE TABLE IF NOT EXISTS email_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  template_type VARCHAR(50) CHECK (template_type IN ('funding_followup', 'conference_invite', 'newsletter', 'custom')),
  variables JSONB, -- {firstName, lastName, organization, etc.}
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Email Campaigns
CREATE TABLE IF NOT EXISTS email_campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  template_id INTEGER REFERENCES email_templates(id),
  subject VARCHAR(500) NOT NULL,
  body TEXT NOT NULL,
  target_audience VARCHAR(100), -- 'all_contacts', 'board_members', 'funding_prospects', 'conference_attendees', 'custom'
  filter_criteria JSONB, -- Store complex filtering rules
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_send_date TIMESTAMP,
  sent_at TIMESTAMP,
  total_recipients INTEGER DEFAULT 0,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  bounced_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaign Recipients (tracking individual sends)
CREATE TABLE IF NOT EXISTS campaign_recipients (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'unsubscribed')),
  sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  bounce_reason TEXT,
  message_id VARCHAR(255), -- AWS SES Message ID
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email Click Tracking
CREATE TABLE IF NOT EXISTS email_clicks (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES email_campaigns(id) ON DELETE CASCADE,
  recipient_id INTEGER NOT NULL REFERENCES campaign_recipients(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  clicked_at TIMESTAMP DEFAULT NOW()
);

-- Email Unsubscribes
CREATE TABLE IF NOT EXISTS email_unsubscribes (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  contact_id UUID REFERENCES contacts(id),
  reason TEXT,
  unsubscribed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_contact ON campaign_recipients(contact_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_status ON campaign_recipients(status);
CREATE INDEX IF NOT EXISTS idx_email_clicks_campaign ON email_clicks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_email_unsubscribes_email ON email_unsubscribes(email);

-- Comments
COMMENT ON TABLE email_templates IS 'Reusable email templates with variable substitution';
COMMENT ON TABLE email_campaigns IS 'Email campaigns sent to groups of contacts';
COMMENT ON TABLE campaign_recipients IS 'Individual recipient tracking for each campaign';
COMMENT ON TABLE email_clicks IS 'Track link clicks within emails';
COMMENT ON TABLE email_unsubscribes IS 'Global unsubscribe list';
