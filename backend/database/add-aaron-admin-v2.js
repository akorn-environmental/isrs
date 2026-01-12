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

    // Check admin_users structure
    console.log('Checking admin_users table structure...');
    const structure = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'admin_users'
      ORDER BY ordinal_position
    `);
    console.log('Columns:', structure.rows.map(r => r.column_name).join(', '));
    console.log();

    const email = 'aaron.kornbluth@gmail.com';
    const firstName = 'Aaron';
    const lastName = 'Kornbluth';
    const role = 'super_admin';

    // Check if user already exists
    const existingUser = await client.query(`
      SELECT * FROM admin_users WHERE email = $1
    `, [email]);

    if (existingUser.rows.length > 0) {
      console.log('✓ User already exists in admin_users, updating...\n');

      const updateResult = await client.query(`
        UPDATE admin_users
        SET role = $1, is_active = true, updated_at = NOW()
        WHERE email = $2
        RETURNING *
      `, [role, email]);

      const user = updateResult.rows[0];
      console.log('✅ Admin user updated:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('✓ Creating new admin user...\n');

      const insertResult = await client.query(`
        INSERT INTO admin_users (
          email, full_name, role, access_level,
          can_edit_profiles, can_view_financials,
          can_manage_conferences, can_manage_contacts,
          created_at, updated_at
        )
        VALUES ($1, $2, $3, 100, true, true, true, true, NOW(), NOW())
        RETURNING *
      `, [email, `${firstName} ${lastName}`, role]);

      const user = insertResult.rows[0];
      console.log('✅ Admin user created:');
      console.log(JSON.stringify(user, null, 2));
    }

    // Also check/create attendee profile
    console.log('\n\nChecking attendee_profiles...');
    const existingProfile = await client.query(`
      SELECT * FROM attendee_profiles WHERE user_email = $1
    `, [email]);

    if (existingProfile.rows.length === 0) {
      console.log('Creating attendee profile...');
      await client.query(`
        INSERT INTO attendee_profiles (
          user_email, first_name, last_name,
          account_status, email_verified, email_verified_at,
          created_at, updated_at
        ) VALUES ($1, $2, $3, 'active', true, NOW(), NOW(), NOW())
      `, [email, firstName, lastName]);
      console.log('✅ Attendee profile created');
    } else {
      console.log('✅ Attendee profile already exists');
    }

    console.log('\n🎉 Aaron Kornbluth is now a Super Admin!');
    console.log('\nYou can now log in at: http://localhost:8080/login.html');
    console.log(`Email: ${email}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addAaronAsAdmin();
