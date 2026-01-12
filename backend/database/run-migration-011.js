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
  console.log('🔄 Starting Migration 011: Create Committees and Meetings System...\n');

  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '011_create_committees_and_meetings.sql'),
      'utf8'
    );

    await pool.query(migrationSQL);

    console.log('✅ Migration 011 completed successfully!');
    console.log('📊 Created tables:');
    console.log('   - committees (Board, AP, Standing & Ad-hoc committees)');
    console.log('   - committee_members (membership and roles)');
    console.log('   - meetings (all scheduled meetings)');
    console.log('   - meeting_attendees (invitations and RSVPs)');
    console.log('   - meeting_agenda_items (meeting agendas)');
    console.log('   - meeting_votes (voting records)');
    console.log('\n📋 Default committees created:');
    console.log('   - Board of Directors');
    console.log('   - Advisory Panel');
    console.log('   - Conference Planning Committee');
    console.log('   - Publications Committee');
    console.log('   - Membership Committee');
    console.log('   - Finance Committee');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration();
