#!/usr/bin/env node

/**
 * Run a specific SQL migration file
 * Usage: node scripts/run-migration.js <migration-file-name>
 * Example: node scripts/run-migration.js 017_create_import_logs.sql
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../src/config/database');

async function runMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '../database/migrations', migrationFile);

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationFile}`);
    console.error(`   Looking in: ${migrationPath}`);
    process.exit(1);
  }

  try {
    console.log(`📋 Running migration: ${migrationFile}`);

    const sql = fs.readFileSync(migrationPath, 'utf8');

    await pool.query(sql);

    console.log(`✅ Migration completed successfully: ${migrationFile}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Migration failed: ${migrationFile}`);
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Usage: node scripts/run-migration.js <migration-file-name>');
  console.error('   Example: node scripts/run-migration.js 017_create_import_logs.sql');
  process.exit(1);
}

runMigration(migrationFile);
