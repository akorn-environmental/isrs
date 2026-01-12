-- Create import_logs table for tracking import history
CREATE TABLE IF NOT EXISTS import_logs (
  id SERIAL PRIMARY KEY,
  import_type VARCHAR(50) NOT NULL, -- 'file_upload', 'api', 'manual', etc.
  file_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  errors JSONB,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  duration_seconds INTEGER,
  imported_by VARCHAR(255), -- Email of user who performed import
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for querying by status and date
CREATE INDEX idx_import_logs_status ON import_logs(status);
CREATE INDEX idx_import_logs_created_at ON import_logs(created_at DESC);
CREATE INDEX idx_import_logs_imported_by ON import_logs(imported_by);

-- Add source tracking fields to contacts table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='contacts' AND column_name='source_provider') THEN
    ALTER TABLE contacts ADD COLUMN source_provider VARCHAR(255);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='contacts' AND column_name='source_date') THEN
    ALTER TABLE contacts ADD COLUMN source_date DATE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='contacts' AND column_name='source_description') THEN
    ALTER TABLE contacts ADD COLUMN source_description TEXT;
  END IF;
END $$;

-- Add index for source tracking
CREATE INDEX IF NOT EXISTS idx_contacts_source_provider ON contacts(source_provider);
