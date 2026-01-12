/**
 * Import Data from Google Sheets
 * Creates profiles for all people, organizations, and links relationships
 */

const { Pool } = require('pg');
const https = require('https');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false
});

// Google Sheets to import
const SHEETS = {
  abstracts: {
    id: '1r5kk4wGLxUgu6CFzHKkRwTW03RLrII8okJC1Yorj5Wg',
    gid: '773870573',
    name: 'ICSR2024 Abstract Submissions'
  },
  contacts: {
    id: '1ui-PUOtuTWaubPTb621DD13buE12c96T1b8GxeMBXiE',
    gid: '1981106345',
    name: 'ICSR2024 Contact Forms'
  },
  sponsorsExhibitors: {
    id: '1e0xB9EIxZ6zkDeJm2EHsLcKkPrN3OX1-23O_Kw1QN_0',
    gid: '1317895541',
    name: 'Sponsor/Exhibitor Info'
  },
  sponsors: {
    id: '1gn7Q43Qj9pKhGQvGOYWB40Hk4Te2KQ70DDbYnQk_SJQ',
    gid: '195309022',
    name: 'Sponsors'
  },
  masterDb: {
    id: '1o1dG8fBCIKb1_pNAqZmlmOhQHjNIIwwJzUT5s_BQ3OA',
    gid: '0',
    name: 'ISRS Master Database'
  }
};

// Fetch CSV from Google Sheets
async function fetchGoogleSheet(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(parseCSV(data));
        } else {
          reject(new Error(`Failed to fetch sheet: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

// Simple CSV parser
function parseCSV(csv) {
  const lines = csv.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return { headers, rows };
}

// Normalize email for deduplication
function normalizeEmail(email) {
  if (!email) return null;
  return email.toLowerCase().trim();
}

// Normalize organization name for deduplication
function normalizeOrgName(name) {
  if (!name) return null;
  return name.trim()
    .replace(/\s+/g, ' ')
    .replace(/\b(Inc|LLC|Ltd|Corp|Corporation|Company|Co)\b\.?/gi, '')
    .trim();
}

// Get or create person profile
async function getOrCreatePerson(client, email, firstName, lastName, organization, country) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    console.warn(`⚠️  Skipping person with no email`);
    return null;
  }

  // Check if person exists
  const existing = await client.query(
    'SELECT id FROM attendee_profiles WHERE user_email = $1',
    [normalizedEmail]
  );

  if (existing.rows.length > 0) {
    console.log(`   ✓ Found existing profile: ${normalizedEmail}`);
    return existing.rows[0].id;
  }

  // Create new profile
  const result = await client.query(`
    INSERT INTO attendee_profiles (
      user_email, first_name, last_name, organization_name, country
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `, [normalizedEmail, firstName || '', lastName || '', organization || '', country || '']);

  console.log(`   ✓ Created profile: ${normalizedEmail}`);
  return result.rows[0].id;
}

// Get or create organization
async function getOrCreateOrg(client, orgName, website = null) {
  const normalized = normalizeOrgName(orgName);

  if (!normalized) return null;

  // Check if org exists (fuzzy match)
  const existing = await client.query(`
    SELECT id FROM organizations
    WHERE LOWER(REPLACE(name, ' ', '')) LIKE LOWER(REPLACE($1, ' ', ''))
  `, [normalized]);

  if (existing.rows.length > 0) {
    console.log(`   ✓ Found existing org: ${orgName}`);
    return existing.rows[0].id;
  }

  // Create new org
  const result = await client.query(`
    INSERT INTO organizations (name, website, type)
    VALUES ($1, $2, 'company')
    RETURNING id
  `, [orgName, website]);

  console.log(`   ✓ Created org: ${orgName}`);
  return result.rows[0].id;
}

// Add person role
async function addPersonRole(client, personId, conferenceId, roleType, orgId = null) {
  if (!personId) return;

  await client.query(`
    INSERT INTO person_roles (person_id, conference_id, role_type, organization_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT DO NOTHING
  `, [personId, conferenceId, roleType, orgId]);
}

// Main import function
async function importAllData() {
  const client = await pool.connect();

  try {
    console.log('📊 Starting data import from Google Sheets...\n');

    // Get ICSR2024 conference ID
    const confResult = await client.query(`
      SELECT id FROM conference_editions WHERE year = 2024 AND name LIKE '%ICSR%'
    `);

    let icsr2024Id = null;
    if (confResult.rows.length === 0) {
      // Create ICSR2024 conference
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

    // Import each sheet
    for (const [key, sheet] of Object.entries(SHEETS)) {
      console.log(`\n📥 Importing: ${sheet.name}`);
      console.log(`   Sheet ID: ${sheet.id}, GID: ${sheet.gid}`);

      try {
        const data = await fetchGoogleSheet(sheet.id, sheet.gid);
        console.log(`   ✓ Fetched ${data.rows.length} rows`);
        console.log(`   ✓ Columns: ${data.headers.join(', ')}`);

        // Process based on sheet type
        if (key === 'abstracts') {
          await importAbstracts(client, data, icsr2024Id);
        } else if (key === 'contacts') {
          await importContacts(client, data, icsr2024Id);
        } else if (key === 'sponsorsExhibitors' || key === 'sponsors') {
          await importSponsors(client, data, icsr2024Id);
        } else if (key === 'masterDb') {
          await importMasterDatabase(client, data);
        }

      } catch (error) {
        console.error(`   ❌ Error importing ${sheet.name}:`, error.message);
      }
    }

    console.log('\n✅ Import completed!');

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// Import abstracts
async function importAbstracts(client, data, conferenceId) {
  console.log('   Importing abstract submissions...');
  let imported = 0;

  for (const row of data.rows) {
    try {
      // Create person profile
      const personId = await getOrCreatePerson(
        client,
        row.Email || row.email || row['Email Address'],
        row['First Name'] || row.FirstName,
        row['Last Name'] || row.LastName,
        row.Organization || row.Affiliation,
        row.Country
      );

      if (!personId) continue;

      // Add presenter role
      await addPersonRole(client, personId, conferenceId, 'presenter');

      imported++;
    } catch (error) {
      console.error(`   ⚠️  Error importing row:`, error.message);
    }
  }

  console.log(`   ✓ Imported ${imported} abstract submitters`);
}

// Import contacts
async function importContacts(client, data, conferenceId) {
  console.log('   Importing contact inquiries...');
  let imported = 0;

  for (const row of data.rows) {
    try {
      const personId = await getOrCreatePerson(
        client,
        row.Email || row.email,
        row.Name?.split(' ')[0],
        row.Name?.split(' ').slice(1).join(' '),
        row.Organization,
        row.Country
      );

      if (personId) {
        await addPersonRole(client, personId, conferenceId, 'attendee');
        imported++;
      }
    } catch (error) {
      console.error(`   ⚠️  Error importing row:`, error.message);
    }
  }

  console.log(`   ✓ Imported ${imported} contacts`);
}

// Import sponsors
async function importSponsors(client, data, conferenceId) {
  console.log('   Importing sponsors/exhibitors...');
  let imported = 0;

  for (const row of data.rows) {
    try {
      const orgId = await getOrCreateOrg(
        client,
        row.Organization || row['Organization Name'] || row.Company,
        row.Website
      );

      if (!orgId) continue;

      // Create organization role
      await client.query(`
        INSERT INTO organization_roles (organization_id, conference_id, role_type)
        VALUES ($1, $2, 'sponsor')
        ON CONFLICT DO NOTHING
      `, [orgId, conferenceId]);

      // Create contact profile if exists
      if (row['Contact Email'] || row.Email) {
        const personId = await getOrCreatePerson(
          client,
          row['Contact Email'] || row.Email,
          row['Contact Name']?.split(' ')[0],
          row['Contact Name']?.split(' ').slice(1).join(' '),
          row.Organization || row['Organization Name'],
          null
        );

        if (personId) {
          await addPersonRole(client, personId, conferenceId, 'sponsor_contact', orgId);
        }
      }

      imported++;
    } catch (error) {
      console.error(`   ⚠️  Error importing row:`, error.message);
    }
  }

  console.log(`   ✓ Imported ${imported} sponsors/exhibitors`);
}

// Import master database
async function importMasterDatabase(client, data) {
  console.log('   Importing master database...');
  let imported = 0;

  for (const row of data.rows) {
    try {
      const personId = await getOrCreatePerson(
        client,
        row.Email || row['Email Address'],
        row['First Name'] || row.FirstName,
        row['Last Name'] || row.LastName,
        row.Organization || row.Affiliation || row.Institution,
        row.Country
      );

      if (personId) imported++;
    } catch (error) {
      console.error(`   ⚠️  Error importing row:`, error.message);
    }
  }

  console.log(`   ✓ Imported ${imported} people from master database`);
}

// Run import
importAllData();
