-- Email Parsing System

-- Parsed emails storage
CREATE TABLE IF NOT EXISTS parsed_emails (
  id SERIAL PRIMARY KEY,
  
  -- Email metadata
  subject TEXT,
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  to_emails TEXT[],
  cc_emails TEXT[],
  received_date TIMESTAMP,
  thread_type VARCHAR(20),
  
  -- Raw email content
  email_body TEXT,
  email_html TEXT,
  
  -- Parsed data (JSON)
  contacts JSONB,
  relationships JSONB,
  engagement JSONB,
  fundraising JSONB,
  action_items JSONB,
  scheduling JSONB,
  topics JSONB,
  stakeholder_profile JSONB,
  metadata JSONB,
  
  -- AI analysis
  summary TEXT,
  recommended_next_steps TEXT[],
  flags TEXT[],
  overall_confidence INTEGER,
  
  -- Processing metadata
  parsed_at TIMESTAMP DEFAULT NOW(),
  parsed_by VARCHAR(255),
  review_status VARCHAR(50) DEFAULT 'pending',
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  
  -- Integration status
  contacts_imported BOOLEAN DEFAULT false,
  actions_created BOOLEAN DEFAULT false,
  calendar_synced BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Extracted contacts from emails
CREATE TABLE IF NOT EXISTS email_extracted_contacts (
  id SERIAL PRIMARY KEY,
  parsed_email_id INTEGER REFERENCES parsed_emails(id),
  
  -- Contact info
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  organization VARCHAR(255),
  title VARCHAR(255),
  address TEXT,
  
  -- Extraction metadata
  confidence INTEGER,
  source VARCHAR(50),
  
  -- Import status
  imported_to_contacts BOOLEAN DEFAULT false,
  contact_id UUID REFERENCES contacts(id),
  needs_review BOOLEAN DEFAULT false,
  review_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email action items
CREATE TABLE IF NOT EXISTS email_action_items (
  id SERIAL PRIMARY KEY,
  parsed_email_id INTEGER REFERENCES parsed_emails(id),
  
  -- Action details
  item TEXT NOT NULL,
  owner VARCHAR(255),
  deadline DATE,
  priority VARCHAR(20),
  confidence INTEGER,
  
  -- Status tracking
  status VARCHAR(50) DEFAULT 'pending',
  assigned_to VARCHAR(255),
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Email parsing queue (for automated processing)
CREATE TABLE IF NOT EXISTS email_parsing_queue (
  id SERIAL PRIMARY KEY,
  
  -- Email data
  raw_email TEXT,
  subject TEXT,
  from_email VARCHAR(255),
  
  -- Processing status
  status VARCHAR(50) DEFAULT 'queued',
  processed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_parsed_emails_from ON parsed_emails(from_email);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_date ON parsed_emails(received_date);
CREATE INDEX IF NOT EXISTS idx_parsed_emails_review ON parsed_emails(review_status);
CREATE INDEX IF NOT EXISTS idx_email_contacts_email ON email_extracted_contacts(email);
CREATE INDEX IF NOT EXISTS idx_email_contacts_imported ON email_extracted_contacts(imported_to_contacts);
CREATE INDEX IF NOT EXISTS idx_email_actions_status ON email_action_items(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_parsing_queue(status);
