#!/bin/bash
# Run these commands in Render Shell to create the abstract review & event tables
# Uses INTEGER for users.id foreign keys and UUID for conference/event references

echo "Creating abstract_reviewers table..."
psql $DATABASE_URL -c "CREATE TABLE abstract_reviewers (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), abstract_id UUID NOT NULL REFERENCES conference_abstracts(id) ON DELETE CASCADE, reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, assigned_by INTEGER REFERENCES users(id), status VARCHAR(50) DEFAULT 'pending', notified_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(abstract_id, reviewer_id));"

echo "Creating indexes for abstract_reviewers..."
psql $DATABASE_URL -c "CREATE INDEX idx_abstract_reviewers_abstract ON abstract_reviewers(abstract_id);"
psql $DATABASE_URL -c "CREATE INDEX idx_abstract_reviewers_reviewer ON abstract_reviewers(reviewer_id);"
psql $DATABASE_URL -c "CREATE INDEX idx_abstract_reviewers_status ON abstract_reviewers(status);"

echo "Creating abstract_reviews table..."
psql $DATABASE_URL -c "CREATE TABLE abstract_reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), abstract_id UUID NOT NULL REFERENCES conference_abstracts(id) ON DELETE CASCADE, reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 5), originality_score INTEGER CHECK (originality_score BETWEEN 1 AND 5), methodology_score INTEGER CHECK (methodology_score BETWEEN 1 AND 5), clarity_score INTEGER CHECK (clarity_score BETWEEN 1 AND 5), impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5), weighted_score DECIMAL(5,2), strengths TEXT, weaknesses TEXT, comments TEXT, recommendation VARCHAR(50), submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(abstract_id, reviewer_id));"

echo "Creating indexes for abstract_reviews..."
psql $DATABASE_URL -c "CREATE INDEX idx_abstract_reviews_abstract ON abstract_reviews(abstract_id);"
psql $DATABASE_URL -c "CREATE INDEX idx_abstract_reviews_reviewer ON abstract_reviews(reviewer_id);"

echo "Creating abstract_decisions table..."
psql $DATABASE_URL -c "CREATE TABLE abstract_decisions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), abstract_id UUID NOT NULL REFERENCES conference_abstracts(id) ON DELETE CASCADE, decision VARCHAR(50) NOT NULL, decided_by INTEGER NOT NULL REFERENCES users(id), decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, average_score DECIMAL(5,2), review_count INTEGER, notes TEXT, notified_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL);"

echo "Creating indexes for abstract_decisions..."
psql $DATABASE_URL -c "CREATE INDEX idx_abstract_decisions_abstract ON abstract_decisions(abstract_id);"
psql $DATABASE_URL -c "CREATE INDEX idx_abstract_decisions_decision ON abstract_decisions(decision);"

echo "Creating review_criteria table..."
psql $DATABASE_URL -c "CREATE TABLE review_criteria (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, description TEXT, weight DECIMAL(3,2) NOT NULL DEFAULT 1.0, display_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(conference_id, name));"

echo "Creating conference_events table..."
psql $DATABASE_URL -c "CREATE TABLE conference_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE, name VARCHAR(200) NOT NULL, description TEXT, event_type VARCHAR(50) NOT NULL, event_date TIMESTAMP WITH TIME ZONE, capacity INTEGER, current_signups INTEGER DEFAULT 0 NOT NULL, allows_guests BOOLEAN DEFAULT FALSE NOT NULL, fee_per_person DECIMAL(10,2) DEFAULT 0 NOT NULL, status VARCHAR(50) DEFAULT 'open' NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL);"

echo "Creating indexes for conference_events..."
psql $DATABASE_URL -c "CREATE INDEX idx_conference_events_conference ON conference_events(conference_id);"
psql $DATABASE_URL -c "CREATE INDEX idx_conference_events_type ON conference_events(event_type);"

echo "Creating event_signups table..."
psql $DATABASE_URL -c "CREATE TABLE event_signups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL REFERENCES conference_events(id) ON DELETE CASCADE, user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, guest_count INTEGER DEFAULT 0 NOT NULL, total_fee DECIMAL(10,2) DEFAULT 0 NOT NULL, status VARCHAR(50) DEFAULT 'confirmed' NOT NULL, waitlist_position INTEGER, signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(event_id, user_id));"

echo "Creating indexes for event_signups..."
psql $DATABASE_URL -c "CREATE INDEX idx_event_signups_event ON event_signups(event_id);"
psql $DATABASE_URL -c "CREATE INDEX idx_event_signups_user ON event_signups(user_id);"
psql $DATABASE_URL -c "CREATE INDEX idx_event_signups_status ON event_signups(status);"

echo ""
echo "Verifying all tables created..."
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('abstract_reviewers', 'abstract_reviews', 'abstract_decisions', 'review_criteria', 'conference_events', 'event_signups') ORDER BY table_name;"

echo ""
echo "Migration complete! Exit the shell to restart the service."
