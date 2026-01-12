/**
 * Import Data from CSV Files
 * Expects CSV files in /data/import/ directory
 * Creates profiles for all people, organizations, and links relationships
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false
});

const DATA_DIR = path.join(__dirname, '../data/import');

// CSV files to import
const CSV_FILES = {
  abstracts: 'abstracts.csv',
  contacts: 'contacts.csv',
  sponsorsExhibitors: 'sponsors-exhibitors.csv',
  sponsors: 'sponsors.csv',
  masterDb: 'master-database.csv'
};

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Handle quoted CSV values
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, index) => {
      row[header] = (values[index] || '').replace(/^"|"$/g, '');
    });

    rows.push(row);
  }

  return { headers, rows };
}

// Normalize email
function normalizeEmail(email) {
  if (!email) return null;
  return email.toLowerCase().trim();
}

// Normalize org name
function normalizeOrgName(name) {
  if (!name) return null;
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(Inc|LLC|Ltd|Corp|Corporation|Company|Co)\b\.?/gi, '')
    .trim();
}

// Get or create person
async function getOrCreatePerson(client, email, firstName, lastName, organization, country, stats) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    return null;
  }

  // Check if exists
  const existing = await client.query(
    'SELECT id FROM attendee_profiles WHERE user_email = $1',
    [normalizedEmail]
  );

  if (existing.rows.length > 0) {
    stats.existingPeople++;
    return existing.rows[0].id;
  }

  // Create new
  const result = await client.query(`
    INSERT INTO attendee_profiles (
      user_email, first_name, last_name, organization_name, country
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [normalizedEmail, firstName || '', lastName || '', organization || '', country || '']);

  stats.newPeople++;
  console.log(`   ✓ Created profile: ${normalizedEmail}`);
  return result.rows[0].id;
}

// Get or create org
async function getOrCreateOrg(client, orgName, website, stats) {
  const normalized = normalizeOrgName(orgName);

  if (!normalized) return null;

  // Fuzzy match
  const existing = await client.query(`
    SELECT id FROM organizations
    WHERE LOWER(REPLACE(name, ' ', '')) LIKE LOWER(REPLACE($1, ' ', ''))
  `, [normalized]);

  if (existing.rows.length > 0) {
    stats.existingOrgs++;
    return existing.rows[0].id;
  }

  // Create new
  const result = await client.query(`
    INSERT INTO organizations (name, website, type)
    VALUES ($1, $2, 'company')
    RETURNING id
  `, [orgName, website]);

  stats.newOrgs++;
  console.log(`   ✓ Created org: ${orgName}`);
  return result.rows[0].id;
}

// Add role
async function addPersonRole(client, personId, conferenceId, roleType, orgId = null) {
  if (!personId) return;

  await client.query(`
    INSERT INTO person_roles (person_id, conference_id, role_type, organization_id, is_active)
    VALUES ($1, $2, $3, $4, true)
    ON CONFLICT DO NOTHING
  `, [personId, conferenceId, roleType, orgId]);
}

// Import abstracts
async function importAbstracts(client, data, conferenceId, stats) {
  console.log(`\n📄 Importing abstracts (${data.rows.length} rows)...`);
  console.log(`   Columns: ${data.headers.join(', ')}`);

  for (const row of data.rows) {
    try {
      // Try multiple column name variations
      const email = row.Email || row.email || row['Email Address'] || row['E-mail'] || row['email address'];
      const firstName = row['First Name'] || row.FirstName || row['first name'] || row.first_name;
      const lastName = row['Last Name'] || row.LastName || row['last name'] || row.last_name;
      const org = row.Organization || row.Affiliation || row.Institution || row.organization;
      const country = row.Country || row.country;

      const personId = await getOrCreatePerson(client, email, firstName, lastName, org, country, stats);

      if (personId) {
        await addPersonRole(client, personId, conferenceId, 'presenter');
        stats.abstractsImported++;
      }
    } catch (error) {
      console.error(`   ⚠️  Error:`, error.message);
      stats.errors++;
    }
  }

  console.log(`   ✓ Imported ${stats.abstractsImported} abstract submitters`);
}

// Import contacts
async function importContacts(client, data, conferenceId, stats) {
  console.log(`\n📧 Importing contacts (${data.rows.length} rows)...`);
  console.log(`   Columns: ${data.headers.join(', ')}`);

  for (const row of data.rows) {
    try {
      const email = row.Email || row.email || row['Email Address'];
      const name = row.Name || row.name || row['Full Name'];
      const nameParts = name ? name.split(' ') : ['', ''];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      const org = row.Organization || row.organization || row.Company;
      const country = row.Country || row.country;

      const personId = await getOrCreatePerson(client, email, firstName, lastName, org, country, stats);

      if (personId) {
        await addPersonRole(client, personId, conferenceId, 'attendee');
        stats.contactsImported++;
      }
    } catch (error) {
      console.error(`   ⚠️  Error:`, error.message);
      stats.errors++;
    }
  }

  console.log(`   ✓ Imported ${stats.contactsImported} contacts`);
}

// Import sponsors
async function importSponsors(client, data, conferenceId, stats) {
  console.log(`\n🏢 Importing sponsors/exhibitors (${data.rows.length} rows)...`);
  console.log(`   Columns: ${data.headers.join(', ')}`);

  for (const row of data.rows) {
    try {
      const orgName = row.Organization || row['Organization Name'] || row.Company || row.Sponsor;
      const website = row.Website || row.website || row.URL;
      const contactEmail = row['Contact Email'] || row.Email || row['contact email'];
      const contactName = row['Contact Name'] || row['contact name'] || row.Contact;

      if (!orgName) continue;

      const orgId = await getOrCreateOrg(client, orgName, website, stats);

      if (orgId) {
        // Add org role
        await client.query(`
          INSERT INTO organization_roles (organization_id, conference_id, role_type, is_active)
          VALUES ($1, $2, 'sponsor', true)
          ON CONFLICT DO NOTHING
        `, [orgId, conferenceId]);

        stats.sponsorsImported++;

        // Add contact if exists
        if (contactEmail) {
          const nameParts = contactName ? contactName.split(' ') : ['', ''];
          const personId = await getOrCreatePerson(
            client, contactEmail, nameParts[0], nameParts.slice(1).join(' '), orgName, null, stats
          );

          if (personId) {
            await addPersonRole(client, personId, conferenceId, 'sponsor_contact', orgId);
          }
        }
      }
    } catch (error) {
      console.error(`   ⚠️  Error:`, error.message);
      stats.errors++;
    }
  }

  console.log(`   ✓ Imported ${stats.sponsorsImported} sponsors/exhibitors`);
}

// Import master database
async function importMasterDatabase(client, data, stats) {
  console.log(`\n📊 Importing master database (${data.rows.length} rows)...`);
  console.log(`   Columns: ${data.headers.join(', ')}`);

  for (const row of data.rows) {
    try {
      const email = row.Email || row.email || row['Email Address'];
      const firstName = row['First Name'] || row.FirstName || row.first_name;
      const lastName = row['Last Name'] || row.LastName || row.last_name;
      const org = row.Organization || row.Affiliation || row.Institution;
      const country = row.Country || row.country;

      const personId = await getOrCreatePerson(client, email, firstName, lastName, org, country, stats);

      if (personId) {
        stats.masterDbImported++;
      }
    } catch (error) {
      console.error(`   ⚠️  Error:`, error.message);
      stats.errors++;
    }
  }

  console.log(`   ✓ Imported ${stats.masterDbImported} people from master database`);
}

// Main import
async function importAllData() {
  const client = await pool.connect();

  try {
    console.log('📊 Starting CSV import...\n');

    const stats = {
      newPeople: 0,
      existingPeople: 0,
      newOrgs: 0,
      existingOrgs: 0,
      abstractsImported: 0,
      contactsImported: 0,
      sponsorsImported: 0,
      masterDbImported: 0,
      errors: 0
    };

    // Get or create ICSR2024
    let confResult = await client.query(`
      SELECT id FROM conference_editions WHERE year = 2024 AND name LIKE '%ICSR%'
    `);

    let icsr2024Id;
    if (confResult.rows.length === 0) {
      const newConf = await client.query(`
        INSERT INTO conference_editions (
          year, name, start_date, end_date, location, is_active,
          registration_open_date, registration_close_date, early_bird_deadline, abstract_submission_deadline
        ) VALUES (
          2024, 'ICSR 2024', '2024-06-15', '2024-06-18', 'TBD', false,
          '2023-12-01', '2024-06-01', '2024-03-01', '2024-04-15'
        )
        RETURNING id
      `);
      icsr2024Id = newConf.rows[0].id;
      console.log('✅ Created ICSR2024 conference\n');
    } else {
      icsr2024Id = confResult.rows[0].id;
      console.log('✅ Found ICSR2024 conference\n');
    }

    // Import each file
    for (const [key, filename] of Object.entries(CSV_FILES)) {
      const filePath = path.join(DATA_DIR, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipping ${filename} (file not found)`);
        continue;
      }

      try {
        const data = parseCSV(filePath);

        if (key === 'abstracts') {
          await importAbstracts(client, data, icsr2024Id, stats);
        } else if (key === 'contacts') {
          await importContacts(client, data, icsr2024Id, stats);
        } else if (key === 'sponsorsExhibitors' || key === 'sponsors') {
          await importSponsors(client, data, icsr2024Id, stats);
        } else if (key === 'masterDb') {
          await importMasterDatabase(client, data, stats);
        }
      } catch (error) {
        console.error(`❌ Error importing ${filename}:`, error.message);
        stats.errors++;
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ New people created:        ${stats.newPeople}`);
    console.log(`✓  Existing people found:     ${stats.existingPeople}`);
    console.log(`✅ New organizations created: ${stats.newOrgs}`);
    console.log(`✓  Existing orgs found:       ${stats.existingOrgs}`);
    console.log('');
    console.log(`📄 Abstract submitters:       ${stats.abstractsImported}`);
    console.log(`📧 Contact inquiries:         ${stats.contactsImported}`);
    console.log(`🏢 Sponsors/Exhibitors:       ${stats.sponsorsImported}`);
    console.log(`📊 Master database entries:   ${stats.masterDbImported}`);
    console.log('');
    console.log(`❌ Errors encountered:        ${stats.errors}`);
    console.log('='.repeat(60));

    console.log('\n✅ Import completed successfully!');

  } catch (error) {
    console.error('\n❌ Import failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run
importAllData().catch(console.error);
