const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const betaTesters = [
  'lisa.paton@gmail.com',
  'jakespencer6596@gmail.com',
  'mandiroj@gmail.com',
  'hdohrstrom@gmail.com'
];

async function check() {
  const client = await pool.connect();
  try {
    console.log('🔍 Checking for beta testers in attendee_profiles...\n');

    const result = await client.query(`
      SELECT user_email, first_name, last_name, id, created_at
      FROM attendee_profiles
      WHERE user_email = ANY($1)
      ORDER BY user_email
    `, [betaTesters]);

    console.log(`Found ${result.rows.length} out of 4 beta testers:\n`);

    if (result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(`✓ ${row.user_email}`);
        console.log(`  Name: ${row.first_name || ''} ${row.last_name || ''}`);
        console.log(`  ID: ${row.id}`);
        console.log(`  Created: ${row.created_at}\n`);
      });
    }

    const existing = result.rows.map(r => r.user_email);
    const missing = betaTesters.filter(e => !existing.includes(e));

    if (missing.length > 0) {
      console.log(`\nMissing ${missing.length} beta testers:`);
      missing.forEach(email => console.log(`✗ ${email}`));
    } else {
      console.log('\n✅ All beta testers exist in attendee_profiles!');
    }

  } finally {
    client.release();
    await pool.end();
  }
}

check();
