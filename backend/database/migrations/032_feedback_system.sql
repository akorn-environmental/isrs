-- Migration 032: User Feedback System
-- Creates tables for collecting user feedback and sending daily digests

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS feedback_submissions CASCADE;
DROP TABLE IF EXISTS feedback_digest_log CASCADE;

-- Create feedback_submissions table
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User identification
  user_email VARCHAR(255),
  user_name VARCHAR(255),
  user_id UUID,  -- If user is logged in
  session_id VARCHAR(255),  -- For anonymous users

  -- Feedback details
  page_url TEXT NOT NULL,
  page_title VARCHAR(500),
  component_name VARCHAR(255),  -- Which component/feature they're giving feedback on
  feedback_type VARCHAR(50) DEFAULT 'general',  -- general, bug, feature_request, improvement
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),  -- Optional 1-5 rating

  -- Feedback content
  subject VARCHAR(500),
  message TEXT NOT NULL,

  -- Context information
  browser_info JSONB,  -- Browser, OS, screen size, etc.
  user_agent TEXT,
  ip_address INET,

  -- Metadata
  is_admin_portal BOOLEAN DEFAULT FALSE,  -- TRUE if feedback from admin portal
  status VARCHAR(50) DEFAULT 'new',  -- new, reviewed, addressed, archived
  priority VARCHAR(20) DEFAULT 'normal',  -- low, normal, high, urgent

  -- Tracking
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by VARCHAR(255),
  notes TEXT  -- Internal notes from team
);

-- Create feedback_digest_log table
CREATE TABLE IF NOT EXISTS feedback_digest_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  digest_date DATE NOT NULL UNIQUE,
  feedback_count INTEGER NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW(),
  sent_to VARCHAR(255) NOT NULL,
  email_status VARCHAR(50) DEFAULT 'sent',
  feedback_ids UUID[] NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_feedback_created_at ON feedback_submissions(created_at DESC);
CREATE INDEX idx_feedback_status ON feedback_submissions(status);
CREATE INDEX idx_feedback_type ON feedback_submissions(feedback_type);
CREATE INDEX idx_feedback_user_email ON feedback_submissions(user_email);
CREATE INDEX idx_feedback_page_url ON feedback_submissions(page_url);
CREATE INDEX idx_feedback_admin_portal ON feedback_submissions(is_admin_portal);
CREATE INDEX idx_feedback_digest_date ON feedback_digest_log(digest_date DESC);

-- Create view for daily feedback summary
CREATE OR REPLACE VIEW daily_feedback_summary AS
SELECT
  DATE(created_at) as feedback_date,
  COUNT(*) as total_submissions,
  COUNT(CASE WHEN feedback_type = 'bug' THEN 1 END) as bug_reports,
  COUNT(CASE WHEN feedback_type = 'feature_request' THEN 1 END) as feature_requests,
  COUNT(CASE WHEN feedback_type = 'improvement' THEN 1 END) as improvements,
  COUNT(CASE WHEN is_admin_portal = TRUE THEN 1 END) as admin_portal_feedback,
  COUNT(CASE WHEN is_admin_portal = FALSE THEN 1 END) as public_site_feedback,
  ROUND(AVG(rating), 2) as avg_rating,
  COUNT(DISTINCT user_email) as unique_users
FROM feedback_submissions
GROUP BY DATE(created_at)
ORDER BY feedback_date DESC;

-- Create function to get undigested feedback
CREATE OR REPLACE FUNCTION get_undigested_feedback(target_date DATE)
RETURNS TABLE (
  id UUID,
  user_email VARCHAR,
  user_name VARCHAR,
  page_url TEXT,
  page_title VARCHAR,
  component_name VARCHAR,
  feedback_type VARCHAR,
  rating INTEGER,
  subject VARCHAR,
  message TEXT,
  is_admin_portal BOOLEAN,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    fs.id,
    fs.user_email,
    fs.user_name,
    fs.page_url,
    fs.page_title,
    fs.component_name,
    fs.feedback_type,
    fs.rating,
    fs.subject,
    fs.message,
    fs.is_admin_portal,
    fs.created_at
  FROM feedback_submissions fs
  WHERE DATE(fs.created_at) = target_date
    AND NOT EXISTS (
      SELECT 1 FROM feedback_digest_log fdl
      WHERE fdl.digest_date = target_date
        AND fs.id = ANY(fdl.feedback_ids)
    )
  ORDER BY fs.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert sample feedback type descriptions (for reference)
COMMENT ON COLUMN feedback_submissions.feedback_type IS 'Types: general (default), bug (something broken), feature_request (new feature idea), improvement (enhancement to existing feature)';
COMMENT ON COLUMN feedback_submissions.is_admin_portal IS 'TRUE if feedback submitted from admin portal, FALSE for public site';
COMMENT ON COLUMN feedback_submissions.status IS 'Workflow: new -> reviewed -> addressed -> archived';

-- Grant permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT ON feedback_submissions TO your_app_user;
-- GRANT SELECT, INSERT ON feedback_digest_log TO your_app_user;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration 032: Feedback system created successfully';
  RAISE NOTICE '  - feedback_submissions table created';
  RAISE NOTICE '  - feedback_digest_log table created';
  RAISE NOTICE '  - Indexes and views created';
  RAISE NOTICE '  - Helper functions created';
END $$;
