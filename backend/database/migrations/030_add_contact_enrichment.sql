-- Migration 030: Contact Enrichment System
-- Apollo.io and multi-provider contact data enrichment

-- Contact enrichment data from external APIs (Apollo, Clearbit, Hunter, etc.)
CREATE TABLE IF NOT EXISTS contact_enrichment (
  id SERIAL PRIMARY KEY,
  contact_id INTEGER, -- Links to contacts table (id column)
  attendee_id UUID REFERENCES attendee_profiles(id), -- Links to attendee profiles
  email VARCHAR(255) NOT NULL,
  enrichment_source VARCHAR(50) NOT NULL, -- 'apollo', 'clearbit', 'hunter', 'fullcontact', 'lusha'

  -- Person PII Data
  full_name VARCHAR(255),
  job_title VARCHAR(255),
  job_seniority VARCHAR(50), -- 'entry', 'manager', 'director', 'vp', 'c-level'
  job_role VARCHAR(255), -- 'engineering', 'sales', 'marketing', etc.
  department VARCHAR(255),
  location VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,

  -- Contact Data
  phone VARCHAR(50),
  mobile_phone VARCHAR(50),
  office_phone VARCHAR(50),
  email_confidence NUMERIC(3, 2), -- 0.00 to 1.00 confidence score

  -- Company Data
  company_name VARCHAR(255),
  company_domain VARCHAR(255),
  company_size VARCHAR(50), -- '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  company_industry VARCHAR(255),
  company_tags TEXT[],
  company_founded INTEGER,
  company_linkedin TEXT,

  -- Social Profiles
  linkedin_url TEXT,
  twitter_handle VARCHAR(100),

  -- Metadata
  enriched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  raw_data JSONB DEFAULT '{}'::jsonb, -- Complete API response for debugging

  -- Constraints
  UNIQUE(email, enrichment_source) -- One enrichment record per email per source
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_enrichment_contact ON contact_enrichment(contact_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_attendee ON contact_enrichment(attendee_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_email ON contact_enrichment(email);
CREATE INDEX IF NOT EXISTS idx_enrichment_company ON contact_enrichment(company_domain);
CREATE INDEX IF NOT EXISTS idx_enrichment_source ON contact_enrichment(enrichment_source);
CREATE INDEX IF NOT EXISTS idx_enrichment_enriched_at ON contact_enrichment(enriched_at DESC);

-- API usage logging for enrichment services
CREATE TABLE IF NOT EXISTS enrichment_api_logs (
  id SERIAL PRIMARY KEY,
  api_name VARCHAR(100) NOT NULL, -- 'apollo', 'clearbit', etc.
  endpoint VARCHAR(500),
  success BOOLEAN DEFAULT TRUE,
  response_time_ms INTEGER,
  credits_used INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enrichment_api_logs_name ON enrichment_api_logs(api_name);
CREATE INDEX IF NOT EXISTS idx_enrichment_api_logs_created ON enrichment_api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_enrichment_api_logs_success ON enrichment_api_logs(success);

-- Comments for documentation
COMMENT ON TABLE contact_enrichment IS 'Enriched contact data from Apollo.io, Clearbit, Hunter.io, and other APIs';
COMMENT ON TABLE enrichment_api_logs IS 'Logging for contact enrichment API usage and rate limiting';
COMMENT ON COLUMN contact_enrichment.raw_data IS 'Complete API response stored as JSON for debugging and future data extraction';
COMMENT ON COLUMN contact_enrichment.enrichment_source IS 'Which API provided this data: apollo, clearbit, hunter, fullcontact, or lusha';
COMMENT ON COLUMN contact_enrichment.email_confidence IS 'Confidence score (0-1) for email validity from the enrichment provider';
