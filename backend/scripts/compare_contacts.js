require('dotenv').config({ path: '/Users/akorn/isrs-database-backend/.env' });
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Simple CSV parser that handles quoted fields
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = parseCSVLine(lines[0]);
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const record = {};
    headers.forEach((h, idx) => {
      record[h] = values[idx] || '';
    });
    records.push(record);
  }
  return records;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  // Load spreadsheet data
  const csv = fs.readFileSync('/tmp/isrs_contacts.csv', 'utf-8');
  const spreadsheetContacts = parseCSV(csv);

  console.log('Spreadsheet contacts:', spreadsheetContacts.length);

  // Get all emails from database
  const dbResult = await pool.query('SELECT email FROM contacts');
  const dbEmails = new Set(dbResult.rows.map(r => r.email?.toLowerCase().trim()).filter(Boolean));

  console.log('Database contacts:', dbEmails.size);

  // Find contacts in spreadsheet not in database
  const missingContacts = [];
  const existingContacts = [];

  for (const contact of spreadsheetContacts) {
    const email = contact.Email?.toLowerCase().trim();
    if (!email || !email.includes('@')) continue;

    if (dbEmails.has(email)) {
      existingContacts.push(contact);
    } else {
      missingContacts.push(contact);
    }
  }

  console.log('\n=== COMPARISON RESULTS ===');
  console.log('Contacts in both:', existingContacts.length);
  console.log('Contacts in spreadsheet only (MISSING):', missingContacts.length);

  if (missingContacts.length > 0) {
    console.log('\n=== MISSING CONTACTS (first 20) ===');
    missingContacts.slice(0, 20).forEach(c => {
      const name = c.Full_Name || (c.First_Name + ' ' + c.Last_Name);
      console.log('  ' + name + ' <' + c.Email + '> - ' + c.Primary_Organization);
    });
  }

  // Analyze fields that might need updating for existing contacts
  console.log('\n=== SPREADSHEET FIELDS NOT IN DB SCHEMA ===');
  const unmappedFields = ['Contact_Type', 'Tags', 'LinkedIn', 'Website', 'Status', 'Email_Valid',
    'Profile_Complete', 'Is_International', 'Conference_Role', 'Source_File', 'Import_Batch',
    'Engagement_Score', 'Priority_Level'];

  console.log('Fields in spreadsheet not mapped to DB:');
  unmappedFields.forEach(f => console.log('  - ' + f));

  // Check if existing contacts have missing data we could fill in
  console.log('\n=== SAMPLE DATA THAT COULD BE UPDATED ===');
  let updatableCount = 0;
  for (const contact of existingContacts.slice(0, 100)) {
    if (contact.Tags || contact.LinkedIn || contact.Website || contact.Research_Interests) {
      updatableCount++;
      if (updatableCount <= 5) {
        console.log('  ' + contact.Email + ':');
        if (contact.Tags) console.log('    Tags: ' + contact.Tags.substring(0, 80) + '...');
        if (contact.LinkedIn) console.log('    LinkedIn: ' + contact.LinkedIn);
        if (contact.Website) console.log('    Website: ' + contact.Website);
        if (contact.Research_Interests) console.log('    Research: ' + contact.Research_Interests.substring(0, 60) + '...');
      }
    }
  }
  console.log('  ... and ' + updatableCount + ' more contacts with enrichable data');

  await pool.end();
}

main().catch(console.error);
