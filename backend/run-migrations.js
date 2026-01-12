#!/usr/bin/env node

/**
 * Remote Migration Runner
 * Runs migrations 018-029 on the production database
 */

require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Migration 022: Add organization column to contacts
const migration022 = `
-- Migration 022: Add organization text column to contacts
-- Allows storing organization name as text for contacts without organization_id FK

ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS organization TEXT;

-- Add index for faster searches
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization);

-- Add comment
COMMENT ON COLUMN contacts.organization IS 'Organization name as text (alternative to organization_id FK)';
`;

// Load new migrations from files
const migration023 = fs.readFileSync(
  path.join(__dirname, 'database/migrations/023_email_system.sql'),
  'utf8'
);

const migration024 = fs.readFileSync(
  path.join(__dirname, 'database/migrations/024_abstract_review_system.sql'),
  'utf8'
);

const migration025 = fs.readFileSync(
  path.join(__dirname, 'database/migrations/025_funding_pipeline_enhancements.sql'),
  'utf8'
);

const migration026 = fs.readFileSync(
  path.join(__dirname, 'database/migrations/026_payment_system.sql'),
  'utf8'
);

const migration027 = fs.readFileSync(
  path.join(__dirname, 'database/migrations/027_ai_grant_assistant.sql'),
  'utf8'
);

const migration028 = fs.readFileSync(
  path.join(__dirname, 'database/migrations/028_ai_insights_system.sql'),
  'utf8'
);

const migration029 = fs.readFileSync(
  path.join(__dirname, 'database/migrations/029_email_parsing_system.sql'),
  'utf8'
);

// Migration 021: Add missing columns for adminController
const migration021 = `
-- Migration 021: Add missing columns expected by adminController
-- Adds columns that the legacy admin funding endpoints expect

ALTER TABLE funding_prospects
ADD COLUMN IF NOT EXISTS contact_person VARCHAR(255),
ADD COLUMN IF NOT EXISTS amount DECIMAL(12, 2),
ADD COLUMN IF NOT EXISTS date_contacted DATE,
ADD COLUMN IF NOT EXISTS icsr_funding_years TEXT[],
ADD COLUMN IF NOT EXISTS icsr_funding_notes TEXT;

-- Add comments
COMMENT ON COLUMN funding_prospects.contact_person IS 'Legacy column - primary contact person name';
COMMENT ON COLUMN funding_prospects.amount IS 'Legacy column - use estimated_amount for new records';
COMMENT ON COLUMN funding_prospects.date_contacted IS 'Legacy column - use last_contact_date for new records';
COMMENT ON COLUMN funding_prospects.icsr_funding_years IS 'Legacy column - use past_funding_years for new records';
COMMENT ON COLUMN funding_prospects.icsr_funding_notes IS 'Additional notes about past ICSR funding';
`;

// Migration 020: Add lead_contact_ids column
const migration020 = `
-- Migration 020: Add lead_contact_ids column to funding_prospects
-- Allows assigning multiple board/AP members as leads for each prospect

ALTER TABLE funding_prospects
ADD COLUMN IF NOT EXISTS lead_contact_ids UUID[] DEFAULT '{}';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_funding_prospects_lead_contacts
ON funding_prospects USING GIN (lead_contact_ids);

-- Add comment
COMMENT ON COLUMN funding_prospects.lead_contact_ids IS 'Array of contact UUIDs assigned as leads for this funding prospect';
`;

// Migration 019: Add Admin Users
const migration019 = `
-- Migration 019: Add Jake Spencer, Lily Maddox, and Jessie Mandirola as admin users

INSERT INTO admin_users (email, role, access_level, created_at)
VALUES
  ('jakespencer6596@gmail.com', 'admin', 'full', NOW()),
  ('lilymaddox14@gmail.com', 'admin', 'full', NOW()),
  ('mandiroj@gmail.com', 'admin', 'full', NOW())
ON CONFLICT (email)
DO UPDATE SET
  role = EXCLUDED.role,
  access_level = EXCLUDED.access_level,
  updated_at = NOW();

-- Verify the insertions
SELECT email, role, access_level, created_at
FROM admin_users
WHERE email IN (
  'jakespencer6596@gmail.com',
  'lilymaddox14@gmail.com',
  'mandiroj@gmail.com'
);
`;

// Migration 018: Funding Prospects System
const migration018 = `
-- Migration 018: Funding Prospects Management System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (to fix schema issues)
DROP TABLE IF EXISTS funding_activities CASCADE;
DROP TABLE IF EXISTS funding_engagements CASCADE;
DROP TABLE IF EXISTS funding_prospects CASCADE;
DROP VIEW IF EXISTS funding_dashboard_stats CASCADE;

-- Funding Prospects Table
CREATE TABLE funding_prospects (
  id SERIAL PRIMARY KEY,
  prospect_type VARCHAR(20) NOT NULL CHECK (prospect_type IN ('organization', 'individual')),

  -- Organization Info
  organization_id UUID REFERENCES organizations(id),
  organization_name VARCHAR(255),
  organization_type VARCHAR(100),
  organization_website VARCHAR(500),

  -- Individual Contact Info
  contact_id UUID REFERENCES contacts(id),
  contact_name VARCHAR(255),
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_title VARCHAR(255),

  -- Funding Details
  funding_type VARCHAR(100),
  estimated_amount DECIMAL(12, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  funding_focus TEXT[],
  geographic_focus VARCHAR(255),

  -- Status & Priority
  status VARCHAR(50) NOT NULL DEFAULT 'prospect',
  priority VARCHAR(20) DEFAULT 'medium',
  tier INTEGER DEFAULT 2 CHECK (tier IN (1, 2, 3)),

  -- Assignment
  assigned_to VARCHAR(255),
  follow_up_flag BOOLEAN DEFAULT FALSE,
  next_follow_up_date DATE,

  -- Dates
  last_contact_date DATE,
  application_deadline DATE,
  decision_date DATE,

  -- Notes
  notes TEXT,
  internal_notes TEXT,
  strengths TEXT,
  challenges TEXT,

  -- ICSR History
  has_funded_icsr BOOLEAN DEFAULT FALSE,
  past_funding_amount DECIMAL(12, 2),
  past_funding_years TEXT[],

  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255),

  CONSTRAINT check_org_or_contact CHECK (
    (prospect_type = 'organization' AND organization_name IS NOT NULL) OR
    (prospect_type = 'individual' AND contact_name IS NOT NULL)
  )
);

-- Funding Engagements (interaction history)
CREATE TABLE IF NOT EXISTS funding_engagements (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER NOT NULL REFERENCES funding_prospects(id) ON DELETE CASCADE,
  engagement_type VARCHAR(50) NOT NULL,
  engagement_date DATE NOT NULL,
  contacted_by VARCHAR(255),
  notes TEXT,
  outcome VARCHAR(100),
  next_steps TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Funding Activity Log
CREATE TABLE IF NOT EXISTS funding_activities (
  id SERIAL PRIMARY KEY,
  prospect_id INTEGER REFERENCES funding_prospects(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL,
  action_description TEXT,
  user_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_funding_prospects_status ON funding_prospects(status);
CREATE INDEX IF NOT EXISTS idx_funding_prospects_tier ON funding_prospects(tier);
CREATE INDEX IF NOT EXISTS idx_funding_prospects_assigned_to ON funding_prospects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_funding_prospects_follow_up ON funding_prospects(follow_up_flag) WHERE follow_up_flag = TRUE;
CREATE INDEX IF NOT EXISTS idx_funding_engagements_prospect ON funding_engagements(prospect_id);
CREATE INDEX IF NOT EXISTS idx_funding_activities_prospect ON funding_activities(prospect_id);

-- Dashboard Stats View
CREATE OR REPLACE VIEW funding_dashboard_stats AS
SELECT
  COUNT(*) as total_prospects,
  COUNT(*) FILTER (WHERE status = 'prospect') as status_prospect,
  COUNT(*) FILTER (WHERE status = 'contacted') as status_contacted,
  COUNT(*) FILTER (WHERE status = 'interested') as status_interested,
  COUNT(*) FILTER (WHERE status = 'application_submitted') as status_application,
  COUNT(*) FILTER (WHERE status = 'under_review') as status_review,
  COUNT(*) FILTER (WHERE status = 'funded') as status_funded,
  COUNT(*) FILTER (WHERE status = 'declined') as status_declined,
  SUM(estimated_amount) FILTER (WHERE status = 'funded') as total_funded,
  COUNT(*) FILTER (WHERE tier = 1) as tier_1,
  COUNT(*) FILTER (WHERE tier = 2) as tier_2,
  COUNT(*) FILTER (WHERE tier = 3) as tier_3,
  COUNT(*) FILTER (WHERE follow_up_flag = TRUE) as follow_ups_pending
FROM funding_prospects;
`;

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Always use SSL for Render databases
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Run Migration 019 (Admin Users)
    console.log('📝 Running Migration 019: Add Admin Users');
    console.log('─'.repeat(50));
    const result019 = await client.query(migration019);

    if (result019.rows && result019.rows.length > 0) {
      console.log('✅ Admin users added:');
      result019.rows.forEach(row => {
        console.log(`   - ${row.email} - ${row.role} (${row.access_level} access)`);
      });
    } else {
      console.log('✅ Migration 019 completed (users may have already existed)');
    }
    console.log();

    // Run Migration 018 (Funding Prospects)
    console.log('📝 Running Migration 018: Funding Prospects System');
    console.log('─'.repeat(50));
    await client.query(migration018);
    console.log('✅ Funding prospects tables created');
    console.log();

    // Run Migration 020 (Add lead_contact_ids column)
    console.log('📝 Running Migration 020: Add lead_contact_ids column');
    console.log('─'.repeat(50));
    await client.query(migration020);
    console.log('✅ lead_contact_ids column added to funding_prospects');
    console.log();

    // Run Migration 021 (Add missing adminController columns)
    console.log('📝 Running Migration 021: Add missing adminController columns');
    console.log('─'.repeat(50));
    await client.query(migration021);
    console.log('✅ Legacy columns added for adminController compatibility');
    console.log();

    // Run Migration 022 (Add organization column to contacts)
    console.log('📝 Running Migration 022: Add organization column to contacts');
    console.log('─'.repeat(50));
    await client.query(migration022);
    console.log('✅ organization column added to contacts table');
    console.log();

    // Run Migration 023 (Email Communication System)
    console.log('📝 Running Migration 023: Email Communication System');
    console.log('─'.repeat(50));
    await client.query(migration023);
    console.log('✅ Email templates, campaigns, and tracking tables created');
    console.log();

    // Run Migration 024 (Abstract Review System)
    console.log('📝 Running Migration 024: Abstract Review System');
    console.log('─'.repeat(50));
    await client.query(migration024);
    console.log('✅ Abstract review, scoring, and decision tables created');
    console.log();

    // Run Migration 025 (Funding Pipeline Enhancements)
    console.log('📝 Running Migration 025: Funding Pipeline Enhancements');
    console.log('─'.repeat(50));
    await client.query(migration025);
    console.log('✅ Pipeline stages, activities, and tasks added');
    console.log();

    // Run Migration 026 (Payment System)
    console.log('📝 Running Migration 026: Payment System with Stripe');
    console.log('─'.repeat(50));
    await client.query(migration026);
    console.log('✅ Payment transactions, memberships, and Stripe webhook tables created');
    console.log();

    // Run Migration 027 (AI Grant Writing Assistant)
    console.log('📝 Running Migration 027: AI Grant Writing Assistant');
    console.log('─'.repeat(50));
    await client.query(migration027);
    console.log('✅ Grant drafts, AI generations, and templates tables created');
    console.log();

    // Run Migration 028 (AI Insights System)
    console.log('📝 Running Migration 028: AI Insights and Recommendations');
    console.log('─'.repeat(50));
    await client.query(migration028);
    console.log('✅ AI insights, data quality, trends, and suggested actions tables created');
    console.log();

    // Run Migration 029 (Email Parsing System)
    console.log('📝 Running Migration 029: Email Parsing System');
    console.log('─'.repeat(50));
    await client.query(migration029);
    console.log('✅ Email parsing, extraction, and action tracking tables created');
    console.log();

    // Verify tables exist
    console.log('🔍 Verifying tables...');
    console.log('─'.repeat(50));
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE tablename LIKE 'funding%'
      ORDER BY tablename;
    `);

    if (tablesResult.rows.length > 0) {
      console.log('✅ Funding tables created:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.tablename}`);
      });
    }
    console.log();

    // Verify view exists
    const viewResult = await client.query(`
      SELECT viewname
      FROM pg_views
      WHERE viewname = 'funding_dashboard_stats';
    `);

    if (viewResult.rows.length > 0) {
      console.log('✅ Dashboard view created: funding_dashboard_stats');
    }
    console.log();

    // Count admin users
    const adminCount = await client.query(`
      SELECT COUNT(*) as count FROM admin_users;
    `);
    console.log(`📊 Total admin users: ${adminCount.rows[0].count}`);
    console.log();

    console.log('🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable not set');
  console.error('\nPlease ensure your .env file contains DATABASE_URL');
  console.error('Or run with: DATABASE_URL="your-url" node run-migrations.js');
  process.exit(1);
}

// Run migrations
console.log('🚀 ISRS Database Migrations');
console.log('═'.repeat(50));
console.log(`📍 Target: ${process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'database'}`);
console.log('═'.repeat(50));
console.log();

runMigrations();
