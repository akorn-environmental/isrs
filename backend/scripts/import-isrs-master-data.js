/**
 * Import ISRS Master Database from CSV files
 * Merges with existing data, matches by email
 *
 * Run with: node scripts/import-isrs-master-data.js
 */

const fs = require('fs');
const https = require('https');
const { parse } = require('csv-parse/sync');

const DATA_DIR = '/Users/akorn/Desktop/isrs icsr2024 data';

const CSV_FILES = {
  contacts: `${DATA_DIR}/ISRS Master Database - Production - 01_MASTER_CONTACTS (1).csv`,
  organizations: `${DATA_DIR}/ISRS Master Database - Production - 02_ORGANIZATIONS.csv`,
  sponsors: `${DATA_DIR}/ISRS Master Database - Production - 04_ICSR2024_SPONSORS.csv`,
  exhibitors: `${DATA_DIR}/ISRS Master Database - Production - 05_ICSR2024_EXHIBITORS.csv`,
  abstracts: `${DATA_DIR}/ISRS Master Database - Production - 06_ICSR2024_ABSTRACTS.csv`,
  funding: `${DATA_DIR}/ISRS Master Database - Production - 08_FUNDING_PROSPECTS.csv`,
  research: `${DATA_DIR}/ISRS Master Database - Production - 09_RESEARCH_COLLABORATORS.csv`,
  government: `${DATA_DIR}/ISRS Master Database - Production - 10_GOVERNMENT_CONTACTS.csv`,
  international: `${DATA_DIR}/ISRS Master Database - Production - 11_INTERNATIONAL_CONTACTS.csv`
};

let sessionToken = null;

// Parse CSV file
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true
  });
}

// Login to get session token
async function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: 'aaron.kornbluth@gmail.com',
      password: 'Test123'
    });

    const req = https.request({
      hostname: 'isrs-database-backend.onrender.com',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.success) {
            resolve(result.data.sessionToken);
          } else {
            reject(new Error(result.error));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Make API request
async function apiRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;

    const req = https.request({
      hostname: 'isrs-database-backend.onrender.com',
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionToken}`,
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    }, (res) => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(responseBody));
        } catch (e) {
          resolve({ success: false, error: responseBody });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// Import contacts
async function importContacts() {
  console.log('\n📥 Importing Master Contacts...');
  const rows = parseCSV(CSV_FILES.contacts);
  console.log(`   Found ${rows.length} contacts`);

  const contacts = rows.map(row => ({
    email: (row.Email || '').toLowerCase().trim(),
    first_name: row.First_Name || '',
    last_name: row.Last_Name || '',
    full_name: row.Full_Name || '',
    phone: row.Phone || '',
    organization_name: row.Primary_Organization || '',
    job_title: row.Job_Title || '',
    title: row.Title || '',
    city: row.City || '',
    state_province: row.State_Province || '',
    country: row.Country || '',
    contact_type: row.Contact_Type || '',
    linkedin: row.LinkedIn || '',
    website: row.Website || '',
    notes: row.Notes || '',
    status: row.Status || 'Active',
    is_international: row.Is_International === 'Yes',
    conference_role: row.Conference_Role || '',
    source_file: row.Source_File || '',
    import_batch: row.Import_Batch || '',
    engagement_score: parseInt(row.Engagement_Score) || null,
    priority_level: row.Priority_Level || '',
    research_interests: row.Research_Interests || ''
  })).filter(c => c.email && c.email.includes('@'));

  // Import in batches
  const batchSize = 50;
  let created = 0, updated = 0, failed = 0;

  for (let i = 0; i < contacts.length; i += batchSize) {
    const batch = contacts.slice(i, i + batchSize);
    process.stdout.write(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(contacts.length / batchSize)}... `);

    const result = await apiRequest('/api/import/save', 'POST', { contacts: batch });
    if (result.success) {
      created += result.results?.created || 0;
      updated += result.results?.updated || 0;
      failed += result.results?.failed || 0;
      console.log(`✓ (${result.results?.created || 0} new, ${result.results?.updated || 0} updated)`);
    } else {
      console.log(`✗ Error: ${result.error}`);
      failed += batch.length;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`   ✅ Contacts: ${created} created, ${updated} updated, ${failed} failed`);
  return { created, updated, failed };
}

// Import organizations
async function importOrganizations() {
  console.log('\n📥 Importing Organizations...');
  const rows = parseCSV(CSV_FILES.organizations);
  console.log(`   Found ${rows.length} organizations`);

  const organizations = rows.map(row => ({
    name: row.Organization_Name || row.Org_ID || '',
    type: (row.Org_Type || 'other').toLowerCase(),
    website: row.Website || '',
    city: row.City || '',
    state_province: row.State_Province || '',
    country: row.Country || '',
    description: row.Description || '',
    notes: row.Notes || '',
    priority_level: row.Priority_Level || ''
  })).filter(o => o.name);

  const batchSize = 50;
  let created = 0, updated = 0, failed = 0;

  for (let i = 0; i < organizations.length; i += batchSize) {
    const batch = organizations.slice(i, i + batchSize);
    process.stdout.write(`   Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(organizations.length / batchSize)}... `);

    const result = await apiRequest('/api/import/save-organizations', 'POST', { organizations: batch });
    if (result.success) {
      created += result.results?.created || 0;
      updated += result.results?.updated || 0;
      failed += result.results?.failed || 0;
      console.log(`✓ (${result.results?.created || 0} new, ${result.results?.updated || 0} updated)`);
    } else {
      console.log(`✗ Error: ${result.error}`);
      failed += batch.length;
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`   ✅ Organizations: ${created} created, ${updated} updated, ${failed} failed`);
  return { created, updated, failed };
}

// Build email to contact_id lookup from existing contacts
async function buildContactLookup() {
  console.log('\n🔍 Building contact email lookup...');
  const result = await apiRequest('/api/admin/contacts?limit=5000', 'GET');
  const lookup = {};

  if (result.success && result.data) {
    for (const contact of result.data) {
      if (contact.email) {
        lookup[contact.email.toLowerCase()] = contact.id;
      }
    }
  }

  console.log(`   Found ${Object.keys(lookup).length} contacts for lookup`);
  return lookup;
}

// Import sponsors (requires contact lookup)
async function importSponsors(contactLookup) {
  console.log('\n📥 Importing ICSR2024 Sponsors...');
  const rows = parseCSV(CSV_FILES.sponsors);
  console.log(`   Found ${rows.length} sponsors`);

  let created = 0, failed = 0;

  for (const row of rows) {
    const email = (row.Email || '').toLowerCase().trim();
    const contactId = contactLookup[email];

    // For now, just ensure the contact exists with sponsor info
    if (email && email.includes('@')) {
      const contactUpdate = {
        email,
        full_name: row.Contact_Person || '',
        organization_name: row.Organization || '',
        notes: `ICSR2024 Sponsor - ${row.Sponsor_Level || ''} - $${row.Amount || ''}. ${row.Notes || ''}`
      };

      const result = await apiRequest('/api/import/save', 'POST', { contacts: [contactUpdate] });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    }
  }

  console.log(`   ✅ Sponsors: ${created} processed, ${failed} failed`);
  return { created, failed };
}

// Import exhibitors
async function importExhibitors(contactLookup) {
  console.log('\n📥 Importing ICSR2024 Exhibitors...');
  const rows = parseCSV(CSV_FILES.exhibitors);
  console.log(`   Found ${rows.length} exhibitors`);

  let created = 0, failed = 0;

  for (const row of rows) {
    const email = (row.Email || '').toLowerCase().trim();

    if (email && email.includes('@')) {
      const contactUpdate = {
        email,
        full_name: row.Contact_Person || '',
        organization_name: row.Organization || '',
        phone: row.Phone || '',
        notes: `ICSR2024 Exhibitor - Booth ${row.Booth_Number || ''}. ${row.Products_Services || ''}`
      };

      const result = await apiRequest('/api/import/save', 'POST', { contacts: [contactUpdate] });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    }
  }

  console.log(`   ✅ Exhibitors: ${created} processed, ${failed} failed`);
  return { created, failed };
}

// Import abstracts
async function importAbstracts(contactLookup) {
  console.log('\n📥 Importing ICSR2024 Abstracts...');
  const rows = parseCSV(CSV_FILES.abstracts);
  console.log(`   Found ${rows.length} abstracts`);

  let created = 0, failed = 0;

  for (const row of rows) {
    const email = (row.Author_Email || '').toLowerCase().trim();

    if (email && email.includes('@')) {
      // Update contact with abstract info
      const contactUpdate = {
        email,
        full_name: row.Author_Name || '',
        organization_name: row.Organization || '',
        notes: `ICSR2024 Presenter - "${row.Title || ''}"`
      };

      const result = await apiRequest('/api/import/save', 'POST', { contacts: [contactUpdate] });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    }
  }

  console.log(`   ✅ Abstracts: ${created} processed, ${failed} failed`);
  return { created, failed };
}

// Import funding prospects
async function importFunding() {
  console.log('\n📥 Importing Funding Prospects...');
  const rows = parseCSV(CSV_FILES.funding);
  console.log(`   Found ${rows.length} funding prospects`);

  let created = 0, failed = 0;

  for (const row of rows) {
    const email = (row.Email || '').toLowerCase().trim();

    if (email && email.includes('@')) {
      const contactUpdate = {
        email,
        full_name: row.Contact_Person || '',
        organization_name: row.Organization || '',
        notes: `Funding Prospect - ${row.Funding_Type || ''} - ${row.Typical_Amount || ''}. ${row.Notes || ''}`
      };

      const result = await apiRequest('/api/import/save', 'POST', { contacts: [contactUpdate] });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    }
  }

  console.log(`   ✅ Funding: ${created} processed, ${failed} failed`);
  return { created, failed };
}

// Import research collaborators
async function importResearch() {
  console.log('\n📥 Importing Research Collaborators...');
  const rows = parseCSV(CSV_FILES.research);
  console.log(`   Found ${rows.length} research collaborators`);

  let created = 0, failed = 0;

  for (const row of rows) {
    // Research collaborators don't have direct email in this export
    // They reference Contact_ID, so we'd need reverse lookup
    // For now, skip or log
    console.log(`   Skipping research collaborators (no direct email field)`);
    break;
  }

  return { created, failed };
}

// Import government contacts
async function importGovernment() {
  console.log('\n📥 Importing Government Contacts...');
  const rows = parseCSV(CSV_FILES.government);
  console.log(`   Found ${rows.length} government contacts`);

  let created = 0, failed = 0;

  for (const row of rows) {
    const email = (row.Email || '').toLowerCase().trim();

    if (email && email.includes('@')) {
      const contactUpdate = {
        email,
        full_name: row.Name || '',
        organization_name: row.Agency || '',
        job_title: row.Position || '',
        contact_type: 'Government',
        notes: `Government Contact - ${row.Department || ''}. Policy Areas: ${row.Policy_Areas || ''}`
      };

      const result = await apiRequest('/api/import/save', 'POST', { contacts: [contactUpdate] });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    }
  }

  console.log(`   ✅ Government: ${created} processed, ${failed} failed`);
  return { created, failed };
}

// Import international contacts
async function importInternational() {
  console.log('\n📥 Importing International Contacts...');
  const rows = parseCSV(CSV_FILES.international);
  console.log(`   Found ${rows.length} international contacts`);

  let created = 0, failed = 0;

  for (const row of rows) {
    const email = (row.Email || '').toLowerCase().trim();

    if (email && email.includes('@')) {
      const contactUpdate = {
        email,
        full_name: row.Name || '',
        organization_name: row.Organization || '',
        country: row.Country || '',
        is_international: true,
        notes: `International Contact - ${row.Region || ''}. Expertise: ${row.Local_Expertise || ''}`
      };

      const result = await apiRequest('/api/import/save', 'POST', { contacts: [contactUpdate] });
      if (result.success) {
        created++;
      } else {
        failed++;
      }
    }
  }

  console.log(`   ✅ International: ${created} processed, ${failed} failed`);
  return { created, failed };
}

// Main import function
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('           ISRS Master Database Import');
  console.log('═══════════════════════════════════════════════════════════');

  // Login
  console.log('\n🔐 Logging in...');
  try {
    sessionToken = await login();
    console.log('   ✅ Logged in successfully');
  } catch (error) {
    console.error('   ❌ Login failed:', error.message);
    process.exit(1);
  }

  const results = {};

  // Import in order of dependencies
  results.contacts = await importContacts();
  results.organizations = await importOrganizations();

  // Build lookup for linking
  const contactLookup = await buildContactLookup();

  results.sponsors = await importSponsors(contactLookup);
  results.exhibitors = await importExhibitors(contactLookup);
  results.abstracts = await importAbstracts(contactLookup);
  results.funding = await importFunding();
  results.research = await importResearch();
  results.government = await importGovernment();
  results.international = await importInternational();

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('                    IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════');

  let totalCreated = 0, totalUpdated = 0, totalFailed = 0;

  for (const [name, result] of Object.entries(results)) {
    console.log(`   ${name}: ${result.created || 0} created, ${result.updated || 0} updated, ${result.failed || 0} failed`);
    totalCreated += result.created || 0;
    totalUpdated += result.updated || 0;
    totalFailed += result.failed || 0;
  }

  console.log('───────────────────────────────────────────────────────────');
  console.log(`   TOTAL: ${totalCreated} created, ${totalUpdated} updated, ${totalFailed} failed`);
  console.log('═══════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
