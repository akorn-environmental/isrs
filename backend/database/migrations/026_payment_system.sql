-- Payment System Tables

-- Drop existing tables if they exist (to avoid constraint conflicts)
DROP TABLE IF EXISTS travel_grant_payments CASCADE;
DROP TABLE IF EXISTS conference_payments CASCADE;
DROP TABLE IF EXISTS membership_payments CASCADE;
DROP TABLE IF EXISTS stripe_webhook_events CASCADE;
DROP TABLE IF EXISTS payment_transactions CASCADE;

-- Payment transactions
CREATE TABLE payment_transactions (
  id SERIAL PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'pending',
  payment_type VARCHAR(50) NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Membership payments
CREATE TABLE membership_payments (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES payment_transactions(id),
  contact_id UUID REFERENCES contacts(id),
  membership_type VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  auto_renew BOOLEAN DEFAULT false,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conference registration payments
CREATE TABLE conference_payments (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES payment_transactions(id),
  contact_id UUID REFERENCES contacts(id),
  conference_id INTEGER,
  registration_type VARCHAR(50) NOT NULL,
  amount_paid DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Travel grant payments
CREATE TABLE travel_grant_payments (
  id SERIAL PRIMARY KEY,
  transaction_id INTEGER REFERENCES payment_transactions(id),
  travel_request_id INTEGER,
  contact_id UUID REFERENCES contacts(id),
  grant_amount DECIMAL(10, 2) NOT NULL,
  disbursement_method VARCHAR(50) DEFAULT 'bank_transfer',
  disbursement_status VARCHAR(50) DEFAULT 'pending',
  disbursed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Stripe webhook events log
CREATE TABLE stripe_webhook_events (
  id SERIAL PRIMARY KEY,
  stripe_event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_contact ON payment_transactions(contact_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_membership_payments_contact ON membership_payments(contact_id);
CREATE INDEX IF NOT EXISTS idx_conference_payments_contact ON conference_payments(contact_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_processed ON stripe_webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_type ON stripe_webhook_events(event_type);
