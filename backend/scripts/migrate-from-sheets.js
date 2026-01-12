#!/usr/bin/env node
/**
 * ISRS Data Migration Script
 * Migrates data from Google Sheets to PostgreSQL
 */

require('dotenv').config();
const { google } = require('googleapis');
const { query, transaction } = require('../src/config/database');

// Google Sheets configuration
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

// Sheet names from your Google Spreadsheet
const SHEETS = {
  CONTACTS: '01_MASTER_CONTACTS',
  ORGANIZATIONS: '02_ORGANIZATIONS',
  BOARD_VOTES: 'Board Votes',
  VOTE_DETAILS: 'Vote Details', // May not exist
  CONFERENCES: '07_ICSR_CONFERENCES',
  REGISTRATIONS: '03_ICSR2024_REGISTRANTS',
  SPONSORS: '04_ICSR2024_SPONSORS',
  ABSTRACTS: '06_ICSR2024_ABSTRACTS',
  FUNDING: '08_FUNDING_PROSPECTS'
};

/**
 * Initialize Google Sheets API
 */
async function getGoogleSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      type: 'service_account',
      project_id: 'isrs-database-prod',
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    },
    scopes: SCOPES,
  });

  const authClient = await auth.getClient();
  return google.sheets({ version: 'v4', auth: authClient });
}

/**
 * Read data from a Google Sheet
 */
async function readSheet(sheets, sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:Z`, // Read all columns
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      console.log(`  ⚠️  Sheet "${sheetName}" is empty`);
      return [];
    }

    // First row is headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || null;
      });
      return obj;
    });

    console.log(`  ✅ Read ${data.length} rows from "${sheetName}"`);
    return data;
  } catch (error) {
    if (error.message.includes('Unable to parse range')) {
      console.log(`  ℹ️  Sheet "${sheetName}" not found, skipping...`);
      return [];
    }
    throw error;
  }
}

/**
 * Migrate Organizations
 */
async function migrateOrganizations(sheets) {
  console.log('\n📊 Migrating Organizations...');

  const data = await readSheet(sheets, SHEETS.ORGANIZATIONS);
  if (data.length === 0) return new Map();

  const orgMap = new Map(); // Map old IDs to new UUIDs
  let migrated = 0;
  let skipped = 0;

  for (const row of data) {
    try {
      // Get organization name - in this sheet, Org_ID contains the name!
      const orgName = row['Org_ID'] || row['Organization_Name'] || row['Organization Name'] || row['Name'];

      // Skip rows without organization name
      if (!orgName || orgName.trim() === '') {
        skipped++;
        continue;
      }

      // Truncate name if too long (DB limit is 255 chars)
      const cleanName = orgName.trim().substring(0, 255);

      const result = await query(`
        INSERT INTO organizations (
          name, type, country, website, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (name) DO UPDATE SET
          type = EXCLUDED.type,
          website = EXCLUDED.website,
          updated_at = NOW()
        RETURNING id
      `, [
        cleanName,
        row['Org_Type'] || row['Type'] || row['Organization Type'] || 'Other',
        row['Country'],
        row['Website'] || row['URL'],
        row['Notes'],
      ]);

      const newId = result.rows[0].id;
      const oldId = row['Org_ID'];
      if (oldId) {
        orgMap.set(oldId, newId);
      }
      migrated++;
    } catch (error) {
      console.error(`  ❌ Error migrating organization: ${row['Org_ID'] || 'unknown'}`, error.message);
      skipped++;
    }
  }

  console.log(`  ✅ Migrated ${migrated} organizations (${skipped} skipped)`);
  return orgMap;
}

/**
 * Migrate Contacts
 */
async function migrateContacts(sheets, orgMap) {
  console.log('\n👥 Migrating Contacts...');

  const data = await readSheet(sheets, SHEETS.CONTACTS);
  if (data.length === 0) return;

  let migrated = 0;
  let skipped = 0;

  for (const row of data) {
    try {
      // Skip if no email
      const email = row['Email'] || row['Email Address'];
      if (!email) {
        skipped++;
        continue;
      }

      // Map organization ID
      const oldOrgId = row['Organization ID'] || row['Org ID'];
      const organizationId = oldOrgId ? orgMap.get(oldOrgId) : null;

      await query(`
        INSERT INTO contacts (
          email, full_name, first_name, last_name,
          organization_id, role, title, phone, country,
          state_province, city, expertise, interests, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (email) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          organization_id = EXCLUDED.organization_id,
          role = EXCLUDED.role,
          title = EXCLUDED.title,
          updated_at = NOW()
      `, [
        email,
        row['Full Name'] || row['Name'],
        row['First Name'],
        row['Last Name'],
        organizationId,
        row['Role'] || row['Position'],
        row['Title'] || row['Job Title'],
        row['Phone'] || row['Phone Number'],
        row['Country'],
        row['State'] || row['State/Province'],
        row['City'],
        row['Expertise'] ? row['Expertise'].split(',').map(t => t.trim()) : null,
        row['Research Interests'] || row['Interests'] ? (row['Research Interests'] || row['Interests']).split(',').map(t => t.trim()) : null,
        row['Notes'],
      ]);

      migrated++;

      if (migrated % 100 === 0) {
        console.log(`  ⏳ Migrated ${migrated} contacts...`);
      }
    } catch (error) {
      console.error(`  ❌ Error migrating contact: ${row['Email']}`, error.message);
      skipped++;
    }
  }

  console.log(`  ✅ Migrated ${migrated} contacts (${skipped} skipped)`);
}

/**
 * Migrate Board Votes
 */
async function migrateBoardVotes(sheets) {
  console.log('\n🗳️  Migrating Board Votes...');

  const votesData = await readSheet(sheets, SHEETS.BOARD_VOTES);
  const detailsData = await readSheet(sheets, SHEETS.VOTE_DETAILS);

  if (votesData.length === 0) {
    console.log('  ℹ️  No board votes to migrate');
    return;
  }

  let migrated = 0;

  for (const vote of votesData) {
    try {
      const voteId = vote['Vote ID'] || `VOTE_${Date.now()}_${migrated}`;

      // Insert main vote record (skip if already exists)
      const result = await query(`
        INSERT INTO board_votes (
          vote_id, motion_title, vote_date, vote_method,
          result, yes_count, no_count, abstain_count,
          total_votes, quorum_met, notes, email_content,
          processed_by, processed_method, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
        ON CONFLICT (vote_id) DO UPDATE SET
          motion_title = EXCLUDED.motion_title,
          updated_at = NOW()
        RETURNING id
      `, [
        voteId,
        vote['Motion'] || vote['Motion Title'],
        vote['Date'] || new Date(),
        vote['Method'] || 'Email',
        vote['Result'] || 'unknown',
        parseInt(vote['Yes Count']) || 0,
        parseInt(vote['No Count']) || 0,
        parseInt(vote['Abstain Count']) || 0,
        parseInt(vote['Total Votes']) || 0,
        vote['Quorum Met'] === 'TRUE' || vote['Quorum Met'] === 'Yes',
        vote['Notes'],
        vote['Email Content'],
        'migration_script',
        'manual',
      ]);

      const dbVoteId = result.rows[0].id;

      // Insert vote details
      const voteDetails = detailsData.filter(d => d['Vote ID'] === voteId);
      for (const detail of voteDetails) {
        await query(`
          INSERT INTO board_vote_details (
            vote_id, board_member_name, vote, notes
          ) VALUES ($1, $2, $3, $4)
        `, [
          dbVoteId,
          detail['Board Member'] || detail['Name'],
          detail['Vote'] || 'not_recorded',
          detail['Notes'],
        ]);
      }

      migrated++;
    } catch (error) {
      console.error(`  ❌ Error migrating vote: ${vote['Motion']}`, error.message);
    }
  }

  console.log(`  ✅ Migrated ${migrated} board votes`);
}

/**
 * Migrate Conferences
 */
async function migrateConferences(sheets) {
  console.log('\n🎤 Migrating Conferences...');

  const data = await readSheet(sheets, SHEETS.CONFERENCES);
  if (data.length === 0) {
    console.log('  ℹ️  No conferences to migrate (using defaults)');
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const conf of data) {
    try {
      // Parse dates from "Sep 15-18, 2024" or similar format
      let start_date = null;
      let end_date = null;
      const datesStr = conf['Dates'];
      const year = parseInt(conf['Year']);

      if (datesStr && year) {
        // Try to parse date range like "Sep 15-18, 2024" or "October 4-8, 2026"
        const dateMatch = datesStr.match(/(\w+)\s+(\d+)-(\d+)/);
        if (dateMatch) {
          const [, month, startDay, endDay] = dateMatch;
          start_date = `${year}-${getMonthNumber(month)}-${startDay.padStart(2, '0')}`;
          end_date = `${year}-${getMonthNumber(month)}-${endDay.padStart(2, '0')}`;
        }
      }

      // Conference name - use Year + Location if no explicit name
      const name = conf['Name'] || `ICSR ${year}`;

      await query(`
        INSERT INTO conferences (
          name, year, location, start_date, end_date,
          website, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT DO NOTHING
      `, [
        name,
        year,
        conf['Location'],
        start_date,
        end_date,
        conf['Website'],
        conf['Notes'],
      ]);

      migrated++;
    } catch (error) {
      console.error(`  ❌ Error migrating conference: ${conf['Year']}`, error.message);
      skipped++;
    }
  }

  console.log(`  ✅ Migrated ${migrated} conferences (${skipped} skipped)`);
}

/**
 * Helper function to convert month name to number
 */
function getMonthNumber(monthName) {
  const months = {
    'jan': '01', 'january': '01',
    'feb': '02', 'february': '02',
    'mar': '03', 'march': '03',
    'apr': '04', 'april': '04',
    'may': '05',
    'jun': '06', 'june': '06',
    'jul': '07', 'july': '07',
    'aug': '08', 'august': '08',
    'sep': '09', 'september': '09',
    'oct': '10', 'october': '10',
    'nov': '11', 'november': '11',
    'dec': '12', 'december': '12'
  };
  return months[monthName.toLowerCase()] || '01';
}

/**
 * Migrate Funding Prospects
 */
async function migrateFunding(sheets) {
  console.log('\n💰 Migrating Funding Prospects...');

  const data = await readSheet(sheets, SHEETS.FUNDING);
  if (data.length === 0) {
    console.log('  ℹ️  No funding prospects to migrate');
    return;
  }

  let migrated = 0;
  let skipped = 0;

  for (const funding of data) {
    try {
      const orgName = funding['Organization'] || funding['Funder Name'];

      // Skip if no organization name
      if (!orgName || orgName.trim() === '') {
        skipped++;
        continue;
      }

      // Look up organization ID by name
      const orgResult = await query(`
        SELECT id FROM organizations WHERE name = $1
      `, [orgName.trim()]);

      let organization_id = null;
      if (orgResult.rows.length > 0) {
        organization_id = orgResult.rows[0].id;
      } else {
        // Organization doesn't exist, create it
        const newOrgResult = await query(`
          INSERT INTO organizations (name, created_at)
          VALUES ($1, NOW())
          RETURNING id
        `, [orgName.trim()]);
        organization_id = newOrgResult.rows[0].id;
      }

      // Look up contact by email if provided
      let contact_id = null;
      const contactEmail = funding['Contact Email'];
      if (contactEmail) {
        const contactResult = await query(`
          SELECT id FROM contacts WHERE email = $1
        `, [contactEmail.trim()]);
        if (contactResult.rows.length > 0) {
          contact_id = contactResult.rows[0].id;
        }
      }

      // Map status values
      const statusMap = {
        'pipeline': 'pipeline',
        'contacted': 'contacted',
        'proposal submitted': 'proposal_submitted',
        'committed': 'committed',
        'received': 'received',
        'rejected': 'rejected'
      };
      const status = statusMap[(funding['Status'] || 'pipeline').toLowerCase()] || 'pipeline';

      await query(`
        INSERT INTO funding_prospects (
          organization_id, contact_id,
          amount_target, amount_received, status,
          proposal_submitted_date, decision_date, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        organization_id,
        contact_id,
        parseFloat(funding['Target Amount'] || funding['Amount Target']) || null,
        parseFloat(funding['Amount Received']) || null,
        status,
        funding['Proposal Date'] || funding['Proposal Submitted Date'],
        funding['Decision Date'],
        funding['Notes'],
      ]);

      migrated++;
    } catch (error) {
      console.error(`  ❌ Error migrating funding: ${funding['Organization']}`, error.message);
      skipped++;
    }
  }

  console.log(`  ✅ Migrated ${migrated} funding prospects (${skipped} skipped)`);
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 ISRS Data Migration - Google Sheets → PostgreSQL\n');
  console.log('='.repeat(60));

  try {
    // Initialize Google Sheets
    console.log('\n🔐 Connecting to Google Sheets...');
    const sheets = await getGoogleSheetsClient();
    console.log('  ✅ Connected to Google Sheets');

    // Test database connection
    console.log('\n🔐 Testing PostgreSQL connection...');
    const dbTest = await query('SELECT NOW() as time');
    console.log(`  ✅ Connected to PostgreSQL at ${dbTest.rows[0].time}`);

    // Run migrations in order
    const orgMap = await migrateOrganizations(sheets);
    await migrateContacts(sheets, orgMap);
    await migrateBoardVotes(sheets);
    await migrateConferences(sheets);
    await migrateFunding(sheets);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ Migration Complete!\n');

    // Get final counts
    const counts = await query(`
      SELECT
        (SELECT COUNT(*) FROM contacts) as contacts,
        (SELECT COUNT(*) FROM organizations) as organizations,
        (SELECT COUNT(*) FROM board_votes) as votes,
        (SELECT COUNT(*) FROM conferences) as conferences,
        (SELECT COUNT(*) FROM funding_prospects) as funding
    `);

    const stats = counts.rows[0];
    console.log('📊 Final Database Statistics:');
    console.log(`  • Contacts: ${stats.contacts}`);
    console.log(`  • Organizations: ${stats.organizations}`);
    console.log(`  • Board Votes: ${stats.votes}`);
    console.log(`  • Conferences: ${stats.conferences}`);
    console.log(`  • Funding Prospects: ${stats.funding}`);
    console.log('');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✅ Migration script completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { runMigration };
