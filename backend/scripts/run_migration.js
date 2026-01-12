require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use DATABASE_URL from environment or hardcoded connection string
const dbUrl = process.env.DATABASE_URL ||
  'postgresql://isrs_user:rzE9q7ONZUAAdnA7ndLMXPKILyI6mnVr@dpg-d41lpl3uibrs73andv50-a.oregon-postgres.render.com/isrs_database?sslmode=require';

const pool = new Pool({
  connectionString: dbUrl
});

async function runMigration() {
  try {
    const sql = fs.readFileSync(
      path.join(__dirname, '../database/add_exchange_token.sql'),
      'utf8'
    );

    console.log('Running migration...');
    console.log(sql);

    await pool.query(sql);

    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
