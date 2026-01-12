-- AI Grant Writing Assistant System

-- Grant drafts and proposals
CREATE TABLE IF NOT EXISTS grant_drafts (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES funding_prospects(id),
  title VARCHAR(500) NOT NULL,
  grant_type VARCHAR(100),
  funding_amount DECIMAL(12, 2),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'draft',
  
  -- Grant sections
  executive_summary TEXT,
  project_description TEXT,
  objectives TEXT[],
  methodology TEXT,
  budget_narrative TEXT,
  timeline TEXT,
  impact_statement TEXT,
  organizational_background TEXT,
  personnel TEXT,
  evaluation_plan TEXT,
  sustainability_plan TEXT,
  
  -- AI metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_model VARCHAR(100),
  prompt_used TEXT,
  generation_metadata JSONB,
  
  -- Version control
  version INTEGER DEFAULT 1,
  parent_draft_id INTEGER REFERENCES grant_drafts(id),
  
  -- Collaboration
  created_by VARCHAR(255),
  last_edited_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- AI generation requests log
CREATE TABLE IF NOT EXISTS ai_grant_generations (
  id SERIAL PRIMARY KEY,
  draft_id INTEGER REFERENCES grant_drafts(id),
  prospect_id INTEGER REFERENCES funding_prospects(id),
  
  -- Input parameters
  section VARCHAR(100),
  context_data JSONB,
  prompt TEXT,
  
  -- Output
  generated_content TEXT,
  model_used VARCHAR(100),
  tokens_used INTEGER,
  generation_time_ms INTEGER,
  
  -- Quality metrics
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  user_feedback TEXT,
  accepted BOOLEAN DEFAULT false,
  
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Grant writing templates
CREATE TABLE IF NOT EXISTS grant_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  grant_type VARCHAR(100),
  funder_type VARCHAR(100),
  
  -- Template structure
  sections JSONB NOT NULL,
  guidelines TEXT,
  word_limits JSONB,
  required_sections TEXT[],
  
  -- AI instructions
  ai_writing_style TEXT,
  ai_tone TEXT,
  ai_focus_areas TEXT[],
  
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grant_drafts_prospect ON grant_drafts(prospect_id);
CREATE INDEX IF NOT EXISTS idx_grant_drafts_status ON grant_drafts(status);
CREATE INDEX IF NOT EXISTS idx_grant_drafts_created_by ON grant_drafts(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_generations_draft ON ai_grant_generations(draft_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_section ON ai_grant_generations(section);
CREATE INDEX IF NOT EXISTS idx_grant_templates_type ON grant_templates(grant_type);
