-- ISRS Database PostgreSQL Schema
-- Version 1.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CONTACTS & ORGANIZATIONS
-- =====================================================

CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(100), -- University, NGO, Government, Private, etc.
    website VARCHAR(500),
    country VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    role VARCHAR(255), -- Board Chair, Board Member, Steering Committee, etc.
    title VARCHAR(255), -- Job title
    phone VARCHAR(50),
    country VARCHAR(100),
    state_province VARCHAR(100),
    city VARCHAR(100),
    expertise TEXT[], -- Array of expertise areas
    interests TEXT[], -- Array of interests
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for common queries
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_contacts_role ON contacts(role);
CREATE INDEX idx_organizations_name ON organizations(name);

-- =====================================================
-- BOARD VOTES
-- =====================================================

CREATE TABLE board_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vote_id VARCHAR(50) UNIQUE NOT NULL, -- VOTE_timestamp format
    motion_title VARCHAR(500) NOT NULL,
    motion_description TEXT,
    vote_date DATE NOT NULL,
    vote_method VARCHAR(50) DEFAULT 'email', -- email, meeting, survey, unanimous
    result VARCHAR(50), -- Carried, Failed, No Decision
    yes_count INTEGER DEFAULT 0,
    no_count INTEGER DEFAULT 0,
    abstain_count INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    quorum_met BOOLEAN DEFAULT false,
    notes TEXT,
    email_content TEXT, -- Original email thread
    processed_by VARCHAR(255), -- Who/what processed this vote
    processed_method VARCHAR(50), -- AI-CLAUDE, AI-FALLBACK, Manual
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE board_vote_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vote_id UUID REFERENCES board_votes(id) ON DELETE CASCADE,
    board_member_name VARCHAR(255) NOT NULL,
    vote VARCHAR(20), -- Yes, No, Abstain, or NULL
    timestamp TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_board_votes_date ON board_votes(vote_date DESC);
CREATE INDEX idx_board_votes_result ON board_votes(result);
CREATE INDEX idx_vote_details_vote_id ON board_vote_details(vote_id);

-- =====================================================
-- CONFERENCES (ICSR)
-- =====================================================

CREATE TABLE conferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    total_attendees INTEGER,
    countries_represented INTEGER,
    sessions INTEGER,
    posters INTEGER,
    sponsors INTEGER,
    exhibitors INTEGER,
    abstracts_submitted INTEGER,
    website VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conference_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    registration_type VARCHAR(50), -- early_bird, regular, student
    registration_date DATE,
    payment_status VARCHAR(50), -- pending, paid, refunded
    amount_paid DECIMAL(10, 2),
    attendance_confirmed BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conference_id, contact_id)
);

CREATE TABLE conference_sponsors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    sponsor_level VARCHAR(100), -- Platinum, Gold, Silver, Bronze, etc.
    amount_committed DECIMAL(10, 2),
    amount_paid DECIMAL(10, 2),
    status VARCHAR(50), -- potential, committed, paid
    contact_person_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conference_abstracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conference_id UUID REFERENCES conferences(id) ON DELETE CASCADE,
    submitter_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    abstract_text TEXT,
    authors TEXT[],
    presentation_type VARCHAR(50), -- oral, poster
    status VARCHAR(50), -- submitted, accepted, rejected, withdrawn
    submission_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_conferences_year ON conferences(year DESC);
CREATE INDEX idx_registrations_conference ON conference_registrations(conference_id);
CREATE INDEX idx_sponsors_conference ON conference_sponsors(conference_id);
CREATE INDEX idx_abstracts_conference ON conference_abstracts(conference_id);

-- =====================================================
-- FUNDING & PROSPECTS
-- =====================================================

CREATE TABLE funding_prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    prospect_type VARCHAR(50), -- Grant, Sponsorship, Donation, Partnership
    amount_target DECIMAL(10, 2),
    amount_committed DECIMAL(10, 2),
    amount_received DECIMAL(10, 2),
    status VARCHAR(50), -- pipeline, contacted, proposal_submitted, committed, received, rejected
    priority VARCHAR(20), -- high, medium, low
    deadline DATE,
    proposal_submitted_date DATE,
    decision_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_funding_status ON funding_prospects(status);
CREATE INDEX idx_funding_priority ON funding_prospects(priority);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100),
    record_id UUID,
    action VARCHAR(50), -- INSERT, UPDATE, DELETE
    changed_by VARCHAR(255),
    changes JSONB, -- Store old and new values
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE data_quality_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_name VARCHAR(100),
    metric_value DECIMAL(10, 2),
    details JSONB,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_votes_updated_at BEFORE UPDATE ON board_votes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conferences_updated_at BEFORE UPDATE ON conferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON conference_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsors_updated_at BEFORE UPDATE ON conference_sponsors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_abstracts_updated_at BEFORE UPDATE ON conference_abstracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_funding_updated_at BEFORE UPDATE ON funding_prospects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert ICSR 2024 conference
INSERT INTO conferences (name, year, location, start_date, end_date, total_attendees, countries_represented, sessions, posters, sponsors, exhibitors)
VALUES ('ICSR 2024', 2024, 'Jekyll Island, Georgia', '2024-09-15', '2024-09-18', 312, 23, 45, 30, 12, 11);

-- Insert ICSR 2026 conference (planned)
INSERT INTO conferences (name, year, location, start_date, end_date, total_attendees)
VALUES ('ICSR 2026', 2026, 'Squaxin Island Tribe, Washington', '2026-10-04', '2026-10-08', 0);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Board members view
CREATE VIEW board_members AS
SELECT
    c.id,
    c.email,
    c.full_name,
    c.role,
    c.phone,
    o.name as organization,
    c.created_at,
    c.updated_at
FROM contacts c
LEFT JOIN organizations o ON c.organization_id = o.id
WHERE c.role ILIKE '%board%' OR c.role ILIKE '%chair%';

-- Steering committee view
CREATE VIEW steering_committee AS
SELECT
    c.id,
    c.email,
    c.full_name,
    c.role,
    c.phone,
    o.name as organization,
    c.created_at,
    c.updated_at
FROM contacts c
LEFT JOIN organizations o ON c.organization_id = o.id
WHERE c.role ILIKE '%steering%' OR c.role ILIKE '%committee%';

-- Recent votes view
CREATE VIEW recent_board_votes AS
SELECT
    bv.id,
    bv.vote_id,
    bv.motion_title,
    bv.vote_date,
    bv.vote_method,
    bv.result,
    bv.yes_count,
    bv.no_count,
    bv.abstain_count,
    bv.total_votes,
    bv.quorum_met,
    bv.processed_by,
    bv.created_at
FROM board_votes bv
ORDER BY bv.vote_date DESC, bv.created_at DESC
LIMIT 100;

-- Funding pipeline summary
CREATE VIEW funding_pipeline_summary AS
SELECT
    status,
    COUNT(*) as count,
    SUM(amount_target) as total_target,
    SUM(amount_committed) as total_committed,
    SUM(amount_received) as total_received
FROM funding_prospects
GROUP BY status;
