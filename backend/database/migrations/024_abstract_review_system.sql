-- Migration 024: Abstract Review System
-- System for reviewing and scoring conference abstracts

-- Abstracts table (enhance existing or create new)
CREATE TABLE IF NOT EXISTS abstracts (
  id SERIAL PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id),
  conference_id INTEGER, -- Will reference conferences table
  title VARCHAR(500) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  co_authors TEXT,
  abstract_text TEXT NOT NULL,
  keywords TEXT[],
  presentation_type VARCHAR(50) CHECK (presentation_type IN ('oral', 'poster', 'workshop', 'keynote')),
  topic_category VARCHAR(100),
  submission_status VARCHAR(50) DEFAULT 'submitted' CHECK (submission_status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'withdrawn')),
  average_score DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  decision_date TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Abstract Reviewers (assign reviewers to abstracts)
CREATE TABLE IF NOT EXISTS abstract_reviewers (
  id SERIAL PRIMARY KEY,
  abstract_id INTEGER NOT NULL REFERENCES abstracts(id) ON DELETE CASCADE,
  reviewer_contact_id UUID NOT NULL REFERENCES contacts(id),
  reviewer_email VARCHAR(255) NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'declined')),
  UNIQUE(abstract_id, reviewer_contact_id)
);

-- Abstract Reviews (scores and feedback)
CREATE TABLE IF NOT EXISTS abstract_reviews (
  id SERIAL PRIMARY KEY,
  abstract_id INTEGER NOT NULL REFERENCES abstracts(id) ON DELETE CASCADE,
  reviewer_id INTEGER NOT NULL REFERENCES abstract_reviewers(id) ON DELETE CASCADE,
  reviewer_contact_id UUID NOT NULL REFERENCES contacts(id),

  -- Scoring criteria
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5),
  originality_score INTEGER CHECK (originality_score BETWEEN 1 AND 5),
  methodology_score INTEGER CHECK (methodology_score BETWEEN 1 AND 5),
  clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5),
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
  overall_score DECIMAL(3, 2),

  -- Feedback
  strengths TEXT,
  weaknesses TEXT,
  comments_for_authors TEXT,
  confidential_comments TEXT, -- Only visible to organizers
  recommendation VARCHAR(50) CHECK (recommendation IN ('strongly_accept', 'accept', 'borderline', 'reject', 'strongly_reject')),

  -- Metadata
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(abstract_id, reviewer_contact_id)
);

-- Review Consensus (final decisions by committee)
CREATE TABLE IF NOT EXISTS abstract_decisions (
  id SERIAL PRIMARY KEY,
  abstract_id INTEGER NOT NULL UNIQUE REFERENCES abstracts(id) ON DELETE CASCADE,
  decision VARCHAR(50) NOT NULL CHECK (decision IN ('accepted', 'rejected', 'waitlisted')),
  decision_made_by VARCHAR(255),
  decision_date TIMESTAMP DEFAULT NOW(),
  decision_notes TEXT,
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP
);

-- Review Criteria Configuration (customizable scoring)
CREATE TABLE IF NOT EXISTS review_criteria (
  id SERIAL PRIMARY KEY,
  conference_id INTEGER,
  criterion_name VARCHAR(100) NOT NULL,
  criterion_description TEXT,
  weight DECIMAL(3, 2) DEFAULT 1.0,
  max_score INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_abstracts_contact ON abstracts(contact_id);
CREATE INDEX IF NOT EXISTS idx_abstracts_status ON abstracts(submission_status);
CREATE INDEX IF NOT EXISTS idx_abstracts_conference ON abstracts(conference_id);
CREATE INDEX IF NOT EXISTS idx_abstract_reviewers_abstract ON abstract_reviewers(abstract_id);
CREATE INDEX IF NOT EXISTS idx_abstract_reviewers_reviewer ON abstract_reviewers(reviewer_contact_id);
CREATE INDEX IF NOT EXISTS idx_abstract_reviews_abstract ON abstract_reviews(abstract_id);
CREATE INDEX IF NOT EXISTS idx_abstract_reviews_reviewer ON abstract_reviews(reviewer_contact_id);

-- Comments
COMMENT ON TABLE abstracts IS 'Conference abstract submissions';
COMMENT ON TABLE abstract_reviewers IS 'Assigned reviewers for each abstract';
COMMENT ON TABLE abstract_reviews IS 'Individual review scores and feedback';
COMMENT ON TABLE abstract_decisions IS 'Final acceptance/rejection decisions';
COMMENT ON TABLE review_criteria IS 'Customizable review scoring criteria';

-- Insert default review criteria
INSERT INTO review_criteria (criterion_name, criterion_description, weight, max_score, sort_order)
VALUES
  ('Relevance', 'How relevant is this work to the conference theme?', 1.2, 5, 1),
  ('Originality', 'Does this work present novel ideas or findings?', 1.0, 5, 2),
  ('Methodology', 'Is the research methodology sound and appropriate?', 1.0, 5, 3),
  ('Clarity', 'Is the abstract clear, well-written, and easy to understand?', 0.8, 5, 4),
  ('Impact', 'What is the potential impact of this work on the field?', 1.0, 5, 5)
ON CONFLICT DO NOTHING;
