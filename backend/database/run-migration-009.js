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
    console.log('🔄 Starting Migration 009: Add Proxy Registration Fields...\n');

    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '009_add_proxy_registration_fields.sql'),
      'utf8'
    );

    await client.query('BEGIN');
    await client.query(migrationSQL);
    await client.query('COMMIT');

    console.log('✅ Migration 009 completed successfully!');
    console.log('📊 Proxy registration fields (registered_by_email, registered_by_name) added to conference_registrations table');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration 009 failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
