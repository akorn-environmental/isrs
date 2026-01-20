# Render Shell Migration Commands

Run these commands in sequence in Render Shell to complete the database migration.

## Step 1: Check Current State

```bash
psql $DATABASE_URL -c "\d abstract_reviewers"
```

## Step 2: Fix abstract_reviewers if needed

If `reviewer_id` column is missing, add it:

```bash
psql $DATABASE_URL -c "ALTER TABLE abstract_reviewers ADD COLUMN IF NOT EXISTS reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE;"
psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_abstract_reviewers_reviewer ON abstract_reviewers(reviewer_id);"
```

## Step 3: Complete Remaining Tables

### Create abstract_decisions table:
```bash
psql $DATABASE_URL -c "CREATE TABLE IF NOT EXISTS abstract_decisions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), abstract_id UUID NOT NULL REFERENCES conference_abstracts(id) ON DELETE CASCADE, decision VARCHAR(50) NOT NULL, decided_by UUID NOT NULL REFERENCES users(id), decided_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, average_score DECIMAL(5,2), review_count INTEGER, notes TEXT, notified_at TIMESTAMP WITH TIME ZONE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL);"

psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_abstract_decisions_abstract ON abstract_decisions(abstract_id);"
psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_abstract_decisions_decision ON abstract_decisions(decision);"
```

### Create review_criteria table:
```bash
psql $DATABASE_URL -c "CREATE TABLE IF NOT EXISTS review_criteria (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE, name VARCHAR(100) NOT NULL, description TEXT, weight DECIMAL(3,2) NOT NULL DEFAULT 1.0, display_order INTEGER NOT NULL DEFAULT 0, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(conference_id, name));"
```

### Create conference_events table:
```bash
psql $DATABASE_URL -c "CREATE TABLE IF NOT EXISTS conference_events (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), conference_id UUID NOT NULL REFERENCES conferences(id) ON DELETE CASCADE, name VARCHAR(200) NOT NULL, description TEXT, event_type VARCHAR(50) NOT NULL, event_date TIMESTAMP WITH TIME ZONE, capacity INTEGER, current_signups INTEGER DEFAULT 0 NOT NULL, allows_guests BOOLEAN DEFAULT FALSE NOT NULL, fee_per_person DECIMAL(10,2) DEFAULT 0 NOT NULL, status VARCHAR(50) DEFAULT 'open' NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL);"

psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_conference_events_conference ON conference_events(conference_id);"
psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_conference_events_type ON conference_events(event_type);"
```

### Create event_signups table:
```bash
psql $DATABASE_URL -c "CREATE TABLE IF NOT EXISTS event_signups (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), event_id UUID NOT NULL REFERENCES conference_events(id) ON DELETE CASCADE, user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, guest_count INTEGER DEFAULT 0 NOT NULL, total_fee DECIMAL(10,2) DEFAULT 0 NOT NULL, status VARCHAR(50) DEFAULT 'confirmed' NOT NULL, waitlist_position INTEGER, signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL, UNIQUE(event_id, user_id));"

psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_event_signups_event ON event_signups(event_id);"
psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_event_signups_user ON event_signups(user_id);"
psql $DATABASE_URL -c "CREATE INDEX IF NOT EXISTS idx_event_signups_status ON event_signups(status);"
```

## Step 4: Verify All Tables Created

```bash
psql $DATABASE_URL -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('abstract_reviewers', 'abstract_reviews', 'abstract_decisions', 'review_criteria', 'conference_events', 'event_signups') ORDER BY table_name;"
```

Expected output should show all 6 tables:
- abstract_decisions
- abstract_reviewers
- abstract_reviews
- conference_events
- event_signups
- review_criteria

## Step 5: Restart Service

After migration completes, exit the shell. Render will automatically restart the service and the new endpoints will become available.

## Troubleshooting

If you get "command too long" errors, the individual `-c` commands above are broken down into single-line commands that should work in Render Shell.

If tables already exist with different schemas, you may need to drop and recreate them:
```bash
# CAREFUL - This deletes data!
psql $DATABASE_URL -c "DROP TABLE IF EXISTS event_signups CASCADE;"
psql $DATABASE_URL -c "DROP TABLE IF EXISTS conference_events CASCADE;"
# Then recreate with commands above
```
