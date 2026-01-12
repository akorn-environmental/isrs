require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();

  try {
    console.log('🔄 Starting Migration 010: Add Emergency Contact Authorization...\n');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '010_add_emergency_contact_authorization.sql'),
      'utf8'
    );

    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Migration 010 completed successfully!');
    console.log('📊 Added emergency_contact_authorization field to conference_registrations table');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration 010 failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
