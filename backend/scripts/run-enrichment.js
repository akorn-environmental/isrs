#!/usr/bin/env node
/**
 * Run Data Enrichment via API
 * This script will preview and apply data enrichment to contacts
 */

require('dotenv').config();
const { query } = require('../src/config/database');

async function runEnrichment() {
  console.log('🚀 Starting Data Enrichment Process...\n');

  try {
    // Step 1: Get current data quality
    console.log('📊 Step 1: Checking Data Quality...\n');
    const qualityReport = await query('SELECT * FROM generate_data_quality_report()');

    console.log('Current Data Quality:');
    qualityReport.rows.forEach(row => {
      console.log(`  ${row.metric_name}: ${row.count} (${row.percentage}%)`);
    });
    console.log();

    // Step 2: Get contacts that need enrichment
    console.log('🔍 Step 2: Finding Contacts to Enrich...\n');

    const contactsResult = await query(`
      SELECT
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.organization_id,
        c.organization_name
      FROM contacts c
      WHERE c.email IS NOT NULL
      LIMIT 100
    `);

    console.log(`Found ${contactsResult.rows.length} contacts to process\n`);

    // Step 3: Process enrichment suggestions
    console.log('✨ Step 3: Generating Enrichment Suggestions...\n');

    const enrichmentSuggestions = [];
    const organizationsToCreate = new Map();

    // Get all existing organizations
    const orgsResult = await query('SELECT id, name, lower(name) as name_lower FROM organizations');
    const orgMap = new Map();
    orgsResult.rows.forEach(org => {
      orgMap.set(org.name_lower, org);
    });

    let enrichedCount = 0;

    for (const contact of contactsResult.rows) {
      const suggestion = {
        contactId: contact.id,
        email: contact.email,
        updates: {}
      };

      // Parse email for name suggestions
      const nameResult = await query('SELECT * FROM parse_email_name($1)', [contact.email]);
      if (nameResult.rows.length > 0) {
        const { first_name, last_name } = nameResult.rows[0];

        if (!contact.first_name && first_name) {
          suggestion.updates.first_name = first_name;
        }
        if (!contact.last_name && last_name) {
          suggestion.updates.last_name = last_name;
        }
      }

      // Parse email for organization suggestions
      const domain = await query('SELECT extract_email_domain($1) as domain', [contact.email]);
      if (domain.rows.length > 0) {
        const orgResult = await query(`
          SELECT
            domain_to_org_name($1) as org_name,
            domain_to_website($1) as website,
            domain_to_org_type($1) as org_type
        `, [domain.rows[0].domain]);

        if (orgResult.rows.length > 0 && orgResult.rows[0].org_name) {
          const suggestedOrg = orgResult.rows[0];

          // Only suggest if contact doesn't have an organization
          if (!contact.organization_id && !contact.organization_name) {
            suggestion.updates.organization_name = suggestedOrg.org_name;

            // Check if organization exists
            const existingOrg = orgMap.get(suggestedOrg.org_name.toLowerCase());
            if (existingOrg) {
              suggestion.updates.organization_id = existingOrg.id;
            } else {
              // Track organization to create
              if (!organizationsToCreate.has(suggestedOrg.org_name)) {
                organizationsToCreate.set(suggestedOrg.org_name, {
                  name: suggestedOrg.org_name,
                  type: suggestedOrg.org_type,
                  website: suggestedOrg.website,
                  notes: `Auto-generated from email domain: ${domain.rows[0].domain}`
                });
              }
            }
          }
        }
      }

      // Only add if there are updates
      if (Object.keys(suggestion.updates).length > 0) {
        enrichmentSuggestions.push(suggestion);
        enrichedCount++;
      }
    }

    console.log(`Generated ${enrichedCount} enrichment suggestions`);
    console.log(`Will create ${organizationsToCreate.size} new organizations\n`);

    // Step 4: Apply enrichment
    console.log('💾 Step 4: Applying Enrichment...\n');

    await query('BEGIN');

    try {
      let orgsCreated = 0;
      let contactsUpdated = 0;

      // Create new organizations
      for (const org of organizationsToCreate.values()) {
        const result = await query(`
          INSERT INTO organizations (name, type, website, notes)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO NOTHING
          RETURNING id
        `, [org.name, org.type, org.website, org.notes]);

        if (result.rows.length > 0) {
          orgsCreated++;
          // Update org map with new organization
          orgMap.set(org.name.toLowerCase(), result.rows[0]);
        }
      }

      console.log(`  Created ${orgsCreated} new organizations`);

      // Apply contact updates
      for (const suggestion of enrichmentSuggestions) {
        const updates = suggestion.updates;
        const setClauses = [];
        const values = [];
        let paramIndex = 1;

        if (updates.first_name) {
          setClauses.push(`first_name = $${paramIndex}`);
          values.push(updates.first_name);
          paramIndex++;
        }
        if (updates.last_name) {
          setClauses.push(`last_name = $${paramIndex}`);
          values.push(updates.last_name);
          paramIndex++;
        }
        if (updates.organization_name) {
          setClauses.push(`organization_name = $${paramIndex}`);
          values.push(updates.organization_name);
          paramIndex++;

          // If we just created this org, look up its ID
          if (!updates.organization_id) {
            const orgLookup = orgMap.get(updates.organization_name.toLowerCase());
            if (orgLookup) {
              updates.organization_id = orgLookup.id;
            }
          }
        }
        if (updates.organization_id) {
          setClauses.push(`organization_id = $${paramIndex}`);
          values.push(updates.organization_id);
          paramIndex++;
        }

        if (setClauses.length > 0) {
          setClauses.push('updated_at = NOW()');
          values.push(suggestion.contactId);

          await query(`
            UPDATE contacts
            SET ${setClauses.join(', ')}
            WHERE id = $${paramIndex}
          `, values);

          contactsUpdated++;
        }
      }

      console.log(`  Updated ${contactsUpdated} contacts\n`);

      await query('COMMIT');
      console.log('✅ Enrichment completed successfully!\n');

      // Step 5: Show new data quality
      console.log('📊 Step 5: New Data Quality Report...\n');
      const newQualityReport = await query('SELECT * FROM generate_data_quality_report()');

      console.log('Updated Data Quality:');
      newQualityReport.rows.forEach(row => {
        console.log(`  ${row.metric_name}: ${row.count} (${row.percentage}%)`);
      });
      console.log();

      console.log('🎉 Data Enrichment Complete!\n');
      console.log('Summary:');
      console.log(`  Organizations Created: ${orgsCreated}`);
      console.log(`  Contacts Updated: ${contactsUpdated}`);

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Enrichment failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runEnrichment().catch(console.error);
}

module.exports = { runEnrichment };
