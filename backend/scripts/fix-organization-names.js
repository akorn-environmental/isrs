#!/usr/bin/env node
/**
 * Fix Organization Names
 * - Add spaces between concatenated words
 * - Proper capitalization
 * - Handle camelCase
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
});

// Known organization name mappings (domain -> proper name)
const KNOWN_ORGS = {
  'goldstandarddiagnostics': 'Gold Standard Diagnostics',
  'bigpondcom': 'Bigpond',
  'biglobe': 'Biglobe',
  'rutgersuniversity': 'Rutgers University',
  'floridaocean': 'Florida Ocean',
  'stantec': 'Stantec',
  'fao': 'FAO',
  'ne': 'NE',
  'alabama': 'Alabama',
  'auburn': 'Auburn University',
  // Add more as needed
};

// Words that should stay lowercase (unless at start)
const LOWERCASE_WORDS = ['of', 'the', 'and', 'for', 'in', 'on', 'at', 'to', 'a', 'an'];

// Proper capitalization
function properCase(word) {
  if (!word) return word;
  // Acronyms
  if (word.length <= 3 && word === word.toUpperCase()) return word;
  // Standard case
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

// Fix organization name
function fixOrgName(name) {
  if (!name) return name;

  // Check known mappings first
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  if (KNOWN_ORGS[normalized]) {
    return KNOWN_ORGS[normalized];
  }

  // If already has spaces and looks proper, leave it
  if (name.includes(' ') && /^[A-Z]/.test(name)) {
    return name;
  }

  let result = name;

  // Split on camelCase boundaries
  result = result.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Split on transitions from letters to numbers and vice versa
  result = result.replace(/([a-zA-Z])(\d)/g, '$1 $2');
  result = result.replace(/(\d)([a-zA-Z])/g, '$1 $2');

  // Proper capitalization
  result = result.split(' ')
    .map((word, idx) => {
      if (idx > 0 && LOWERCASE_WORDS.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return properCase(word);
    })
    .join(' ');

  return result.trim();
}

async function fixOrganizations() {
  console.log('🏢 Fixing Organization Names...\n');

  try {
    // Get all unique organization names
    const result = await pool.query(`
      SELECT DISTINCT organization_name, COUNT(*) as contact_count
      FROM contacts
      WHERE organization_name IS NOT NULL
      GROUP BY organization_name
      ORDER BY organization_name
    `);

    console.log(`Found ${result.rows.length} unique organizations\n`);

    let fixed = 0;
    const fixes = [];

    for (const row of result.rows) {
      const original = row.organization_name;
      const corrected = fixOrgName(original);

      if (corrected !== original) {
        fixes.push({ original, corrected, count: row.contact_count });

        // Update all contacts with this org name
        await pool.query(`
          UPDATE contacts
          SET organization_name = $1, updated_at = NOW()
          WHERE organization_name = $2
        `, [corrected, original]);

        fixed++;
      }
    }

    console.log('✅ Complete!\n');
    console.log(`Organizations fixed: ${fixed}\n`);

    if (fixes.length > 0) {
      console.log('Changes made:');
      fixes.slice(0, 30).forEach(f => {
        console.log(`  "${f.original}" -> "${f.corrected}" (${f.count} contacts)`);
      });
      if (fixes.length > 30) {
        console.log(`  ... and ${fixes.length - 30} more`);
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  fixOrganizations().catch(console.error);
}

module.exports = { fixOrgName };
