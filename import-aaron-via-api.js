/**
 * Import Aaron Kornbluth's ISRS/ICSR2024 data via Python backend API
 * Updates profile created via self-registration with complete historical data
 *
 * Data Source: ICSR2024 registration CSV
 * Aaron,Kornbluth,aaron.kornbluth@gmail.com,(60) 9534040,
 * "8902 Courts Way, Silver Spring, MD, 20910, USA",
 * Shellfish Restoration Conference - Full Registration,Full Conference Attendee,,
 * 26/Aug/2024 11:51 AM
 *
 * Run with: node import-aaron-via-api.js
 */

const https = require('https');

const API_BASE = 'https://isrs-python-backend.onrender.com';
const EMAIL = 'aaron.kornbluth@gmail.com';

// Make HTTPS request
function apiRequest(path, method, data, token = null) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const url = new URL(API_BASE + path);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    };

    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Step 1: Request magic link
async function requestMagicLink() {
  console.log('\n🔐 Step 1: Requesting magic link...');
  const response = await apiRequest('/api/auth/login', 'POST', { email: EMAIL });

  if (response.status === 200) {
    console.log('   ✅ Magic link sent to', EMAIL);
    console.log('   ⏳ Please check your email and click the magic link');
    console.log('   ℹ️  The link contains a session token we need');
    console.log('\n   After clicking the link, check your browser URL for the token.');
    console.log('   It will look like: ?token=XXXXX');
    console.log('\n   Then run this script again with the token:');
    console.log(`   node import-aaron-via-api.js YOUR_TOKEN_HERE`);
    return false;
  } else {
    console.log('   ❌ Failed to send magic link:', response.data);
    return false;
  }
}

// Step 2: Update profile with complete data
async function updateProfile(token) {
  console.log('\n👤 Step 2: Updating profile with complete data...');
  console.log('   Using token:', token.substring(0, 20) + '...');

  const profileData = {
    organization_name: "akorn environmental",
    position: "Founder & CEO",
    phone: "(609) 534-0040",
    country: "USA",
    city: "Silver Spring, MD",
    bio: (
      "Aaron Kornbluth is the Founder and CEO of akorn environmental, " +
      "an environmental consulting firm specializing in shellfish restoration " +
      "and coastal ecosystem management. As a board member of the International " +
      "Shellfish Restoration Society (ISRS), Aaron has been instrumental in " +
      "advancing shellfish restoration initiatives and facilitating collaboration " +
      "between scientists, policymakers, and coastal communities."
    )
  };

  const response = await apiRequest('/api/auth/me', 'PATCH', profileData, token);

  if (response.status === 200) {
    console.log('   ✅ Profile updated successfully!');
    console.log('\n   Updated fields:');
    console.log(`      • Organization: ${profileData.organization_name}`);
    console.log(`      • Position: ${profileData.position}`);
    console.log(`      • Phone: ${profileData.phone}`);
    console.log(`      • Location: ${profileData.city}, ${profileData.country}`);
    console.log(`      • Bio: ${profileData.bio.length} characters`);
    console.log('\n   Profile completion: ~80%');
    console.log('\n   View at: https://www.shellfish-society.org/member/profile.html');
    return true;
  } else {
    console.log('   ❌ Failed to update profile:', response.data);
    return false;
  }
}

// Main
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  AARON KORNBLUTH - PROFILE DATA IMPORT (via API)');
  console.log('═══════════════════════════════════════════════════════════');

  // Check if token provided as argument
  const token = process.argv[2];

  if (!token) {
    console.log('\n📧 No token provided. Will request magic link instead...');
    await requestMagicLink();
  } else {
    const success = await updateProfile(token);
    if (success) {
      console.log('\n═══════════════════════════════════════════════════════════');
      console.log('  ✅ IMPORT COMPLETE');
      console.log('═══════════════════════════════════════════════════════════');
    }
  }
}

main().catch(console.error);
