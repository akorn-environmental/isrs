-- Migration: Create board documents system
-- For secure document management accessible only to board members

-- Board Documents table
CREATE TABLE IF NOT EXISTS board_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Document metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'Meeting Minutes', 'Bylaws & Governance', 'Financial Reports', 'Policies & Procedures'
  document_type VARCHAR(50), -- additional classification

  -- File information
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- S3 path or local path
  file_size BIGINT, -- in bytes
  file_type VARCHAR(100), -- MIME type

  -- Version control
  version VARCHAR(50) DEFAULT '1.0',
  version_number INTEGER DEFAULT 1,
  parent_document_id UUID REFERENCES board_documents(id), -- for version history
  is_latest_version BOOLEAN DEFAULT TRUE,

  -- Status and workflow
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'final', 'archived', 'superseded'
  approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  approved_by UUID,
  approved_at TIMESTAMP,

  -- Meeting association
  meeting_date DATE,
  meeting_id UUID, -- future: link to meetings table

  -- Dates
  document_date DATE, -- date the document is effective or refers to
  valid_from DATE,
  valid_until DATE,

  -- Access control
  visibility VARCHAR(50) DEFAULT 'board', -- 'board', 'executive_committee', 'all_members'
  is_confidential BOOLEAN DEFAULT FALSE,

  -- Audit trail
  uploaded_by UUID NOT NULL,
  uploaded_by_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID,

  -- Tags and search
  tags TEXT[], -- for categorization and search
  keywords TEXT[], -- for full-text search

  -- Additional metadata
  fiscal_year VARCHAR(10),
  notes TEXT
);

-- Document access log
CREATE TABLE IF NOT EXISTS board_document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES board_documents(id) ON DELETE CASCADE,
  user_id UUID,
  user_email VARCHAR(255),
  action VARCHAR(50) NOT NULL, -- 'view', 'download', 'upload', 'edit', 'delete'
  ip_address INET,
  user_agent TEXT,
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document comments/notes
CREATE TABLE IF NOT EXISTS board_document_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES board_documents(id) ON DELETE CASCADE,
  user_id UUID,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT TRUE, -- internal admin notes vs board discussion
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_board_documents_category ON board_documents(category);
CREATE INDEX IF NOT EXISTS idx_board_documents_status ON board_documents(status);
CREATE INDEX IF NOT EXISTS idx_board_documents_approval_status ON board_documents(approval_status);
CREATE INDEX IF NOT EXISTS idx_board_documents_meeting_date ON board_documents(meeting_date);
CREATE INDEX IF NOT EXISTS idx_board_documents_uploaded_by ON board_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_board_documents_is_latest ON board_documents(is_latest_version) WHERE is_latest_version = TRUE;
CREATE INDEX IF NOT EXISTS idx_board_documents_tags ON board_documents USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_board_documents_fiscal_year ON board_documents(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_board_document_access_log_document ON board_document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_board_document_access_log_user ON board_document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_board_document_comments_document ON board_document_comments(document_id);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_board_documents_search ON board_documents
  USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_board_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER board_documents_updated_at
  BEFORE UPDATE ON board_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_board_documents_updated_at();

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE ON board_documents TO isrs_app_user;
-- GRANT SELECT, INSERT ON board_document_access_log TO isrs_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON board_document_comments TO isrs_app_user;
