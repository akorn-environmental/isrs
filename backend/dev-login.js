#!/usr/bin/env node
/**
 * ISRS Dev Login Script
 *
 * Generates magic link login tokens for development.
 *
 * Usage:
 *   node dev-login.js <email>
 *   node dev-login.js aaron.kornbluth@gmail.com
 *
 * Output:
 *   Magic link URL that you can click to log in
 *   Token valid for 15 minutes
 */

require('dotenv').config();
const { pool } = require('./src/config/database');
const crypto = require('crypto');

const MAGIC_LINK_EXPIRY_MINUTES = 15;

async function generateDevLogin(email) {
  try {
    if (!email) {
      console.error('❌ Error: Email address required');
      console.log('\nUsage: node dev-login.js <email>');
      console.log('Example: node dev-login.js aaron.kornbluth@gmail.com');
      process.exit(1);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userResult = await pool.query(
      `SELECT id, first_name, last_name, user_email, account_status
       FROM attendee_profiles
       WHERE user_email = $1`,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      console.error(`❌ Error: No user found with email ${normalizedEmail}`);
      process.exit(1);
    }

    const user = userResult.rows[0];

    if (user.account_status !== 'active') {
      console.error(`❌ Error: User account is ${user.account_status}, not active`);
      process.exit(1);
    }

    // Generate magic link token
    const magicLinkToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

    // Create session with magic link token
    await pool.query(
      `INSERT INTO user_sessions (
        attendee_id, email, magic_link_token, token_expires_at, created_at
      ) VALUES ($1, $2, $3, $4, NOW())`,
      [user.id, normalizedEmail, magicLinkToken, tokenExpiresAt]
    );

    // Determine environment
    const isDevelopment = process.env.NODE_ENV !== 'production';
    const backendUrl = process.env.BACKEND_URL ||
      (isDevelopment ? 'http://localhost:3000' : 'https://isrs-database-backend.onrender.com');

    const magicLink = `${backendUrl}/auth/verify?token=${magicLinkToken}`;

    // Output
    console.log('\n✅ Dev login token generated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 User: ${user.first_name} ${user.last_name} (${user.user_email})`);
    console.log(`⏰ Expires: ${tokenExpiresAt.toLocaleString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🔗 Magic Link (click to login):');
    console.log(`\n   ${magicLink}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('❌ Error generating dev login:', error.message);
    process.exit(1);
  }
}

// Get email from command line args
const email = process.argv[2];
generateDevLogin(email);
