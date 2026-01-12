/**
 * Import ICSR 2024 data from local CSV files
 * Run with: node scripts/import-icsr2024-local.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { parse } = require('csv-parse/sync');

const API_BASE = 'https://isrs-database-backend.onrender.com';

// CSV files to import
const CSV_FILES = {
  abstracts: '/Users/akorn/Desktop/SORT/01 ICSR2024 - ABSTRACT SUBMISSIONS - ABSTRACT SUBMISSIONS.csv',
  sponsors: '/Users/akorn/Desktop/SORT/01 ICSR2024 - SPONSORS - SPONSORS.csv',
  exhibitors: '/Users/akorn/Desktop/SORT/01 ICSR2024 - EXHIBITOR INFO - EXHIBITOR INFO.csv',
  registrants: '/Users/akorn/Desktop/SORT/01 ICSR2024 - REGISTRANTS - REGISTRANTS.csv'
};

// Parse CSV using csv-parse library
function parseCSV(content) {
  const rows = parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  });
  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  return { headers, rows };
}

// Login and get session token
async function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: 'aaron.kornbluth@gmail.com',
      password: 'Test123'
    });

    const options = {
      hostname: 'isrs-database-backend.onrender.com',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            resolve(result.data.sessionToken);
          } else {
            reject(new Error(result.error));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Send contacts to API
async function saveContacts(token, contacts) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      contacts,
      source_provider: 'ICSR2024',
      source_description: 'ICSR 2024 Conference Import'
    });

    const options = {
      hostname: 'isrs-database-backend.onrender.com',
      port: 443,
      path: '/api/import/save',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ success: false, error: body });
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Process abstracts
function processAbstracts(data) {
  const contacts = [];

  for (const row of data.rows) {
    let email = row['Email Address'] || '';
    // Clean up email (some have notes in parentheses)
    email = email.split('(')[0].trim().toLowerCase();
    if (!email || !email.includes('@')) continue;

    const firstName = row['YOUR FIRST (GIVEN) NAME'] || '';
    const lastName = row['YOUR LAST (FAMILY) NAME'] || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const organization = row['YOUR ORGANIZATION / AFFILIATION'] || '';
    const country = row['YOUR HOME COUNTRY'] || '';
    const title = row['YOUR TITLE'] || '';

    contacts.push({
      email,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      organization_name: organization,
      country,
      contact_type: 'Academic'
    });
  }

  return contacts;
}

// Process sponsors
function processSponsors(data) {
  const contacts = [];

  for (const row of data.rows) {
    const type = row['TYPE'] || '';
    if (!type.includes('SPONSOR') && !type.includes('EXHIBITOR')) continue;

    const orgName = row['NAME'] || '';
    const email1 = (row['POC1\nEMAIL'] || row['POC1 EMAIL'] || '').toLowerCase().trim();
    const email2 = (row['POC2 EMAIL'] || '').toLowerCase().trim();
    const poc1 = row['POC1'] || '';
    const poc2 = row['POC2'] || '';
    const poc1Title = row['POC1 TITLE'] || '';
    const poc2Title = row['POC2 TITLE'] || '';

    if (email1 && email1.includes('@')) {
      contacts.push({
        email: email1,
        full_name: poc1,
        organization_name: orgName,
        contact_type: 'Private'
      });
    }

    if (email2 && email2.includes('@')) {
      contacts.push({
        email: email2,
        full_name: poc2,
        organization_name: orgName,
        contact_type: 'Private'
      });
    }
  }

  return contacts;
}

// Process exhibitors
function processExhibitors(data) {
  const contacts = [];

  for (const row of data.rows) {
    const email = (row['Email Address'] || '').toLowerCase().trim();
    if (!email || !email.includes('@')) continue;

    const name = row['YOUR NAME'] || '';
    const org = row['ORGANIZATION / AFFILIATION'] || '';
    const phone = row['YOUR PHONE'] || '';

    contacts.push({
      email,
      full_name: name,
      organization_name: org,
      phone,
      contact_type: 'Private'
    });
  }

  return contacts;
}

// Process registrants
function processRegistrants(data) {
  const contacts = [];

  for (const row of data.rows) {
    const email = (row['Email Address'] || row['EMAIL'] || '').toLowerCase().trim();
    if (!email || !email.includes('@')) continue;

    const firstName = row['FIRST NAME'] || row['First Name'] || '';
    const lastName = row['LAST NAME'] || row['Last Name'] || '';
    const fullName = row['NAME'] || `${firstName} ${lastName}`.trim();
    const org = row['ORGANIZATION'] || row['ORGANIZATION / AFFILIATION'] || '';
    const country = row['COUNTRY'] || '';

    contacts.push({
      email,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      organization_name: org,
      country,
      contact_type: 'Academic'
    });
  }

  return contacts;
}

// Main import function
async function main() {
  console.log('=== ICSR 2024 Data Import ===\n');

  // Login
  console.log('Logging in...');
  let token;
  try {
    token = await login();
    console.log('Logged in successfully\n');
  } catch (error) {
    console.error('Login failed:', error.message);
    process.exit(1);
  }

  const allContacts = [];

  // Import abstracts
  if (fs.existsSync(CSV_FILES.abstracts)) {
    console.log('Processing abstracts...');
    const content = fs.readFileSync(CSV_FILES.abstracts, 'utf-8');
    const data = parseCSV(content);
    const contacts = processAbstracts(data);
    console.log(`  Found ${contacts.length} abstract submitters`);
    allContacts.push(...contacts);
  }

  // Import sponsors
  if (fs.existsSync(CSV_FILES.sponsors)) {
    console.log('Processing sponsors...');
    const content = fs.readFileSync(CSV_FILES.sponsors, 'utf-8');
    const data = parseCSV(content);
    const contacts = processSponsors(data);
    console.log(`  Found ${contacts.length} sponsor contacts`);
    allContacts.push(...contacts);
  }

  // Import exhibitors
  if (fs.existsSync(CSV_FILES.exhibitors)) {
    console.log('Processing exhibitors...');
    const content = fs.readFileSync(CSV_FILES.exhibitors, 'utf-8');
    const data = parseCSV(content);
    const contacts = processExhibitors(data);
    console.log(`  Found ${contacts.length} exhibitor contacts`);
    allContacts.push(...contacts);
  }

  // Import registrants
  if (fs.existsSync(CSV_FILES.registrants)) {
    console.log('Processing registrants...');
    const content = fs.readFileSync(CSV_FILES.registrants, 'utf-8');
    const data = parseCSV(content);
    const contacts = processRegistrants(data);
    console.log(`  Found ${contacts.length} registrants`);
    allContacts.push(...contacts);
  }

  // Deduplicate by email
  const uniqueEmails = new Map();
  for (const contact of allContacts) {
    if (!uniqueEmails.has(contact.email)) {
      uniqueEmails.set(contact.email, contact);
    } else {
      // Merge data
      const existing = uniqueEmails.get(contact.email);
      existing.tags = [...new Set([...(existing.tags || []), ...(contact.tags || [])])];
      if (!existing.organization_name && contact.organization_name) {
        existing.organization_name = contact.organization_name;
      }
      if (!existing.country && contact.country) {
        existing.country = contact.country;
      }
    }
  }

  const dedupedContacts = Array.from(uniqueEmails.values());
  console.log(`\nTotal unique contacts: ${dedupedContacts.length}`);

  // Save in batches
  const batchSize = 50;
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalFailed = 0;

  for (let i = 0; i < dedupedContacts.length; i += batchSize) {
    const batch = dedupedContacts.slice(i, i + batchSize);
    console.log(`\nSaving batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dedupedContacts.length / batchSize)}...`);

    try {
      const result = await saveContacts(token, batch);
      console.log('  Full response:', JSON.stringify(result).substring(0, 500));
      if (result.success) {
        totalCreated += result.results?.created || 0;
        totalUpdated += result.results?.updated || 0;
        totalFailed += result.results?.failed || 0;
        console.log(`  Created: ${result.results?.created || 0}, Updated: ${result.results?.updated || 0}`);
      } else {
        console.error(`  Error: ${result.error}`);
        totalFailed += batch.length;
      }
    } catch (error) {
      console.error(`  Error: ${error.message}`);
      totalFailed += batch.length;
    }

    // Small delay between batches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n=== Import Complete ===');
  console.log(`Created: ${totalCreated}`);
  console.log(`Updated: ${totalUpdated}`);
  console.log(`Failed: ${totalFailed}`);
}

main().catch(console.error);
