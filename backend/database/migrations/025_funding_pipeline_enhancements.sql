-- Migration 025: Funding Pipeline Enhancements
-- Add fields for Kanban-style pipeline visualization and tracking

-- Add pipeline-specific fields to funding_prospects
ALTER TABLE funding_prospects
ADD COLUMN IF NOT EXISTS pipeline_stage VARCHAR(50) DEFAULT 'research',
ADD COLUMN IF NOT EXISTS stage_entered_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS days_in_current_stage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS probability_percentage INTEGER CHECK (probability_percentage BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS expected_close_date DATE,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS next_action VARCHAR(500),
ADD COLUMN IF NOT EXISTS next_action_due_date DATE,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS attachment_urls TEXT[];

-- Add check constraint for pipeline stages
ALTER TABLE funding_prospects
DROP CONSTRAINT IF EXISTS check_pipeline_stage;

ALTER TABLE funding_prospects
ADD CONSTRAINT check_pipeline_stage CHECK (
  pipeline_stage IN (
    'research',        -- Identifying potential funders
    'initial_contact', -- First outreach made
    'qualified',       -- Confirmed fit and interest
    'proposal',        -- Proposal being prepared/submitted
    'negotiation',     -- In discussion about terms
    'committed',       -- Verbal/written commitment received
    'funded',          -- Money received
    'declined',        -- Rejected or withdrew
    'on_hold'          -- Paused for strategic reasons
  )
);

-- Pipeline Activity Log (track stage changes)
CREATE TABLE IF NOT EXISTS funding_pipeline_activities (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES funding_prospects(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
    'stage_change',
    'email_sent',
    'email_received',
    'call_made',
    'meeting_held',
    'proposal_submitted',
    'document_added',
    'note_added',
    'task_completed',
    'reminder_set'
  )),
  old_stage VARCHAR(50),
  new_stage VARCHAR(50),
  description TEXT NOT NULL,
  performed_by VARCHAR(255),
  performed_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- Store additional context
);

-- Pipeline Metrics View (aggregated statistics)
CREATE OR REPLACE VIEW funding_pipeline_metrics AS
SELECT
  pipeline_stage,
  COUNT(*) as prospect_count,
  SUM(estimated_amount) as total_potential,
  AVG(estimated_amount) as avg_amount,
  AVG(probability_percentage) as avg_probability,
  SUM(estimated_amount * COALESCE(probability_percentage, 50) / 100.0) as weighted_value,
  AVG(days_in_current_stage) as avg_days_in_stage,
  COUNT(*) FILTER (WHERE next_action_due_date < CURRENT_DATE) as overdue_actions
FROM funding_prospects
WHERE status NOT IN ('declined', 'on_hold')
GROUP BY pipeline_stage
ORDER BY
  CASE pipeline_stage
    WHEN 'research' THEN 1
    WHEN 'initial_contact' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'proposal' THEN 4
    WHEN 'negotiation' THEN 5
    WHEN 'committed' THEN 6
    WHEN 'funded' THEN 7
    WHEN 'declined' THEN 8
    WHEN 'on_hold' THEN 9
  END;

-- Funding Tasks (action items tied to prospects)
CREATE TABLE IF NOT EXISTS funding_tasks (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES funding_prospects(id) ON DELETE CASCADE,
  task_type VARCHAR(50) CHECK (task_type IN ('call', 'email', 'meeting', 'follow_up', 'research', 'document', 'other')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to VARCHAR(255),
  due_date DATE,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  status VARCHAR(20) CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  completed_at TIMESTAMP,
  completed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_funding_prospects_pipeline_stage ON funding_prospects(pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_funding_prospects_probability ON funding_prospects(probability_percentage);
CREATE INDEX IF NOT EXISTS idx_funding_prospects_expected_close ON funding_prospects(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_funding_prospects_last_activity ON funding_prospects(last_activity_date);
CREATE INDEX IF NOT EXISTS idx_funding_prospects_tags ON funding_prospects USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_pipeline_activities_prospect ON funding_pipeline_activities(prospect_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_activities_type ON funding_pipeline_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_activities_date ON funding_pipeline_activities(performed_at);
CREATE INDEX IF NOT EXISTS idx_funding_tasks_prospect ON funding_tasks(prospect_id);
CREATE INDEX IF NOT EXISTS idx_funding_tasks_assigned ON funding_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_funding_tasks_due_date ON funding_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_funding_tasks_status ON funding_tasks(status);

-- Comments
COMMENT ON COLUMN funding_prospects.pipeline_stage IS 'Current stage in the funding pipeline';
COMMENT ON COLUMN funding_prospects.probability_percentage IS 'Estimated likelihood of securing funding (0-100%)';
COMMENT ON COLUMN funding_prospects.days_in_current_stage IS 'Number of days prospect has been in current stage';
COMMENT ON TABLE funding_pipeline_activities IS 'Activity log for tracking all interactions with funding prospects';
COMMENT ON TABLE funding_tasks IS 'Action items and tasks tied to funding prospects';
COMMENT ON VIEW funding_pipeline_metrics IS 'Aggregated metrics for pipeline visualization';

-- Update existing prospects with default pipeline stages based on status
UPDATE funding_prospects
SET pipeline_stage = CASE
  WHEN status = 'funded' THEN 'funded'
  WHEN status = 'declined' THEN 'declined'
  WHEN status = 'application_submitted' THEN 'proposal'
  WHEN status = 'under_review' THEN 'negotiation'
  WHEN status = 'interested' THEN 'qualified'
  WHEN status = 'contacted' THEN 'initial_contact'
  ELSE 'research'
END
WHERE pipeline_stage IS NULL OR pipeline_stage = 'research';
