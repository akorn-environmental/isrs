#!/usr/bin/env node
/**
 * Full Data Enrichment Script
 * Processes ALL contacts with improved organization detection
 */

require('dotenv').config();
const { query } = require('../src/config/database');

// Extended domain mappings for better organization detection
const DOMAIN_TO_ORG = {
  // US Government
  'noaa.gov': { name: 'NOAA', type: 'Government', website: 'https://www.noaa.gov' },
  'nmfs.noaa.gov': { name: 'NOAA Fisheries', type: 'Government', website: 'https://www.fisheries.noaa.gov' },
  'usda.gov': { name: 'USDA', type: 'Government', website: 'https://www.usda.gov' },
  'doi.gov': { name: 'Department of Interior', type: 'Government', website: 'https://www.doi.gov' },
  'epa.gov': { name: 'EPA', type: 'Government', website: 'https://www.epa.gov' },
  'fws.gov': { name: 'US Fish and Wildlife Service', type: 'Government', website: 'https://www.fws.gov' },
  'state.gov': { name: 'US State Department', type: 'Government', website: 'https://www.state.gov' },
  'navy.mil': { name: 'US Navy', type: 'Government', website: 'https://www.navy.mil' },
  'nps.gov': { name: 'National Park Service', type: 'Government', website: 'https://www.nps.gov' },
  'usgs.gov': { name: 'USGS', type: 'Government', website: 'https://www.usgs.gov' },

  // State Government
  'dnr.state.fl.us': { name: 'Florida DNR', type: 'Government', website: 'https://myfwc.com' },
  'myfwc.com': { name: 'Florida Fish and Wildlife', type: 'Government', website: 'https://myfwc.com' },
  'wildlife.ca.gov': { name: 'California Dept of Fish and Wildlife', type: 'Government', website: 'https://wildlife.ca.gov' },
  'tpwd.texas.gov': { name: 'Texas Parks and Wildlife', type: 'Government', website: 'https://tpwd.texas.gov' },
  'dnr.sc.gov': { name: 'South Carolina DNR', type: 'Government', website: 'https://www.dnr.sc.gov' },
  'dnr.ga.gov': { name: 'Georgia DNR', type: 'Government', website: 'https://gadnr.org' },
  'ncwildlife.org': { name: 'NC Wildlife Resources Commission', type: 'Government', website: 'https://www.ncwildlife.org' },
  'dnr.maryland.gov': { name: 'Maryland DNR', type: 'Government', website: 'https://dnr.maryland.gov' },
  'dec.ny.gov': { name: 'NY Dept of Environmental Conservation', type: 'Government', website: 'https://dec.ny.gov' },
  'mass.gov': { name: 'Massachusetts', type: 'Government', website: 'https://www.mass.gov' },
  'maine.gov': { name: 'State of Maine', type: 'Government', website: 'https://www.maine.gov' },

  // International Government
  'dfo-mpo.gc.ca': { name: 'Fisheries and Oceans Canada', type: 'Government', website: 'https://www.dfo-mpo.gc.ca' },
  'ec.gc.ca': { name: 'Environment and Climate Change Canada', type: 'Government', website: 'https://www.canada.ca/en/environment-climate-change.html' },
  'cefas.co.uk': { name: 'CEFAS', type: 'Government', website: 'https://www.cefas.co.uk' },

  // Major Universities
  'ufl.edu': { name: 'University of Florida', type: 'University', website: 'https://www.ufl.edu' },
  'fsu.edu': { name: 'Florida State University', type: 'University', website: 'https://www.fsu.edu' },
  'uga.edu': { name: 'University of Georgia', type: 'University', website: 'https://www.uga.edu' },
  'ncsu.edu': { name: 'NC State University', type: 'University', website: 'https://www.ncsu.edu' },
  'unc.edu': { name: 'University of North Carolina', type: 'University', website: 'https://www.unc.edu' },
  'duke.edu': { name: 'Duke University', type: 'University', website: 'https://www.duke.edu' },
  'vims.edu': { name: 'Virginia Institute of Marine Science', type: 'University', website: 'https://www.vims.edu' },
  'wm.edu': { name: 'William & Mary', type: 'University', website: 'https://www.wm.edu' },
  'umces.edu': { name: 'University of Maryland Center for Environmental Science', type: 'University', website: 'https://www.umces.edu' },
  'umd.edu': { name: 'University of Maryland', type: 'University', website: 'https://www.umd.edu' },
  'rutgers.edu': { name: 'Rutgers University', type: 'University', website: 'https://www.rutgers.edu' },
  'uri.edu': { name: 'University of Rhode Island', type: 'University', website: 'https://www.uri.edu' },
  'unh.edu': { name: 'University of New Hampshire', type: 'University', website: 'https://www.unh.edu' },
  'maine.edu': { name: 'University of Maine', type: 'University', website: 'https://umaine.edu' },
  'tamu.edu': { name: 'Texas A&M University', type: 'University', website: 'https://www.tamu.edu' },
  'lsu.edu': { name: 'Louisiana State University', type: 'University', website: 'https://www.lsu.edu' },
  'auburn.edu': { name: 'Auburn University', type: 'University', website: 'https://www.auburn.edu' },
  'clemson.edu': { name: 'Clemson University', type: 'University', website: 'https://www.clemson.edu' },
  'sc.edu': { name: 'University of South Carolina', type: 'University', website: 'https://www.sc.edu' },
  'miami.edu': { name: 'University of Miami', type: 'University', website: 'https://www.miami.edu' },
  'fau.edu': { name: 'Florida Atlantic University', type: 'University', website: 'https://www.fau.edu' },
  'usf.edu': { name: 'University of South Florida', type: 'University', website: 'https://www.usf.edu' },
  'ucf.edu': { name: 'University of Central Florida', type: 'University', website: 'https://www.ucf.edu' },
  'gatech.edu': { name: 'Georgia Tech', type: 'University', website: 'https://www.gatech.edu' },
  'virginia.edu': { name: 'University of Virginia', type: 'University', website: 'https://www.virginia.edu' },
  'stanford.edu': { name: 'Stanford University', type: 'University', website: 'https://www.stanford.edu' },
  'berkeley.edu': { name: 'UC Berkeley', type: 'University', website: 'https://www.berkeley.edu' },
  'ucla.edu': { name: 'UCLA', type: 'University', website: 'https://www.ucla.edu' },
  'ucsd.edu': { name: 'UC San Diego', type: 'University', website: 'https://www.ucsd.edu' },
  'ucsb.edu': { name: 'UC Santa Barbara', type: 'University', website: 'https://www.ucsb.edu' },
  'ucdavis.edu': { name: 'UC Davis', type: 'University', website: 'https://www.ucdavis.edu' },
  'washington.edu': { name: 'University of Washington', type: 'University', website: 'https://www.washington.edu' },
  'oregonstate.edu': { name: 'Oregon State University', type: 'University', website: 'https://oregonstate.edu' },
  'uw.edu': { name: 'University of Washington', type: 'University', website: 'https://www.washington.edu' },
  'hawaii.edu': { name: 'University of Hawaii', type: 'University', website: 'https://www.hawaii.edu' },
  'alaska.edu': { name: 'University of Alaska', type: 'University', website: 'https://www.alaska.edu' },
  'cornell.edu': { name: 'Cornell University', type: 'University', website: 'https://www.cornell.edu' },
  'yale.edu': { name: 'Yale University', type: 'University', website: 'https://www.yale.edu' },
  'harvard.edu': { name: 'Harvard University', type: 'University', website: 'https://www.harvard.edu' },
  'mit.edu': { name: 'MIT', type: 'University', website: 'https://www.mit.edu' },
  'whoi.edu': { name: 'Woods Hole Oceanographic Institution', type: 'Research', website: 'https://www.whoi.edu' },
  'mbl.edu': { name: 'Marine Biological Laboratory', type: 'Research', website: 'https://www.mbl.edu' },

  // Research Organizations
  'oceana.org': { name: 'Oceana', type: 'Non-Profit', website: 'https://oceana.org' },
  'tnc.org': { name: 'The Nature Conservancy', type: 'Non-Profit', website: 'https://www.nature.org' },
  'nature.org': { name: 'The Nature Conservancy', type: 'Non-Profit', website: 'https://www.nature.org' },
  'ewg.org': { name: 'Environmental Working Group', type: 'Non-Profit', website: 'https://www.ewg.org' },
  'edf.org': { name: 'Environmental Defense Fund', type: 'Non-Profit', website: 'https://www.edf.org' },
  'sierraclub.org': { name: 'Sierra Club', type: 'Non-Profit', website: 'https://www.sierraclub.org' },
  'audubon.org': { name: 'National Audubon Society', type: 'Non-Profit', website: 'https://www.audubon.org' },
  'fisheries.org': { name: 'American Fisheries Society', type: 'Non-Profit', website: 'https://fisheries.org' },

  // Commercial/Industry
  'cca.org': { name: 'Coastal Conservation Association', type: 'Non-Profit', website: 'https://www.joincca.org' },

  // Personal email domains to skip
  'gmail.com': null,
  'yahoo.com': null,
  'hotmail.com': null,
  'outlook.com': null,
  'aol.com': null,
  'icloud.com': null,
  'me.com': null,
  'mac.com': null,
  'live.com': null,
  'msn.com': null,
  'comcast.net': null,
  'verizon.net': null,
  'att.net': null,
  'bellsouth.net': null,
  'charter.net': null,
  'cox.net': null,
  'earthlink.net': null,
  'sbcglobal.net': null,
};

function getOrgFromDomain(domain) {
  // Direct lookup
  if (DOMAIN_TO_ORG[domain] !== undefined) {
    return DOMAIN_TO_ORG[domain];
  }

  // Try parent domain (e.g., subdomain.noaa.gov -> noaa.gov)
  const parts = domain.split('.');
  if (parts.length > 2) {
    const parentDomain = parts.slice(-2).join('.');
    if (DOMAIN_TO_ORG[parentDomain] !== undefined) {
      return DOMAIN_TO_ORG[parentDomain];
    }
  }

  // Determine type from TLD
  let type = 'Organization';
  let website = `https://${domain}`;

  if (domain.endsWith('.gov')) {
    type = 'Government';
  } else if (domain.endsWith('.edu')) {
    type = 'University';
  } else if (domain.endsWith('.org')) {
    type = 'Non-Profit';
  } else if (domain.endsWith('.mil')) {
    type = 'Government';
  }

  // Generate name from domain
  const mainPart = parts[parts.length - 2];
  const name = mainPart.charAt(0).toUpperCase() + mainPart.slice(1);

  return { name, type, website };
}

function parseEmailForNames(email) {
  if (!email) return { firstName: null, lastName: null };

  const localPart = email.split('@')[0].toLowerCase();

  // Pattern: firstname.lastname
  if (localPart.includes('.')) {
    const parts = localPart.split('.');
    if (parts.length >= 2 && parts[0].length > 1 && parts[1].length > 1) {
      return {
        firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
        lastName: parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
      };
    }
  }

  // Pattern: firstname_lastname
  if (localPart.includes('_')) {
    const parts = localPart.split('_');
    if (parts.length >= 2 && parts[0].length > 1 && parts[1].length > 1) {
      return {
        firstName: parts[0].charAt(0).toUpperCase() + parts[0].slice(1),
        lastName: parts[1].charAt(0).toUpperCase() + parts[1].slice(1)
      };
    }
  }

  return { firstName: null, lastName: null };
}

async function runFullEnrichment() {
  console.log('🚀 Starting FULL Data Enrichment Process...\n');

  try {
    // Step 1: Get current data quality
    console.log('📊 Step 1: Current Data Quality...\n');
    const qualityReport = await query('SELECT * FROM generate_data_quality_report()');
    console.log('Before Enrichment:');
    qualityReport.rows.forEach(row => {
      console.log(`  ${row.metric_name}: ${row.count} (${row.percentage}%)`);
    });
    console.log();

    // Step 2: Get ALL contacts
    console.log('🔍 Step 2: Loading ALL Contacts...\n');
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
    `);
    console.log(`Loaded ${contactsResult.rows.length} contacts\n`);

    // Step 3: Load existing organizations
    console.log('🏢 Step 3: Loading Existing Organizations...\n');
    const orgsResult = await query('SELECT id, name, lower(name) as name_lower FROM organizations');
    const orgMap = new Map();
    orgsResult.rows.forEach(org => {
      orgMap.set(org.name_lower, org);
    });
    console.log(`Found ${orgsResult.rows.length} existing organizations\n`);

    // Step 4: Process enrichment
    console.log('✨ Step 4: Processing Enrichment...\n');
    const enrichmentSuggestions = [];
    const organizationsToCreate = new Map();

    for (const contact of contactsResult.rows) {
      const suggestion = {
        contactId: contact.id,
        email: contact.email,
        updates: {}
      };

      // Parse email for names
      if (!contact.first_name || !contact.last_name) {
        const names = parseEmailForNames(contact.email);
        if (!contact.first_name && names.firstName) {
          suggestion.updates.first_name = names.firstName;
        }
        if (!contact.last_name && names.lastName) {
          suggestion.updates.last_name = names.lastName;
        }
      }

      // Parse email for organization
      if (!contact.organization_id && !contact.organization_name) {
        const domain = contact.email.split('@')[1]?.toLowerCase();
        if (domain) {
          const orgInfo = getOrgFromDomain(domain);
          if (orgInfo) {
            suggestion.updates.organization_name = orgInfo.name;

            // Check if org exists
            const existingOrg = orgMap.get(orgInfo.name.toLowerCase());
            if (existingOrg) {
              suggestion.updates.organization_id = existingOrg.id;
            } else {
              // Track for creation
              if (!organizationsToCreate.has(orgInfo.name)) {
                organizationsToCreate.set(orgInfo.name, {
                  name: orgInfo.name,
                  type: orgInfo.type,
                  website: orgInfo.website,
                  notes: `Auto-generated from email domain: ${domain}`
                });
              }
            }
          }
        }
      }

      if (Object.keys(suggestion.updates).length > 0) {
        enrichmentSuggestions.push(suggestion);
      }
    }

    console.log(`Generated ${enrichmentSuggestions.length} enrichment suggestions`);
    console.log(`Will create ${organizationsToCreate.size} new organizations\n`);

    // Show sample of what will be created
    console.log('Sample Organizations to Create:');
    let count = 0;
    for (const org of organizationsToCreate.values()) {
      if (count >= 10) break;
      console.log(`  - ${org.name} (${org.type}): ${org.website}`);
      count++;
    }
    if (organizationsToCreate.size > 10) {
      console.log(`  ... and ${organizationsToCreate.size - 10} more`);
    }
    console.log();

    // Step 5: Apply enrichment
    console.log('💾 Step 5: Applying Enrichment...\n');

    let orgsCreated = 0;
    let contactsUpdated = 0;
    let errors = [];

    // Create organizations (individual transactions)
    for (const org of organizationsToCreate.values()) {
      try {
        const result = await query(`
          INSERT INTO organizations (name, type, website, notes)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (name) DO NOTHING
          RETURNING id, name
        `, [org.name, org.type, org.website, org.notes]);

        if (result.rows.length > 0) {
          orgsCreated++;
          orgMap.set(org.name.toLowerCase(), result.rows[0]);
        }
      } catch (err) {
        // Skip errors, continue
      }
    }
    console.log(`  Created ${orgsCreated} new organizations`);

    // Update contacts individually (skip errors)
    for (let i = 0; i < enrichmentSuggestions.length; i++) {
      const suggestion = enrichmentSuggestions[i];

      try {
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

          // Look up org ID
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
      } catch (err) {
        errors.push({ email: suggestion.email, error: err.message });
      }

      // Progress indicator
      if ((i + 1) % 500 === 0 || i + 1 >= enrichmentSuggestions.length) {
        console.log(`  Processed ${i + 1} / ${enrichmentSuggestions.length} contacts (${contactsUpdated} updated, ${errors.length} errors)`);
      }
    }

    console.log(`\n✅ Updated ${contactsUpdated} contacts (${errors.length} errors)\n`);

    // Step 6: Final report
    console.log('📊 Step 6: Final Data Quality Report...\n');
    const finalReport = await query('SELECT * FROM generate_data_quality_report()');
    console.log('After Enrichment:');
    finalReport.rows.forEach(row => {
      console.log(`  ${row.metric_name}: ${row.count} (${row.percentage}%)`);
    });
    console.log();

    console.log('🎉 Full Enrichment Complete!\n');
    console.log('Summary:');
    console.log(`  Organizations Created: ${orgsCreated}`);
    console.log(`  Contacts Updated: ${contactsUpdated}`);
    console.log(`  Errors: ${errors.length}`);

  } catch (error) {
    console.error('❌ Enrichment failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run
runFullEnrichment().catch(console.error);
