#!/usr/bin/env node
/**
 * Contact Data Cleanup Script
 * Fixes:
 * 1. Organization names - proper spacing (goldstandarddiagnostics -> Gold Standard Diagnostics)
 * 2. Name suffixes - Jr, Sr, III etc. (Adamsjr -> Adams Jr.)
 * 3. Fake names - clear names that look like email prefixes (rosac_87, sales_abraxis)
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com')
    ? { rejectUnauthorized: false }
    : false
});

// Patterns that indicate a fake/extracted name
const FAKE_NAME_PATTERNS = [
  /^\d+$/,                    // Just numbers
  /^[a-z]+[_\-]\d+$/i,        // name_123 or name-123
  /^\d+[_\-][a-z]+$/i,        // 123_name
  /^(info|admin|sales|support|contact|hello|office|team|webmaster|noreply|no-reply)$/i,
  /^[a-z]{1,3}\d{2,}$/i,      // ab123, xyz99
  /^[a-z]+\d{3,}$/i,          // name1234
];

// Check if a name looks fake
function isFakeName(name) {
  if (!name) return false;
  const cleaned = name.trim().toLowerCase();

  // Too short
  if (cleaned.length < 2) return true;

  // Contains numbers (like "Sally 2403" or "Rosac 87")
  if (/\d/.test(cleaned)) return true;

  // Matches fake patterns
  for (const pattern of FAKE_NAME_PATTERNS) {
    if (pattern.test(cleaned)) return true;
  }

  return false;
}

// Fix name suffixes
function fixNameSuffix(lastName) {
  if (!lastName) return lastName;

  const suffixes = {
    'jr': ' Jr.',
    'sr': ' Sr.',
    'ii': ' II',
    'iii': ' III',
    'iv': ' IV',
    'phd': ', Ph.D.',
    'md': ', M.D.',
    'esq': ', Esq.',
  };

  let fixed = lastName;

  for (const [suffix, replacement] of Object.entries(suffixes)) {
    // Check if name ends with suffix (case insensitive)
    const regex = new RegExp(`(.+?)(${suffix})$`, 'i');
    const match = fixed.match(regex);
    if (match) {
      fixed = match[1] + replacement;
      break;
    }
  }

  return fixed;
}

// Convert camelCase or concatenated words to proper spacing
function addSpacesToName(name) {
  if (!name) return name;

  // Already has spaces, likely OK
  if (name.includes(' ')) return name;

  // Add space before capital letters (camelCase)
  let spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Handle all-lowercase concatenated common words
  const commonWords = [
    'standard', 'diagnostics', 'gold', 'university', 'college', 'institute',
    'research', 'science', 'sciences', 'marine', 'coastal', 'ocean', 'fish',
    'fisheries', 'wildlife', 'environmental', 'national', 'international',
    'foundation', 'association', 'society', 'council', 'department', 'agency',
    'center', 'centre', 'laboratory', 'lab', 'group', 'corp', 'corporation',
    'company', 'consulting', 'services', 'management', 'conservation',
    'restoration', 'aquaculture', 'shellfish', 'oyster', 'mussel', 'clam'
  ];

  // Try to identify word boundaries in lowercase strings
  let lower = spaced.toLowerCase();
  for (const word of commonWords) {
    const regex = new RegExp(`(${word})`, 'gi');
    if (lower.includes(word) && !spaced.includes(' ')) {
      // Find position and try to add space
      const idx = lower.indexOf(word);
      if (idx > 0) {
        spaced = spaced.substring(0, idx) + ' ' + spaced.substring(idx);
        lower = spaced.toLowerCase();
      }
    }
  }

  // Capitalize first letter of each word
  return spaced.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
    .trim();
}

// Main cleanup function
async function cleanupContacts() {
  console.log('🧹 Starting Contact Data Cleanup...\n');

  let fixedNames = 0;
  let clearedFakeNames = 0;
  let fixedOrgs = 0;
  let fixedSuffixes = 0;

  try {
    // Get all contacts
    const result = await pool.query(`
      SELECT id, email, first_name, last_name, full_name, organization_name
      FROM contacts
      ORDER BY email
    `);

    console.log(`Found ${result.rows.length} contacts to check\n`);

    for (const contact of result.rows) {
      const updates = {};

      // Check for fake first name
      if (isFakeName(contact.first_name)) {
        updates.first_name = null;
        clearedFakeNames++;
      }

      // Check for fake last name
      if (isFakeName(contact.last_name)) {
        updates.last_name = null;
        clearedFakeNames++;
      }

      // Check for fake full name
      if (isFakeName(contact.full_name)) {
        updates.full_name = null;
        clearedFakeNames++;
      }

      // Fix name suffixes in last name
      if (contact.last_name && !isFakeName(contact.last_name)) {
        const fixedLast = fixNameSuffix(contact.last_name);
        if (fixedLast !== contact.last_name) {
          updates.last_name = fixedLast;
          fixedSuffixes++;
        }
      }

      // Fix organization name spacing
      if (contact.organization_name) {
        const fixedOrg = addSpacesToName(contact.organization_name);
        if (fixedOrg !== contact.organization_name) {
          updates.organization_name = fixedOrg;
          fixedOrgs++;
        }
      }

      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        const setClauses = [];
        const values = [];
        let paramIdx = 1;

        for (const [field, value] of Object.entries(updates)) {
          setClauses.push(`${field} = $${paramIdx}`);
          values.push(value);
          paramIdx++;
        }

        setClauses.push('updated_at = NOW()');
        values.push(contact.id);

        await pool.query(`
          UPDATE contacts
          SET ${setClauses.join(', ')}
          WHERE id = $${paramIdx}
        `, values);

        fixedNames++;
      }
    }

    console.log('✅ Cleanup Complete!\n');
    console.log('Summary:');
    console.log(`  Contacts modified: ${fixedNames}`);
    console.log(`  Fake names cleared: ${clearedFakeNames}`);
    console.log(`  Name suffixes fixed: ${fixedSuffixes}`);
    console.log(`  Organization names fixed: ${fixedOrgs}`);

    // Show some examples of what was changed
    console.log('\n📋 Sample of contacts with cleared fake names:');
    const sampleCleared = await pool.query(`
      SELECT email, first_name, last_name, full_name
      FROM contacts
      WHERE first_name IS NULL AND last_name IS NULL
      LIMIT 5
    `);
    sampleCleared.rows.forEach(r => {
      console.log(`  ${r.email} -> Name: (cleared)`);
    });

    console.log('\n📋 Sample of fixed organization names:');
    const sampleOrgs = await pool.query(`
      SELECT DISTINCT organization_name
      FROM contacts
      WHERE organization_name IS NOT NULL
        AND organization_name LIKE '% %'
      ORDER BY organization_name
      LIMIT 10
    `);
    sampleOrgs.rows.forEach(r => {
      console.log(`  ${r.organization_name}`);
    });

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  cleanupContacts().catch(console.error);
}

module.exports = { cleanupContacts, isFakeName, fixNameSuffix, addSpacesToName };
