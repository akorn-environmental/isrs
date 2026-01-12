/**
 * Add Aaron Kornbluth as Super Admin
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addAaronAsAdmin() {
  const client = await pool.connect();

  try {
    console.log('🔐 Adding Aaron Kornbluth as Super Admin\n');
    console.log('==========================================\n');

    const email = 'aaron.kornbluth@gmail.com';
    const firstName = 'Aaron';
    const lastName = 'Kornbluth';
    const role = 'super_admin';

    // Check if user already exists
    const existingUser = await client.query(`
      SELECT id, user_email, first_name, last_name, role, account_status
      FROM attendee_profiles
      WHERE user_email = $1
    `, [email]);

    if (existingUser.rows.length > 0) {
      console.log('✓ User already exists, updating role to super_admin...\n');

      const updateResult = await client.query(`
        UPDATE attendee_profiles
        SET
          role = $1,
          account_status = 'active',
          email_verified = true,
          updated_at = NOW()
        WHERE user_email = $2
        RETURNING id, user_email, first_name, last_name, role, account_status
      `, [role, email]);

      const user = updateResult.rows[0];
      console.log('✅ User updated successfully:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.user_email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.account_status}`);
    } else {
      console.log('✓ Creating new user...\n');

      const insertResult = await client.query(`
        INSERT INTO attendee_profiles (
          user_email,
          first_name,
          last_name,
          role,
          account_status,
          email_verified,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, 'active', true, NOW(), NOW())
        RETURNING id, user_email, first_name, last_name, role, account_status
      `, [email, firstName, lastName, role]);

      const user = insertResult.rows[0];
      console.log('✅ User created successfully:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Email: ${user.user_email}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.account_status}`);
    }

    console.log('\n🎉 Aaron Kornbluth is now a Super Admin!');
    console.log('\nYou can now log in at: http://localhost:8080/login.html');
    console.log(`Email: ${email}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addAaronAsAdmin().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
