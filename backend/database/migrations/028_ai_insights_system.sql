-- AI Insights and Recommendations System

-- AI-generated insights and recommendations
CREATE TABLE IF NOT EXISTS ai_insights (
  id SERIAL PRIMARY KEY,
  insight_type VARCHAR(100) NOT NULL,
  category VARCHAR(100),
  
  -- Subject of insight
  related_entity_type VARCHAR(50),
  related_entity_id INTEGER,
  
  -- Insight content
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  confidence_score DECIMAL(3, 2),
  
  -- Supporting data
  data_points JSONB,
  reasoning TEXT,
  
  -- AI metadata
  model_used VARCHAR(100),
  generated_at TIMESTAMP DEFAULT NOW(),
  
  -- User interaction
  viewed BOOLEAN DEFAULT false,
  viewed_at TIMESTAMP,
  acted_upon BOOLEAN DEFAULT false,
  action_taken TEXT,
  user_feedback TEXT,
  helpful BOOLEAN,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active',
  expires_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI data quality assessments
CREATE TABLE IF NOT EXISTS ai_data_quality (
  id SERIAL PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id INTEGER,
  
  -- Quality metrics
  completeness_score DECIMAL(3, 2),
  accuracy_score DECIMAL(3, 2),
  consistency_score DECIMAL(3, 2),
  overall_score DECIMAL(3, 2),
  
  -- Issues found
  issues JSONB,
  suggestions JSONB,
  
  -- Enrichment opportunities
  enrichment_opportunities JSONB,
  
  assessed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI trend analysis
CREATE TABLE IF NOT EXISTS ai_trend_analysis (
  id SERIAL PRIMARY KEY,
  analysis_type VARCHAR(100) NOT NULL,
  time_period VARCHAR(50),
  
  -- Trend data
  trend_direction VARCHAR(20),
  trend_strength DECIMAL(3, 2),
  key_metrics JSONB,
  
  -- Analysis
  summary TEXT NOT NULL,
  insights TEXT[],
  predictions JSONB,
  recommendations TEXT[],
  
  -- Visualizations
  chart_data JSONB,
  
  model_used VARCHAR(100),
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- AI suggested actions
CREATE TABLE IF NOT EXISTS ai_suggested_actions (
  id SERIAL PRIMARY KEY,
  action_type VARCHAR(100) NOT NULL,
  related_to VARCHAR(50),
  related_id INTEGER,
  
  -- Action details
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  expected_impact TEXT,
  effort_level VARCHAR(20),
  priority VARCHAR(20) DEFAULT 'medium',
  
  -- Timing
  suggested_by_date DATE,
  urgency VARCHAR(20),
  
  -- Status
  status VARCHAR(50) DEFAULT 'suggested',
  assigned_to VARCHAR(255),
  completed_at TIMESTAMP,
  
  -- User interaction
  accepted BOOLEAN,
  dismissed BOOLEAN DEFAULT false,
  dismissal_reason TEXT,
  
  model_used VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_entity ON ai_insights(related_entity_type, related_entity_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_status ON ai_insights(status);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_data_quality_table ON ai_data_quality(table_name);
CREATE INDEX IF NOT EXISTS idx_ai_trend_type ON ai_trend_analysis(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_actions_type ON ai_suggested_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_ai_actions_status ON ai_suggested_actions(status);
CREATE INDEX IF NOT EXISTS idx_ai_actions_priority ON ai_suggested_actions(priority);
