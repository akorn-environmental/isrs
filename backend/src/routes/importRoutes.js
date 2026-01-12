const express = require('express');
const router = express.Router();
const multer = require('multer');
const https = require('https');
const { pool } = require('../config/database');
const { requireAuth } = require('../middleware/auth');
const { parseFile } = require('../services/fileParser');
const {
  ALLOWED_CONTACT_COLUMNS,
  ALLOWED_ORGANIZATION_COLUMNS,
  filterToAllowedColumns
} = require('../utils/security');

// Google Sheets for ICSR 2024
const ICSR2024_SHEETS = {
  abstracts: {
    id: '1r5kk4wGLxUgu6CFzHKkRwTW03RLrII8okJC1Yorj5Wg',
    gid: '773870573',
    name: 'ICSR2024 Abstract Submissions'
  },
  sponsors: {
    id: '1gn7Q43Qj9pKhGQvGOYWB40Hk4Te2KQ70DDbYnQk_SJQ',
    gid: '195309022',
    name: 'Sponsors'
  },
  sponsorsExhibitors: {
    id: '1e0xB9EIxZ6zkDeJm2EHsLcKkPrN3OX1-23O_Kw1QN_0',
    gid: '1317895541',
    name: 'Sponsor/Exhibitor Info'
  }
};

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['xlsx', 'xls', 'csv', 'tsv', 'tab', 'docx', 'pdf'];
    const ext = file.originalname.toLowerCase().split('.').pop();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Allowed types: ${allowedTypes.join(', ')}`));
    }
  }
});

/**
 * POST /api/import/upload
 * Upload and parse a file to extract contacts
 */
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  const startTime = Date.now();

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log(`📁 Processing file: ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)} KB)`);

    // Parse the file
    const parseResult = await parseFile(req.file.buffer, req.file.originalname);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to parse file',
        details: parseResult.error
      });
    }

    // Create import log
    const logResult = await pool.query(
      `INSERT INTO import_logs
       (import_type, file_name, status, records_processed, started_at, completed_at, duration_seconds, imported_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        'file_upload',
        req.file.originalname,
        'completed',
        parseResult.contacts.length,
        new Date(startTime),
        new Date(),
        Math.round((Date.now() - startTime) / 1000),
        req.user.email
      ]
    );

    const importLogId = logResult.rows[0].id;

    console.log(`✅ Parsed ${parseResult.contacts.length} contacts from ${req.file.originalname}`);

    res.json({
      success: true,
      contacts: parseResult.contacts,
      file_name: req.file.originalname,
      file_size: req.file.size,
      import_log_id: importLogId,
      stats: {
        total_extracted: parseResult.contacts.length,
        file_type: req.file.originalname.split('.').pop()
      },
      raw_data: parseResult.rawText ? { preview: parseResult.rawText.substring(0, 500) } : null
    });
  } catch (error) {
    console.error('Import error:', error);

    // Log failed import
    try {
      await pool.query(
        `INSERT INTO import_logs
         (import_type, file_name, status, errors, started_at, completed_at, duration_seconds)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'file_upload',
          req.file?.originalname || 'unknown',
          'failed',
          JSON.stringify({ message: error.message }),
          new Date(startTime),
          new Date(),
          Math.round((Date.now() - startTime) / 1000)
        ]
      );
    } catch (logError) {
      console.error('Failed to create error log:', logError);
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process file',
      details: error.message
    });
  }
});

/**
 * POST /api/import/save
 * Save parsed contacts to database
 */
router.post('/save', requireAuth, async (req, res) => {
  try {
    const { contacts, import_log_id, source_provider, source_date, source_description } = req.body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ success: false, error: 'No contacts provided' });
    }

    console.log(`💾 Saving ${contacts.length} contacts to database...`);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    // Valid columns in contacts table
    const validColumns = [
      'email', 'first_name', 'last_name', 'full_name', 'organization_id', 'organization_name',
      'role', 'title', 'phone', 'country', 'state_province', 'city', 'expertise', 'interests',
      'notes', 'contact_type', 'tags', 'linkedin', 'website', 'status', 'is_international',
      'conference_role', 'engagement_score', 'research_interests',
      'source_file', 'import_batch', 'email_valid', 'profile_complete', 'job_title'
    ];

    // Process each contact
    for (let contactData of contacts) {
      try {
        // Filter to only valid columns
        contactData = Object.fromEntries(
          Object.entries(contactData).filter(([key]) => validColumns.includes(key))
        );

        // SECURITY: Filter to allowed columns only to prevent SQL injection
        const safeContactData = filterToAllowedColumns(contactData, ALLOWED_CONTACT_COLUMNS);

        // Check for duplicates by email
        if (safeContactData.email) {
          const existingResult = await pool.query(
            'SELECT id FROM contacts WHERE LOWER(email) = LOWER($1)',
            [safeContactData.email]
          );

          if (existingResult.rows.length > 0) {
            // Update existing contact - only use whitelisted columns
            const updates = [];
            const values = [];
            let paramCount = 1;

            for (const [key, value] of Object.entries(safeContactData)) {
              if (key !== 'email') { // Don't update email
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
              }
            }

            updates.push('updated_at = NOW()');
            values.push(safeContactData.email);

            await pool.query(
              `UPDATE contacts SET ${updates.join(', ')} WHERE LOWER(email) = LOWER($${paramCount})`,
              values
            );

            results.updated++;
            continue;
          }
        }

        // Create new contact - only use whitelisted columns
        const fields = Object.keys(safeContactData);
        const values = Object.values(safeContactData);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        await pool.query(
          `INSERT INTO contacts (${fields.join(', ')}, created_at, updated_at)
           VALUES (${placeholders}, NOW(), NOW())`,
          values
        );

        results.created++;
      } catch (error) {
        console.error(`Failed to save contact:`, error.message);
        results.failed++;
        results.errors.push({
          contact: contactData.full_name || contactData.email,
          error: error.message
        });
      }
    }

    // Update import log if provided
    if (import_log_id) {
      try {
        await pool.query(
          `UPDATE import_logs
           SET records_created = $1,
               records_updated = $2,
               records_skipped = $3,
               records_failed = $4,
               errors = $5
           WHERE id = $6`,
          [
            results.created,
            results.updated,
            results.skipped,
            results.failed,
            results.errors.length > 0 ? JSON.stringify(results.errors) : null,
            import_log_id
          ]
        );
      } catch (logError) {
        console.error('Failed to update import log:', logError);
      }
    }

    console.log(`✅ Import complete: ${results.created} created, ${results.updated} updated, ${results.failed} failed`);

    res.json({
      success: true,
      results,
      message: `Successfully imported ${results.created + results.updated} contacts`
    });
  } catch (error) {
    console.error('Save contacts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save contacts',
      details: error.message
    });
  }
});

/**
 * POST /api/import/save-organizations
 * Save parsed organizations to database
 */
router.post('/save-organizations', requireAuth, async (req, res) => {
  try {
    const { organizations, import_log_id, source_provider, source_date, source_description } = req.body;

    if (!Array.isArray(organizations) || organizations.length === 0) {
      return res.status(400).json({ success: false, error: 'No organizations provided' });
    }

    console.log(`💾 Saving ${organizations.length} organizations to database...`);

    const results = {
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    // Valid columns in organizations table
    const validOrgColumns = ['name', 'type', 'website', 'country', 'notes'];

    // Process each organization
    for (let orgData of organizations) {
      try {
        // Filter to only valid columns
        orgData = Object.fromEntries(
          Object.entries(orgData).filter(([key]) => validOrgColumns.includes(key))
        );

        // Check for duplicates by name (case-insensitive)
        if (orgData.name) {
          const existingResult = await pool.query(
            'SELECT id FROM organizations WHERE LOWER(name) = LOWER($1)',
            [orgData.name]
          );

          if (existingResult.rows.length > 0) {
            // Update existing organization
            const updates = [];
            const values = [];
            let paramCount = 1;

            for (const [key, value] of Object.entries(orgData)) {
              if (key !== 'name') {
                updates.push(`${key} = $${paramCount}`);
                values.push(value);
                paramCount++;
              }
            }

            updates.push('updated_at = NOW()');
            values.push(orgData.name);

            await pool.query(
              `UPDATE organizations SET ${updates.join(', ')} WHERE LOWER(name) = LOWER($${paramCount})`,
              values
            );

            results.updated++;
            continue;
          }
        }

        // Create new organization
        const fields = Object.keys(orgData);
        const values = Object.values(orgData);
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

        await pool.query(
          `INSERT INTO organizations (${fields.join(', ')}, created_at, updated_at)
           VALUES (${placeholders}, NOW(), NOW())`,
          values
        );

        results.created++;
      } catch (error) {
        console.error(`Failed to save organization:`, error.message);
        results.failed++;
        results.errors.push({
          organization: orgData.name,
          error: error.message
        });
      }
    }

    console.log(`✅ Import complete: ${results.created} created, ${results.updated} updated, ${results.failed} failed`);

    res.json({
      success: true,
      results,
      message: `Successfully imported ${results.created + results.updated} organizations`
    });
  } catch (error) {
    console.error('Save organizations error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save organizations',
      details: error.message
    });
  }
});

/**
 * GET /api/import/logs
 * Get import history
 */
router.get('/logs', requireAuth, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const countResult = await pool.query('SELECT COUNT(*) FROM import_logs');
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM import_logs
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [parseInt(limit), parseInt(offset)]
    );

    res.json({
      success: true,
      logs: result.rows,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get import logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch import logs' });
  }
});

/**
 * GET /api/import/logs/:id
 * Get single import log details
 */
router.get('/logs/:id', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM import_logs WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Import log not found' });
    }

    res.json({ success: true, log: result.rows[0] });
  } catch (error) {
    console.error('Get import log error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch import log' });
  }
});

/**
 * Fetch CSV from Google Sheets
 */
async function fetchGoogleSheet(sheetId, gid) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      // Handle redirects
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        https.get(redirectUrl, (redirectRes) => {
          let data = '';
          redirectRes.on('data', chunk => data += chunk);
          redirectRes.on('end', () => {
            if (redirectRes.statusCode === 200) {
              resolve(parseCSVData(data));
            } else {
              reject(new Error(`Failed to fetch sheet after redirect: ${redirectRes.statusCode}`));
            }
          });
        }).on('error', reject);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(parseCSVData(data));
        } else {
          reject(new Error(`Failed to fetch sheet: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Parse CSV data into rows
 */
function parseCSVData(csv) {
  const lines = csv.split('\n');
  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

/**
 * Parse a single CSV line handling quoted values
 */
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

/**
 * POST /api/import/icsr2024
 * Import ICSR 2024 data from Google Sheets (abstracts, sponsors, exhibitors)
 */
router.post('/icsr2024', requireAuth, async (req, res) => {
  const startTime = Date.now();
  const results = {
    abstracts: { success: false, count: 0, errors: [] },
    sponsors: { success: false, count: 0, errors: [] },
    exhibitors: { success: false, count: 0, errors: [] },
    contacts: { created: 0, updated: 0 },
    organizations: { created: 0, updated: 0 }
  };

  try {
    console.log('📊 Starting ICSR 2024 data import from Google Sheets...');

    // Get or create ICSR2024 conference
    let conferenceId;
    const confResult = await pool.query(
      `SELECT id FROM conferences WHERE name ILIKE '%ICSR%2024%' OR (name ILIKE '%ICSR%' AND year = 2024) LIMIT 1`
    );

    if (confResult.rows.length === 0) {
      // Create conference
      const newConf = await pool.query(`
        INSERT INTO conferences (name, year, location, start_date, end_date, status)
        VALUES ('ICSR 2024', 2024, 'Jekyll Island, Georgia', '2024-09-15', '2024-09-18', 'completed')
        RETURNING id
      `);
      conferenceId = newConf.rows[0].id;
      console.log('✅ Created ICSR 2024 conference');
    } else {
      conferenceId = confResult.rows[0].id;
      console.log('✅ Found ICSR 2024 conference');
    }

    // Import Abstracts
    console.log('\n📥 Importing abstracts...');
    try {
      const abstractData = await fetchGoogleSheet(ICSR2024_SHEETS.abstracts.id, ICSR2024_SHEETS.abstracts.gid);
      console.log(`   Fetched ${abstractData.rows.length} abstract rows`);
      console.log(`   Columns: ${abstractData.headers.slice(0, 5).join(', ')}...`);

      for (const row of abstractData.rows) {
        try {
          // Get email - try multiple column names
          const email = (row.Email || row.email || row['Email Address'] || row['Author Email'] || '').toLowerCase().trim();
          if (!email) continue;

          // Get name
          const firstName = row['First Name'] || row.FirstName || row['Author First Name'] || '';
          const lastName = row['Last Name'] || row.LastName || row['Author Last Name'] || '';
          const fullName = row['Full Name'] || row.Name || `${firstName} ${lastName}`.trim();
          const organization = row.Organization || row.Affiliation || row.Institution || '';
          const country = row.Country || '';

          // Get abstract details
          const title = row.Title || row['Abstract Title'] || row['Presentation Title'] || '';
          const abstractText = row.Abstract || row['Abstract Text'] || row['Abstract Body'] || '';
          const presentationType = row['Presentation Type'] || row.Type || 'oral';
          const coAuthors = row['Co-Authors'] || row.CoAuthors || row['Additional Authors'] || '';

          // Create/update contact
          const contactResult = await pool.query(`
            INSERT INTO contacts (email, first_name, last_name, full_name, organization_name, country, contact_type, source_provider, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, 'Academic', 'ICSR2024 Abstracts', NOW(), NOW())
            ON CONFLICT (email) DO UPDATE SET
              first_name = COALESCE(NULLIF(contacts.first_name, ''), EXCLUDED.first_name),
              last_name = COALESCE(NULLIF(contacts.last_name, ''), EXCLUDED.last_name),
              full_name = COALESCE(NULLIF(contacts.full_name, ''), EXCLUDED.full_name),
              organization_name = COALESCE(NULLIF(contacts.organization_name, ''), EXCLUDED.organization_name),
              country = COALESCE(NULLIF(contacts.country, ''), EXCLUDED.country),
              updated_at = NOW()
            RETURNING id, (xmax = 0) AS inserted
          `, [email, firstName, lastName, fullName, organization, country]);

          const contactId = contactResult.rows[0].id;
          if (contactResult.rows[0].inserted) {
            results.contacts.created++;
          } else {
            results.contacts.updated++;
          }

          // Create abstract record
          if (title) {
            await pool.query(`
              INSERT INTO abstracts (contact_id, conference_id, title, author_name, author_email, co_authors, abstract_text, presentation_type, submission_status, submitted_at)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'accepted', NOW())
              ON CONFLICT DO NOTHING
            `, [contactId, conferenceId, title, fullName, email, coAuthors, abstractText, presentationType]);
          }

          results.abstracts.count++;
        } catch (rowError) {
          results.abstracts.errors.push(rowError.message);
        }
      }
      results.abstracts.success = true;
      console.log(`   ✅ Imported ${results.abstracts.count} abstracts`);
    } catch (error) {
      console.error('   ❌ Abstract import error:', error.message);
      results.abstracts.errors.push(error.message);
    }

    // Import Sponsors
    console.log('\n📥 Importing sponsors...');
    try {
      const sponsorData = await fetchGoogleSheet(ICSR2024_SHEETS.sponsors.id, ICSR2024_SHEETS.sponsors.gid);
      console.log(`   Fetched ${sponsorData.rows.length} sponsor rows`);

      for (const row of sponsorData.rows) {
        try {
          const orgName = row.Organization || row['Organization Name'] || row.Company || row.Sponsor || '';
          if (!orgName) continue;

          const sponsorLevel = (row.Level || row['Sponsor Level'] || row.Tier || 'supporter').toLowerCase();
          const website = row.Website || row['Website URL'] || '';
          const logoUrl = row.Logo || row['Logo URL'] || '';
          const description = row.Description || row.About || '';
          const contactEmail = row['Contact Email'] || row.Email || '';
          const contactName = row['Contact Name'] || row.Contact || '';

          // Create/update organization
          const orgResult = await pool.query(`
            INSERT INTO organizations (name, website, type, description, created_at, updated_at)
            VALUES ($1, $2, 'company', $3, NOW(), NOW())
            ON CONFLICT (name) DO UPDATE SET
              website = COALESCE(NULLIF(organizations.website, ''), EXCLUDED.website),
              description = COALESCE(NULLIF(organizations.description, ''), EXCLUDED.description),
              updated_at = NOW()
            RETURNING id, (xmax = 0) AS inserted
          `, [orgName, website, description]);

          const orgId = orgResult.rows[0].id;
          if (orgResult.rows[0].inserted) {
            results.organizations.created++;
          } else {
            results.organizations.updated++;
          }

          // Create sponsor record
          await pool.query(`
            INSERT INTO conference_sponsors (conference_id, organization_id, organization_name, sponsor_level, logo_url, website_url, description, contact_name, contact_email, status, display_on_website)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed', true)
            ON CONFLICT DO NOTHING
          `, [conferenceId, orgId, orgName, sponsorLevel, logoUrl, website, description, contactName, contactEmail]);

          // Create contact if email provided
          if (contactEmail) {
            await pool.query(`
              INSERT INTO contacts (email, full_name, organization_name, contact_type, source_provider, created_at, updated_at)
              VALUES ($1, $2, $3, 'Private', 'ICSR2024 Sponsors', NOW(), NOW())
              ON CONFLICT (email) DO UPDATE SET
                full_name = COALESCE(NULLIF(contacts.full_name, ''), EXCLUDED.full_name),
                organization_name = COALESCE(NULLIF(contacts.organization_name, ''), EXCLUDED.organization_name),
                updated_at = NOW()
            `, [contactEmail.toLowerCase(), contactName, orgName]);
          }

          results.sponsors.count++;
        } catch (rowError) {
          results.sponsors.errors.push(rowError.message);
        }
      }
      results.sponsors.success = true;
      console.log(`   ✅ Imported ${results.sponsors.count} sponsors`);
    } catch (error) {
      console.error('   ❌ Sponsor import error:', error.message);
      results.sponsors.errors.push(error.message);
    }

    // Import Exhibitors from sponsors/exhibitors sheet
    console.log('\n📥 Importing exhibitors...');
    try {
      const exhibitorData = await fetchGoogleSheet(ICSR2024_SHEETS.sponsorsExhibitors.id, ICSR2024_SHEETS.sponsorsExhibitors.gid);
      console.log(`   Fetched ${exhibitorData.rows.length} exhibitor rows`);

      for (const row of exhibitorData.rows) {
        try {
          const orgName = row.Organization || row['Organization Name'] || row.Company || '';
          if (!orgName) continue;

          const boothNumber = row['Booth Number'] || row.Booth || '';
          const boothType = row['Booth Type'] || 'standard';
          const website = row.Website || '';
          const description = row.Description || '';
          const contactEmail = row['Contact Email'] || row.Email || '';
          const contactName = row['Contact Name'] || row.Contact || '';
          const category = row.Category || row['Exhibitor Category'] || '';

          // Create/update organization
          const orgResult = await pool.query(`
            INSERT INTO organizations (name, website, type, description, created_at, updated_at)
            VALUES ($1, $2, 'company', $3, NOW(), NOW())
            ON CONFLICT (name) DO UPDATE SET
              website = COALESCE(NULLIF(organizations.website, ''), EXCLUDED.website),
              updated_at = NOW()
            RETURNING id, (xmax = 0) AS inserted
          `, [orgName, website, description]);

          const orgId = orgResult.rows[0].id;
          if (orgResult.rows[0].inserted) {
            results.organizations.created++;
          }

          // Create exhibitor record
          await pool.query(`
            INSERT INTO conference_exhibitors (conference_id, organization_id, organization_name, booth_number, booth_type, exhibitor_category, website_url, description, contact_name, contact_email, status, display_on_website)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'confirmed', true)
            ON CONFLICT DO NOTHING
          `, [conferenceId, orgId, orgName, boothNumber, boothType, category, website, description, contactName, contactEmail]);

          results.exhibitors.count++;
        } catch (rowError) {
          results.exhibitors.errors.push(rowError.message);
        }
      }
      results.exhibitors.success = true;
      console.log(`   ✅ Imported ${results.exhibitors.count} exhibitors`);
    } catch (error) {
      console.error('   ❌ Exhibitor import error:', error.message);
      results.exhibitors.errors.push(error.message);
    }

    // Log the import
    const duration = Math.round((Date.now() - startTime) / 1000);
    await pool.query(`
      INSERT INTO import_logs (import_type, file_name, status, records_processed, records_created, records_updated, duration_seconds, imported_by, created_at)
      VALUES ('icsr2024_google_sheets', 'Google Sheets Import', 'completed', $1, $2, $3, $4, $5, NOW())
    `, [
      results.abstracts.count + results.sponsors.count + results.exhibitors.count,
      results.contacts.created + results.organizations.created,
      results.contacts.updated + results.organizations.updated,
      duration,
      req.user?.email || 'system'
    ]);

    console.log(`\n✅ ICSR 2024 import completed in ${duration}s`);

    res.json({
      success: true,
      results,
      duration_seconds: duration,
      message: `Imported ${results.abstracts.count} abstracts, ${results.sponsors.count} sponsors, ${results.exhibitors.count} exhibitors`
    });

  } catch (error) {
    console.error('❌ ICSR 2024 import failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      results
    });
  }
});

module.exports = router;
