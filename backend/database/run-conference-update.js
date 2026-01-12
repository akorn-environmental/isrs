require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  console.log('🔄 Starting Migration: Update ICSR2026 Conference Details...\n');

  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '014_update_icsr2026_details.sql'),
      'utf8'
    );

    const result = await pool.query(migrationSQL);

    console.log('✅ ICSR2026 conference updated successfully!\n');
    console.log('📋 Updated details:');
    console.log('   ✓ Name: ICSR2026 - International Conference on Shellfish Restoration');
    console.log('   ✓ Location: Little Creek Casino Resort, Puget Sound, Washington');
    console.log('   ✓ Dates: October 4-8, 2026');
    console.log('   ✓ Hosted by: Squaxin Island Tribe');
    console.log('   ✓ Theme: Bridging Science, Culture, and Conservation');
    console.log('   ✓ Zeffy URL: https://www.zeffy.com/en-US/ticketing/icsr2026-international-conference-on-shellfish-restoration\n');

    // Show the verification result if available
    if (result && result.rows && result.rows.length > 0) {
      console.log('📊 Verification:');
      const conf = result.rows[0];
      console.log(`   Year: ${conf.year}`);
      console.log(`   Name: ${conf.name}`);
      console.log(`   Location: ${conf.location}`);
      console.log(`   Dates: ${conf.start_date} to ${conf.end_date}`);
      console.log(`   Website: ${conf.website}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
