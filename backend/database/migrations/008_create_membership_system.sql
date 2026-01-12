-- Migration: Create Membership System
-- Date: 2025-11-03
-- Description: Standalone membership registration separate from conference attendance

-- Members table
CREATE TABLE IF NOT EXISTS members (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  organization_name VARCHAR(500),
  position VARCHAR(255),
  country VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  city VARCHAR(255),
  phone VARCHAR(50),

  -- Membership details
  membership_type VARCHAR(50) NOT NULL, -- regular, student, lifetime, corporate
  membership_status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
  membership_start_date DATE NOT NULL,
  membership_expiry_date DATE,

  -- Professional info
  research_areas TEXT[],
  bio TEXT,
  website_url VARCHAR(500),
  linkedin_url VARCHAR(500),

  -- Communication preferences
  opt_in_emails BOOLEAN DEFAULT true,
  opt_in_newsletter BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membership donations table
CREATE TABLE IF NOT EXISTS membership_donations (
  id SERIAL PRIMARY KEY,
  member_id INT REFERENCES members(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  donation_type VARCHAR(50), -- one_time, recurring_monthly, recurring_yearly
  zeffy_transaction_id VARCHAR(255),
  zeffy_checkout_url TEXT,
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_date TIMESTAMP,

  -- Optional dedication
  in_honor_of VARCHAR(255),
  dedication_message TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Membership transactions (for renewals and payments)
CREATE TABLE IF NOT EXISTS membership_transactions (
  id SERIAL PRIMARY KEY,
  member_id INT REFERENCES members(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL, -- initial, renewal, upgrade
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50), -- zeffy, bank_transfer, check
  payment_status VARCHAR(50) DEFAULT 'pending',
  zeffy_transaction_id VARCHAR(255),
  transaction_date TIMESTAMP,
  notes TEXT,

  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_members_expiry ON members(membership_expiry_date);
CREATE INDEX idx_membership_donations_member ON membership_donations(member_id);
CREATE INDEX idx_membership_transactions_member ON membership_transactions(member_id);

-- Comments for documentation
COMMENT ON TABLE members IS 'ISRS members who may or may not attend conferences';
COMMENT ON TABLE membership_donations IS 'Donations made by members during registration or separately';
COMMENT ON TABLE membership_transactions IS 'Payment history for memberships';

-- Migration Complete
SELECT 'Migration 008: Created membership system tables' AS status;
