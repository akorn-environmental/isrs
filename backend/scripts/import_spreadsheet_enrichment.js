#!/usr/bin/env node
/**
 * Import enrichment data from Google Spreadsheet CSV
 * Updates existing contacts with additional fields like tags, linkedin, engagement_score, etc.
 */

require('dotenv').config();
const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
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

function parseTags(tagString) {
  if (!tagString) return null;
  const tags = tagString.split(',').map(t => t.trim()).filter(Boolean);
  return tags.length > 0 ? tags : null;
}

async function main() {
  const csvPath = process.argv[2] || '/tmp/isrs_contacts.csv';

  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found:', csvPath);
    console.log('Download it first with:');
    console.log('curl -sL "https://docs.google.com/spreadsheets/d/1o1dG8fBCIKb1_pNAqZmlmOhQHjNIIwwJzUT5s_BQ3OA/export?format=csv" -o /tmp/isrs_contacts.csv');
    process.exit(1);
  }

  console.log('📊 Loading spreadsheet data from:', csvPath);
  const csv = fs.readFileSync(csvPath, 'utf-8');
  const contacts = parseCSV(csv);
  console.log('Found', contacts.length, 'contacts in spreadsheet\n');

  let updated = 0;
  let errors = 0;
  let skipped = 0;

  console.log('🔄 Importing enrichment data...\n');

  for (const contact of contacts) {
    const email = contact.Email?.toLowerCase().trim();
    if (!email || !email.includes('@')) {
      skipped++;
      continue;
    }

    try {
      // Build update query with all the enrichment fields
      const tags = parseTags(contact.Tags);
      const engagementScore = contact.Engagement_Score ? parseInt(contact.Engagement_Score) : null;
      const isInternational = contact.Is_International === 'Yes' || contact.Is_International === 'true';
      const emailValid = contact.Email_Valid !== 'No' && contact.Email_Valid !== 'false';
      const profileComplete = contact.Profile_Complete === 'Yes' || contact.Profile_Complete === 'true';

      const result = await pool.query(`
        UPDATE contacts SET
          contact_type = COALESCE($2, contact_type),
          tags = COALESCE($3, tags),
          linkedin = COALESCE(NULLIF($4, ''), linkedin),
          website = COALESCE(NULLIF($5, ''), website),
          status = COALESCE(NULLIF($6, ''), status),
          is_international = $7,
          conference_role = COALESCE(NULLIF($8, ''), conference_role),
          engagement_score = COALESCE($9, engagement_score),
          priority_level = COALESCE(NULLIF($10, ''), priority_level),
          research_interests = COALESCE(NULLIF($11, ''), research_interests),
          source_file = COALESCE(NULLIF($12, ''), source_file),
          import_batch = COALESCE(NULLIF($13, ''), import_batch),
          email_valid = $14,
          profile_complete = $15,
          job_title = COALESCE(NULLIF($16, ''), job_title),
          updated_at = NOW()
        WHERE LOWER(email) = $1
        RETURNING id
      `, [
        email,
        contact.Contact_Type || null,
        tags,
        contact.LinkedIn || '',
        contact.Website || '',
        contact.Status || '',
        isInternational,
        contact.Conference_Role || '',
        engagementScore,
        contact.Priority_Level || '',
        contact.Research_Interests || '',
        contact.Source_File || '',
        contact.Import_Batch || '',
        emailValid,
        profileComplete,
        contact.Job_Title || ''
      ]);

      if (result.rowCount > 0) {
        updated++;
        if (updated % 500 === 0) {
          console.log('  Progress:', updated, 'contacts updated...');
        }
      } else {
        skipped++;
      }
    } catch (error) {
      errors++;
      if (errors <= 5) {
        console.error('  Error updating', email + ':', error.message);
      }
    }
  }

  console.log('\n✅ Import completed!');
  console.log('  Updated:', updated);
  console.log('  Skipped:', skipped);
  console.log('  Errors:', errors);

  // Show sample of updated data
  console.log('\n📋 Sample of imported data:');
  const sampleResult = await pool.query(`
    SELECT email, contact_type, tags, engagement_score, priority_level, is_international
    FROM contacts
    WHERE tags IS NOT NULL
    LIMIT 5
  `);
  sampleResult.rows.forEach(r => {
    console.log('  ' + r.email + ':');
    console.log('    Type:', r.contact_type, '| Score:', r.engagement_score, '| Priority:', r.priority_level);
    console.log('    Tags:', (r.tags || []).slice(0, 5).join(', '));
  });

  // Show stats
  console.log('\n📈 Data Quality Stats:');
  const statsResult = await pool.query(`
    SELECT
      COUNT(*) as total,
      COUNT(contact_type) as with_type,
      COUNT(tags) as with_tags,
      COUNT(engagement_score) as with_score,
      COUNT(linkedin) as with_linkedin,
      COUNT(CASE WHEN is_international THEN 1 END) as international
    FROM contacts
  `);
  const stats = statsResult.rows[0];
  console.log('  Total contacts:', stats.total);
  console.log('  With contact type:', stats.with_type);
  console.log('  With tags:', stats.with_tags);
  console.log('  With engagement score:', stats.with_score);
  console.log('  With LinkedIn:', stats.with_linkedin);
  console.log('  International:', stats.international);

  await pool.end();
}

main().catch(console.error);
