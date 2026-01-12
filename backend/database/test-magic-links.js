/**
 * Test Magic Link Authentication for Beta Testers
 * Verifies that the unified user system works correctly
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const betaTesters = [
  { email: 'lisa.paton@gmail.com', name: 'Lisa Paton', role: 'super_admin' },
  { email: 'hdohrstrom@gmail.com', name: 'Henry Ohrstrom', role: 'admin' },
  { email: 'jakespencer6596@gmail.com', name: 'Jake Spencer', role: 'admin' },
  { email: 'mandiroj@gmail.com', name: 'Jessie Mandirola', role: 'admin' }
];

async function testMagicLinkSetup() {
  const client = await pool.connect();

  try {
    console.log('🔐 Testing Magic Link Authentication Setup\n');
    console.log('==========================================\n');

    for (const tester of betaTesters) {
      console.log(`Testing: ${tester.name} (${tester.email})`);
      console.log('─'.repeat(60));

      // Check if attendee profile exists
      const profileResult = await client.query(`
        SELECT id, user_email, first_name, last_name, account_status, email_verified
        FROM attendee_profiles
        WHERE user_email = $1
      `, [tester.email]);

      if (profileResult.rows.length === 0) {
        console.log('❌ No attendee profile found');
        console.log('');
        continue;
      }

      const profile = profileResult.rows[0];
      console.log(`✅ Attendee Profile: ${profile.id}`);
      console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
      console.log(`   Status: ${profile.account_status}`);
      console.log(`   Email Verified: ${profile.email_verified}`);

      // Check if linked to admin_users
      const adminResult = await client.query(`
        SELECT role, access_level, full_name, attendee_id
        FROM admin_users
        WHERE email = $1
      `, [tester.email]);

      if (adminResult.rows.length === 0) {
        console.log('⚠️  Not linked to admin_users');
      } else {
        const admin = adminResult.rows[0];
        const roleIcon = admin.role === 'super_admin' ? '👑' : '🔑';
        console.log(`${roleIcon} Admin Role: ${admin.role.toUpperCase()}`);
        console.log(`   Access Level: ${admin.access_level}`);
        console.log(`   Linked: ${admin.attendee_id ? '✓' : '✗'}`);

        // Verify linkage
        if (admin.attendee_id === profile.id) {
          console.log('   ✅ Correctly linked to attendee profile');
        } else {
          console.log('   ⚠️  Linkage mismatch!');
        }
      }

      // Check if they can request magic link (simulate the query from requestMagicLink)
      const canLogin = await client.query(`
        SELECT id, first_name, last_name FROM attendee_profiles WHERE user_email = $1
      `, [tester.email]);

      if (canLogin.rows.length > 0) {
        console.log('✅ Can request magic link login');
      } else {
        console.log('❌ Cannot request magic link login');
      }

      // Check if magic link response would include admin info
      const magicLinkResponse = await client.query(`
        SELECT
          ap.id,
          ap.first_name,
          ap.last_name,
          ap.user_email,
          au.role AS admin_role,
          au.access_level AS admin_access_level
        FROM attendee_profiles ap
        LEFT JOIN admin_users au ON ap.id = au.attendee_id
        WHERE ap.user_email = $1
      `, [tester.email]);

      if (magicLinkResponse.rows.length > 0) {
        const resp = magicLinkResponse.rows[0];
        if (resp.admin_role) {
          console.log(`✅ Magic link will include admin role: ${resp.admin_role}`);
        } else {
          console.log('⚠️  No admin role will be returned in magic link response');
        }
      }

      console.log('');
    }

    console.log('\n📊 Summary');
    console.log('==========');

    const stats = await client.query(`
      SELECT
        COUNT(DISTINCT ap.id) as total_profiles,
        COUNT(DISTINCT au.id) as total_admins,
        COUNT(DISTINCT CASE WHEN au.attendee_id IS NOT NULL THEN au.id END) as linked_admins
      FROM attendee_profiles ap
      LEFT JOIN admin_users au ON ap.user_email IN (
        'lisa.paton@gmail.com',
        'hdohrstrom@gmail.com',
        'jakespencer6596@gmail.com',
        'mandiroj@gmail.com'
      ) AND ap.id = au.attendee_id
      WHERE ap.user_email IN (
        'lisa.paton@gmail.com',
        'hdohrstrom@gmail.com',
        'jakespencer6596@gmail.com',
        'mandiroj@gmail.com'
      )
    `);

    console.log(`Beta Tester Profiles: 4`);
    console.log(`Linked to Admin: ${stats.rows[0].linked_admins || 0}/4`);
    console.log('');

    if (stats.rows[0].linked_admins === 4) {
      console.log('✅ All beta testers are ready for magic link authentication!');
      console.log('✅ They will have both member and admin portal access!');
    } else {
      console.log('⚠️  Some beta testers are not fully configured');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

testMagicLinkSetup();
