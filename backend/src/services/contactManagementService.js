const { query } = require('../config/database');
const { parse } = require('csv-parse/sync');
const ExcelJS = require('exceljs');
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Parse CSV file buffer
 */
function parseCSV(buffer) {
  try {
    const content = buffer.toString('utf-8');
    const records = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
    return { success: true, data: records };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Parse Excel file buffer
 */
async function parseExcel(buffer) {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const worksheet = workbook.worksheets[0];
    const data = [];

    // Get headers from first row
    const headers = [];
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      headers[colNumber - 1] = cell.value;
    });

    // Convert rows to objects
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header row

      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        if (header) {
          rowData[header] = cell.value !== null ? cell.value : '';
        }
      });

      data.push(rowData);
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Use AI to map import columns to database fields
 */
async function mapFieldsWithAI(sampleData, existingFields) {
  try {
    const prompt = `You are a data mapping expert. Given sample data from an imported file and the target database schema, suggest the best field mappings.

Database fields for contacts:
- first_name (required)
- last_name (required)
- email (required, unique)
- organization_id (UUID, optional - will be matched by organization name)
- organization_name (text, for matching/creating organizations)
- country (text)
- member_type (text: 'board', 'member', 'affiliate', 'past_board', 'past_member')
- phone (text)
- position (text)
- expertise (text)
- notes (text)

Sample data from imported file (first row):
${JSON.stringify(sampleData, null, 2)}

Available columns in import:
${Object.keys(sampleData).join(', ')}

Please provide a JSON mapping object where:
- Keys are the import column names
- Values are the database field names
- Include a "confidence" score (0-1) for each mapping
- Include "suggestions" for any ambiguous or unmapped fields

Return ONLY valid JSON in this format:
{
  "mappings": {
    "Import Column": { "field": "database_field", "confidence": 0.95 }
  },
  "unmapped": ["column1", "column2"],
  "suggestions": ["suggestion1", "suggestion2"]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }

    const mapping = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      mapping: mapping.mappings || {},
      unmapped: mapping.unmapped || [],
      suggestions: mapping.suggestions || []
    };

  } catch (error) {
    console.error('AI field mapping error:', error);
    // Fallback to basic field matching
    return {
      success: true,
      mapping: generateBasicMapping(sampleData),
      unmapped: [],
      suggestions: ['AI mapping failed, using basic field name matching']
    };
  }
}

/**
 * Generate basic field mapping based on column name similarity
 */
function generateBasicMapping(sampleData) {
  const mapping = {};
  const columns = Object.keys(sampleData);

  const fieldMap = {
    'first_name': ['firstname', 'first', 'fname', 'given name', 'forename'],
    'last_name': ['lastname', 'last', 'lname', 'surname', 'family name'],
    'email': ['email', 'e-mail', 'mail', 'email address'],
    'organization_name': ['organization', 'org', 'company', 'institution', 'affiliation', 'organization name'],
    'country': ['country', 'nation', 'location'],
    'member_type': ['member type', 'type', 'membership', 'role', 'category'],
    'phone': ['phone', 'telephone', 'tel', 'mobile', 'cell'],
    'position': ['position', 'title', 'job title', 'role'],
    'expertise': ['expertise', 'specialization', 'specialty', 'skills', 'area'],
    'notes': ['notes', 'comments', 'remarks', 'description']
  };

  for (const col of columns) {
    const normalizedCol = col.toLowerCase().trim();
    for (const [dbField, variants] of Object.entries(fieldMap)) {
      if (variants.some(v => normalizedCol.includes(v))) {
        mapping[col] = { field: dbField, confidence: 0.8 };
        break;
      }
    }
  }

  return mapping;
}

/**
 * Find duplicate contacts based on email or name similarity
 */
async function findDuplicates(contacts, threshold = 0.85) {
  try {
    const duplicateGroups = [];

    // Find exact email matches
    const emailMap = new Map();
    for (const contact of contacts) {
      if (contact.email) {
        const email = contact.email.toLowerCase().trim();
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email).push(contact);
      }
    }

    // Add email duplicates to groups
    for (const [email, matches] of emailMap.entries()) {
      if (matches.length > 1) {
        duplicateGroups.push({
          type: 'email_match',
          confidence: 1.0,
          contacts: matches,
          reason: `Duplicate email: ${email}`
        });
      }
    }

    // Find name similarity matches
    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const similarity = calculateNameSimilarity(contacts[i], contacts[j]);
        if (similarity >= threshold) {
          duplicateGroups.push({
            type: 'name_match',
            confidence: similarity,
            contacts: [contacts[i], contacts[j]],
            reason: `Similar names (${Math.round(similarity * 100)}% match)`
          });
        }
      }
    }

    return { success: true, duplicateGroups };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Calculate name similarity between two contacts
 */
function calculateNameSimilarity(contact1, contact2) {
  const name1 = `${contact1.first_name || ''} ${contact1.last_name || ''}`.toLowerCase().trim();
  const name2 = `${contact2.first_name || ''} ${contact2.last_name || ''}`.toLowerCase().trim();

  if (!name1 || !name2) return 0;

  // Levenshtein distance
  const distance = levenshteinDistance(name1, name2);
  const maxLength = Math.max(name1.length, name2.length);
  return 1 - (distance / maxLength);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Match or create organization by name
 */
async function matchOrCreateOrganization(orgName, country) {
  if (!orgName) return null;

  try {
    // Try exact match first
    const exactMatch = await query(
      'SELECT id FROM organizations WHERE LOWER(name) = LOWER($1)',
      [orgName.trim()]
    );

    if (exactMatch.rows.length > 0) {
      return exactMatch.rows[0].id;
    }

    // Create new organization
    const result = await query(
      'INSERT INTO organizations (name, country) VALUES ($1, $2) RETURNING id',
      [orgName.trim(), country || null]
    );

    return result.rows[0].id;
  } catch (error) {
    console.error('Organization matching error:', error);
    return null;
  }
}

/**
 * Import contacts from parsed data
 */
async function importContacts(data, fieldMapping, options = {}) {
  const results = {
    total: data.length,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    warnings: []
  };

  for (let i = 0; i < data.length; i++) {
    try {
      const row = data[i];
      const contact = {};

      // Map fields according to mapping
      for (const [importCol, mapping] of Object.entries(fieldMapping)) {
        if (row[importCol] !== undefined && row[importCol] !== null && row[importCol] !== '') {
          contact[mapping.field] = row[importCol];
        }
      }

      // Validate required fields
      if (!contact.email) {
        results.skipped++;
        results.warnings.push(`Row ${i + 1}: Missing required field 'email'`);
        continue;
      }

      if (!contact.first_name || !contact.last_name) {
        results.skipped++;
        results.warnings.push(`Row ${i + 1}: Missing first_name or last_name`);
        continue;
      }

      // Match or create organization
      if (contact.organization_name) {
        contact.organization_id = await matchOrCreateOrganization(
          contact.organization_name,
          contact.country
        );
        delete contact.organization_name;
      }

      // Check if contact exists
      const existing = await query(
        'SELECT id FROM contacts WHERE LOWER(email) = LOWER($1)',
        [contact.email]
      );

      if (existing.rows.length > 0) {
        if (options.updateExisting) {
          // Update existing contact
          const updateFields = Object.keys(contact).filter(k => k !== 'email');
          const setClause = updateFields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
          const values = updateFields.map(field => contact[field]);
          values.push(existing.rows[0].id);

          await query(
            `UPDATE contacts SET ${setClause}, updated_at = NOW() WHERE id = $${values.length}`,
            values
          );
          results.updated++;
        } else {
          results.skipped++;
          results.warnings.push(`Row ${i + 1}: Contact with email ${contact.email} already exists`);
        }
      } else {
        // Insert new contact
        const fields = Object.keys(contact);
        const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(', ');
        const values = fields.map(field => contact[field]);

        await query(
          `INSERT INTO contacts (${fields.join(', ')}) VALUES (${placeholders})`,
          values
        );
        results.imported++;
      }

    } catch (error) {
      results.errors.push(`Row ${i + 1}: ${error.message}`);
    }
  }

  return { success: true, results };
}

/**
 * Export contacts to CSV format
 */
async function exportContactsToCSV(filters = {}) {
  try {
    let queryText = `
      SELECT
        c.id,
        c.first_name,
        c.last_name,
        c.email,
        c.phone,
        c.country,
        c.member_type,
        c.position,
        c.expertise,
        c.notes,
        o.name as organization_name,
        o.type as organization_type,
        c.created_at,
        c.updated_at
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (filters.country) {
      queryText += ` AND c.country = $${paramCount}`;
      params.push(filters.country);
      paramCount++;
    }

    if (filters.member_type) {
      queryText += ` AND c.member_type = $${paramCount}`;
      params.push(filters.member_type);
      paramCount++;
    }

    if (filters.organization_id) {
      queryText += ` AND c.organization_id = $${paramCount}`;
      params.push(filters.organization_id);
      paramCount++;
    }

    queryText += ' ORDER BY c.last_name, c.first_name';

    const result = await query(queryText, params);

    // Convert to CSV
    if (result.rows.length === 0) {
      return { success: true, csv: '', count: 0 };
    }

    const headers = Object.keys(result.rows[0]);
    const csvLines = [headers.join(',')];

    for (const row of result.rows) {
      const line = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        const strValue = String(value);
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
          return `"${strValue.replace(/"/g, '""')}"`;
        }
        return strValue;
      });
      csvLines.push(line.join(','));
    }

    const csv = csvLines.join('\n');
    return { success: true, csv, count: result.rows.length };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Merge two contacts
 */
async function mergeContacts(primaryId, secondaryId, fieldSelections) {
  try {
    // Get both contacts
    const primaryResult = await query('SELECT * FROM contacts WHERE id = $1', [primaryId]);
    const secondaryResult = await query('SELECT * FROM contacts WHERE id = $1', [secondaryId]);

    if (primaryResult.rows.length === 0 || secondaryResult.rows.length === 0) {
      return { success: false, error: 'One or both contacts not found' };
    }

    const primary = primaryResult.rows[0];
    const secondary = secondaryResult.rows[0];

    // Build merged contact based on field selections
    const merged = { ...primary };
    for (const [field, source] of Object.entries(fieldSelections)) {
      if (source === 'secondary') {
        merged[field] = secondary[field];
      }
    }

    // Update primary contact
    const updateFields = Object.keys(merged).filter(k => k !== 'id' && k !== 'created_at');
    const setClause = updateFields.map((field, idx) => `${field} = $${idx + 1}`).join(', ');
    const values = updateFields.map(field => merged[field]);
    values.push(primaryId);

    await query(
      `UPDATE contacts SET ${setClause}, updated_at = NOW() WHERE id = $${values.length}`,
      values
    );

    // Delete secondary contact
    await query('DELETE FROM contacts WHERE id = $1', [secondaryId]);

    return {
      success: true,
      message: 'Contacts merged successfully',
      mergedContact: merged
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Allowed contact columns for updates (whitelist for security)
 */
const ALLOWED_UPDATE_COLUMNS = new Set([
  // Basic info
  'full_name', 'first_name', 'last_name', 'email',
  'organization_name', 'organization_id', 'role', 'title', 'department', 'job_title',
  'phone', 'mobile_phone', 'fax',
  // Address
  'address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code', 'country',
  // Social/web
  'website', 'linkedin_url', 'linkedin', 'twitter_handle', 'orcid', 'researchgate', 'google_scholar',
  // Bio/notes
  'bio', 'biography', 'notes', 'tags', 'source', 'source_detail', 'photo_url',
  // Classification
  'contact_type', 'status', 'preferred_contact_method',
  'last_contacted', 'last_contacted_at', 'next_followup', 'next_followup_date',
  // Scoring
  'data_quality_score', 'ai_enhanced', 'ai_enhanced_at',
  'expertise', 'interests', 'research_interests',
  'email_valid', 'profile_complete', 'engagement_score', 'priority_level',
  'is_international', 'conference_role', 'member_type', 'position',
  // Conference attendance
  'icsr2024_attended', 'icsr2024_presented', 'icsr2024_presentation_title',
  'icsr2026_registered', 'icsr2026_registration_type', 'icsr2026_presentation_submitted',
  // Membership
  'member_since', 'membership_expires', 'membership_status', 'dues_paid',
  // Board/Leadership
  'is_board_member', 'board_title', 'board_term_start', 'board_term_end', 'is_past_board_member',
  // Advisory/Committee
  'is_ap_member', 'ap_role', 'committee_memberships',
  // Volunteer/Contractor
  'is_volunteer', 'volunteer_roles', 'volunteer_hours_ytd',
  'is_contractor', 'contractor_type', 'contract_start', 'contract_end',
  // Funder/Sponsor
  'is_funder', 'is_sponsor', 'funding_amount', 'funding_type', 'sponsor_level', 'sponsor_since',
  // Flexible roles
  'organizational_roles',
  // Privacy
  'preferred_language', 'timezone',
  'do_not_email', 'do_not_call', 'gdpr_consent', 'gdpr_consent_date'
]);

// Fields that should be stored as arrays
const ARRAY_FIELDS = new Set([
  'expertise', 'interests', 'tags',
  'committee_memberships', 'volunteer_roles', 'organizational_roles'
]);

/**
 * Map common field name variations to actual column names
 */
const FIELD_NAME_MAPPING = {
  'organization': 'organization_name',
  'org': 'organization_name',
  'org_name': 'organization_name',
  'state': 'state_province',
  'province': 'state_province',
  'zip': 'postal_code',
  'zip_code': 'postal_code',
  'zipcode': 'postal_code',
  'mobile': 'mobile_phone',
  'cell_phone': 'mobile_phone',
  'cell': 'mobile_phone',
  'twitter': 'twitter_handle',
  'type': 'contact_type'
};

/**
 * Bulk update contacts
 */
async function bulkUpdateContacts(contactIds, updates) {
  try {
    // Filter and validate fields
    const validUpdates = {};
    const skippedFields = [];

    for (const [key, value] of Object.entries(updates)) {
      // Skip null/undefined/empty values
      if (value === undefined || value === null || value === '') {
        continue;
      }

      // Map field name if needed
      let fieldName = key.toLowerCase();
      if (FIELD_NAME_MAPPING[fieldName]) {
        fieldName = FIELD_NAME_MAPPING[fieldName];
      }

      // Check if field is in allowed list
      if (ALLOWED_UPDATE_COLUMNS.has(fieldName)) {
        let processedValue = value;

        // Convert string to array for array fields
        if (ARRAY_FIELDS.has(fieldName) && typeof value === 'string') {
          // Split by comma and trim whitespace
          processedValue = value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        }

        validUpdates[fieldName] = processedValue;
      } else {
        skippedFields.push(key);
      }
    }

    if (skippedFields.length > 0) {
      console.log('bulkUpdateContacts: Skipped invalid fields:', skippedFields);
    }

    if (Object.keys(validUpdates).length === 0) {
      return { success: false, error: 'No valid update fields provided. Skipped: ' + skippedFields.join(', ') };
    }

    const updateFields = Object.keys(validUpdates);
    const setClause = updateFields.map((field, idx) => `"${field}" = $${idx + 1}`).join(', ');
    const values = updateFields.map(field => validUpdates[field]);
    values.push(contactIds);

    // Use text[] cast for UUID string IDs
    const result = await query(
      `UPDATE contacts
       SET ${setClause}, updated_at = NOW()
       WHERE id::text = ANY($${values.length}::text[])
       RETURNING id`,
      values
    );

    return {
      success: true,
      updated: result.rows.length,
      message: `Updated ${result.rows.length} contacts`,
      fieldsUpdated: updateFields
    };

  } catch (error) {
    console.error('bulkUpdateContacts error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Bulk delete contacts
 */
async function bulkDeleteContacts(contactIds) {
  try {
    const result = await query(
      'DELETE FROM contacts WHERE id = ANY($1) RETURNING id',
      [contactIds]
    );

    return {
      success: true,
      deleted: result.rows.length,
      message: `Deleted ${result.rows.length} contacts`
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Detect duplicates in existing database
 */
async function detectDatabaseDuplicates() {
  try {
    // Find email duplicates
    const emailDupes = await query(`
      SELECT email, array_agg(id) as contact_ids, COUNT(*) as count
      FROM contacts
      WHERE email IS NOT NULL AND email != ''
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1
    `);

    // Find name similarity duplicates
    const allContacts = await query(`
      SELECT id, first_name, last_name, email, organization_id
      FROM contacts
      ORDER BY last_name, first_name
    `);

    const nameDuplicates = [];
    const contacts = allContacts.rows;

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const similarity = calculateNameSimilarity(contacts[i], contacts[j]);
        if (similarity >= 0.9) {
          nameDuplicates.push({
            contacts: [contacts[i], contacts[j]],
            similarity: similarity,
            reason: `Similar names (${Math.round(similarity * 100)}% match)`
          });
        }
      }
    }

    return {
      success: true,
      emailDuplicates: emailDupes.rows.map(row => ({
        email: row.email,
        count: parseInt(row.count),
        contactIds: row.contact_ids
      })),
      nameDuplicates: nameDuplicates.slice(0, 50) // Limit to first 50 for performance
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = {
  parseCSV,
  parseExcel,
  mapFieldsWithAI,
  findDuplicates,
  importContacts,
  exportContactsToCSV,
  mergeContacts,
  bulkUpdateContacts,
  bulkDeleteContacts,
  detectDatabaseDuplicates
};
