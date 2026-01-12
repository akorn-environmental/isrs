#!/usr/bin/env node

/**
 * Import ICSR2024 Data from Google Sheets
 * Imports contacts, organizations, and creates funding prospects
 */

require('dotenv').config();
const { getSpreadsheetInfo, getSheetValues } = require('../src/config/googleSheets');
const { Client } = require('pg');

async function importFromGoogleSheets() {
  console.log('📊 Starting Google Sheets import...\n');

  // Create database client with SSL
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');
    // Get spreadsheet info
    console.log('🔍 Fetching spreadsheet metadata...');
    const spreadsheet = await getSpreadsheetInfo();

    console.log(`\n✅ Found spreadsheet: ${spreadsheet.properties.title}`);
    console.log(`📋 Available sheets (${spreadsheet.sheets.length}):`);

    spreadsheet.sheets.forEach((sheet, index) => {
      console.log(`   ${index + 1}. ${sheet.properties.title} (${sheet.properties.gridProperties.rowCount} rows)`);
    });

    // Find the sheets we want to import
    const sheetNames = spreadsheet.sheets.map(s => s.properties.title);

    // Common sheet names to look for
    const contactSheets = sheetNames.filter(name =>
      name.toLowerCase().includes('contact') ||
      name.toLowerCase().includes('attendee') ||
      name.toLowerCase().includes('participant') ||
      name.toLowerCase().includes('registration') ||
      name.toLowerCase().includes('icsr2024')
    );

    const orgSheets = sheetNames.filter(name =>
      name.toLowerCase().includes('organization') ||
      name.toLowerCase().includes('institution') ||
      name.toLowerCase().includes('affiliation')
    );

    const fundingSheets = sheetNames.filter(name =>
      name.toLowerCase().includes('fund') ||
      name.toLowerCase().includes('sponsor') ||
      name.toLowerCase().includes('donor')
    );

    console.log('\n🎯 Identified relevant sheets:');
    console.log(`   Contacts/Attendees: ${contactSheets.join(', ') || 'None'}`);
    console.log(`   Organizations: ${orgSheets.join(', ') || 'None'}`);
    console.log(`   Funding: ${fundingSheets.join(', ') || 'None'}`);

    const stats = {
      contacts: { created: 0, updated: 0, failed: 0 },
      organizations: { created: 0, updated: 0, failed: 0 },
      funding: { created: 0, updated: 0, failed: 0 }
    };

    // Import contacts from identified sheets
    for (const sheetName of contactSheets) {
      console.log(`\n\n📥 Importing from "${sheetName}"...`);
      console.log('─'.repeat(60));

      const values = await getSheetValues(sheetName);

      if (!values || values.length === 0) {
        console.log('   ⚠️  Empty sheet, skipping...');
        continue;
      }

      const headers = values[0].map(h => h.toLowerCase().trim());
      const rows = values.slice(1);

      console.log(`   Found ${rows.length} rows with ${headers.length} columns`);
      console.log(`   Headers: ${headers.slice(0, 5).join(', ')}${headers.length > 5 ? '...' : ''}`);

      // Process each row
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        // Skip empty rows
        if (row.length === 0 || row.every(cell => !cell)) {
          continue;
        }

        try {
          // Build contact object
          const contact = {};

          headers.forEach((header, index) => {
            const value = row[index]?.toString().trim();
            if (!value) return;

            // Map common column names
            if (header.includes('email') || header === 'e-mail') {
              contact.email = value;
            } else if (header.includes('first') && header.includes('name')) {
              contact.first_name = value;
            } else if (header.includes('last') && header.includes('name')) {
              contact.last_name = value;
            } else if (header.includes('full') && header.includes('name') || header === 'name') {
              contact.full_name = value;
            } else if (header.includes('organization') || header.includes('institution') || header.includes('affiliation')) {
              contact.organization = value;
            } else if (header.includes('title') || header.includes('position')) {
              contact.title = value;
            } else if (header.includes('phone') || header.includes('tel')) {
              contact.phone = value;
            } else if (header.includes('country')) {
              contact.country = value;
            } else if (header.includes('city')) {
              contact.city = value;
            } else if (header.includes('state') || header.includes('province')) {
              contact.state_province = value;
            }
          });

          // Require at least email or full name
          if (!contact.email && !contact.full_name && !contact.first_name) {
            continue;
          }

          // Generate full_name if not present
          if (!contact.full_name && (contact.first_name || contact.last_name)) {
            contact.full_name = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();
          }

          // Check if contact exists by email
          if (contact.email) {
            const existing = await client.query(
              'SELECT id FROM contacts WHERE LOWER(email) = LOWER($1)',
              [contact.email]
            );

            if (existing.rows.length > 0) {
              // Update existing
              const fields = Object.keys(contact).filter(k => k !== 'email');
              const updates = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
              const values = fields.map(f => contact[f]);

              if (updates) {
                await client.query(
                  `UPDATE contacts SET ${updates}, updated_at = NOW() WHERE LOWER(email) = LOWER($1)`,
                  [contact.email, ...values]
                );
                stats.contacts.updated++;
              }
            } else {
              // Insert new
              const fields = Object.keys(contact);
              const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
              const values = fields.map(f => contact[f]);

              await client.query(
                `INSERT INTO contacts (${fields.join(', ')}, created_at, updated_at)
                 VALUES (${placeholders}, NOW(), NOW())`,
                values
              );
              stats.contacts.created++;
            }
          } else {
            // No email, just insert with full_name
            await client.query(
              `INSERT INTO contacts (full_name, first_name, last_name, organization, created_at, updated_at)
               VALUES ($1, $2, $3, $4, NOW(), NOW())`,
              [contact.full_name, contact.first_name, contact.last_name, contact.organization]
            );
            stats.contacts.created++;
          }

          // Show progress every 10 rows
          if ((i + 1) % 10 === 0) {
            console.log(`   Processed ${i + 1}/${rows.length} rows...`);
          }

        } catch (error) {
          console.error(`   ❌ Error on row ${i + 1}:`, error.message);
          stats.contacts.failed++;
        }
      }
    }

    // Print summary
    console.log('\n\n' + '═'.repeat(60));
    console.log('📊 IMPORT SUMMARY');
    console.log('═'.repeat(60));

    console.log('\n👥 Contacts:');
    console.log(`   ✅ Created: ${stats.contacts.created}`);
    console.log(`   🔄 Updated: ${stats.contacts.updated}`);
    console.log(`   ❌ Failed: ${stats.contacts.failed}`);
    console.log(`   📈 Total processed: ${stats.contacts.created + stats.contacts.updated + stats.contacts.failed}`);

    if (stats.organizations.created + stats.organizations.updated > 0) {
      console.log('\n🏢 Organizations:');
      console.log(`   ✅ Created: ${stats.organizations.created}`);
      console.log(`   🔄 Updated: ${stats.organizations.updated}`);
      console.log(`   ❌ Failed: ${stats.organizations.failed}`);
    }

    if (stats.funding.created + stats.funding.updated > 0) {
      console.log('\n💰 Funding Prospects:');
      console.log(`   ✅ Created: ${stats.funding.created}`);
      console.log(`   🔄 Updated: ${stats.funding.updated}`);
      console.log(`   ❌ Failed: ${stats.funding.failed}`);
    }

    console.log('\n🎉 Import completed successfully!');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('🔌 Database connection closed');
  }
}

// Check for required environment variables
if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.error('❌ ERROR: Missing Google Sheets credentials');
  console.error('Please ensure GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are set in .env');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL not set');
  process.exit(1);
}

// Run the import
importFromGoogleSheets();
