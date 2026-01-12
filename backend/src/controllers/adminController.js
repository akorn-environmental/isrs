const { asyncHandler } = require('../middleware/errorHandler');
const {
  getComprehensiveStats,
  getICSRConferenceData,
  testDatabaseConnection,
  runDataEnhancement,
  performQuickCleanup,
  prepareDataExport,
  getBoardMembersList,
  getRegistrationStatistics
} = require('../services/adminService');

/**
 * GET /api/admin/stats
 * Get comprehensive statistics
 */
exports.getStats = asyncHandler(async (req, res) => {
  const result = await getComprehensiveStats();
  res.json(result);
});

/**
 * GET /api/admin/icsr-data
 * Get ICSR conference data
 */
exports.getICSRData = asyncHandler(async (req, res) => {
  const result = getICSRConferenceData();
  res.json(result);
});

/**
 * GET /api/admin/test-connection
 * Test database connection
 */
exports.testConnection = asyncHandler(async (req, res) => {
  const result = await testDatabaseConnection();
  res.json(result);
});

/**
 * POST /api/admin/enhance
 * Run data enhancement
 */
exports.runEnhancement = asyncHandler(async (req, res) => {
  const result = await runDataEnhancement();
  res.json(result);
});

/**
 * POST /api/admin/cleanup
 * Perform quick cleanup
 */
exports.performCleanup = asyncHandler(async (req, res) => {
  const result = await performQuickCleanup();
  res.json(result);
});

/**
 * GET /api/admin/export
 * Prepare data export
 */
exports.prepareExport = asyncHandler(async (req, res) => {
  const result = prepareDataExport();
  res.json(result);
});

/**
 * GET /api/admin/board-members
 * Get board members list
 */
exports.getBoardMembers = asyncHandler(async (req, res) => {
  const result = await getBoardMembersList();
  res.json(result);
});

/**
 * GET /api/admin/registration-stats
 * Get registration statistics
 */
exports.getRegistrationStats = asyncHandler(async (req, res) => {
  const result = getRegistrationStatistics();
  res.json(result);
});

const { query } = require('../config/database');

// ===== CONTACTS CRUD =====

/**
 * GET /api/admin/contacts
 * Get all contacts
 */
exports.getContacts = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT c.*,
           COALESCE(c.organization_name, o.name) as organization_name
    FROM contacts c
    LEFT JOIN organizations o ON c.organization_id = o.id
    ORDER BY c.last_name, c.first_name
  `);
  res.json({ success: true, data: result.rows });
});

/**
 * POST /api/admin/contacts
 * Create a new contact
 */
exports.createContact = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, organization_id, country, member_type } = req.body;
  const result = await query(`
    INSERT INTO contacts (first_name, last_name, email, organization_id, country, member_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [first_name, last_name, email, organization_id, country, member_type]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * PUT /api/admin/contacts/:id
 * Update a contact
 */
exports.updateContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email, organization_id, country, member_type } = req.body;
  const result = await query(`
    UPDATE contacts
    SET first_name = $1, last_name = $2, email = $3, organization_id = $4, country = $5, member_type = $6, updated_at = NOW()
    WHERE id = $7
    RETURNING *
  `, [first_name, last_name, email, organization_id, country, member_type, id]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * DELETE /api/admin/contacts/:id
 * Delete a contact
 */
exports.deleteContact = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM contacts WHERE id = $1', [id]);
  res.json({ success: true, message: 'Contact deleted successfully' });
});

// ===== ORGANIZATIONS CRUD =====

/**
 * GET /api/admin/organizations
 * Get all organizations
 */
exports.getOrganizations = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT * FROM organizations
    ORDER BY name
  `);
  res.json({ success: true, data: result.rows });
});

/**
 * POST /api/admin/organizations
 * Create a new organization
 */
exports.createOrganization = asyncHandler(async (req, res) => {
  const { name, type, country, website, notes } = req.body;
  const result = await query(`
    INSERT INTO organizations (name, type, country, website, notes)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [name, type, country, website, notes]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * PUT /api/admin/organizations/:id
 * Update an organization
 */
exports.updateOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, type, country, website, notes } = req.body;
  const result = await query(`
    UPDATE organizations
    SET name = $1, type = $2, country = $3, website = $4, notes = $5, updated_at = NOW()
    WHERE id = $6
    RETURNING *
  `, [name, type, country, website, notes, id]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * DELETE /api/admin/organizations/:id
 * Delete an organization
 */
exports.deleteOrganization = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM organizations WHERE id = $1', [id]);
  res.json({ success: true, message: 'Organization deleted successfully' });
});

// ===== BOARD VOTES CRUD =====

/**
 * GET /api/admin/votes
 * Get all board votes
 */
exports.getVotes = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT * FROM board_votes
    ORDER BY vote_date DESC
  `);
  res.json({ success: true, data: result.rows });
});

/**
 * POST /api/admin/votes
 * Create a new board vote
 */
exports.createVote = asyncHandler(async (req, res) => {
  const { motion, vote_date, yes_count, no_count, abstain_count, quorum_met, status } = req.body;
  const result = await query(`
    INSERT INTO board_votes (motion, vote_date, yes_count, no_count, abstain_count, quorum_met, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `, [motion, vote_date, yes_count, no_count, abstain_count, quorum_met, status]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * PUT /api/admin/votes/:id
 * Update a board vote
 */
exports.updateVote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { motion, vote_date, yes_count, no_count, abstain_count, quorum_met, status } = req.body;
  const result = await query(`
    UPDATE board_votes
    SET motion = $1, vote_date = $2, yes_count = $3, no_count = $4, abstain_count = $5, quorum_met = $6, status = $7, updated_at = NOW()
    WHERE id = $8
    RETURNING *
  `, [motion, vote_date, yes_count, no_count, abstain_count, quorum_met, status, id]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * DELETE /api/admin/votes/:id
 * Delete a board vote
 */
exports.deleteVote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM board_votes WHERE id = $1', [id]);
  res.json({ success: true, message: 'Vote deleted successfully' });
});

// ===== CONFERENCES CRUD =====

/**
 * GET /api/admin/conferences
 * Get all conferences
 */
exports.getConferences = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT * FROM conferences
    ORDER BY start_date DESC
  `);
  res.json({ success: true, data: result.rows });
});

/**
 * POST /api/admin/conferences
 * Create a new conference
 */
exports.createConference = asyncHandler(async (req, res) => {
  const { name, location, start_date, end_date, website } = req.body;
  const result = await query(`
    INSERT INTO conferences (name, location, start_date, end_date, website)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [name, location, start_date, end_date, website]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * PUT /api/admin/conferences/:id
 * Update a conference
 */
exports.updateConference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, location, start_date, end_date, website } = req.body;
  const result = await query(`
    UPDATE conferences
    SET name = $1, location = $2, start_date = $3, end_date = $4, website = $5, updated_at = NOW()
    WHERE id = $6
    RETURNING *
  `, [name, location, start_date, end_date, website, id]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * DELETE /api/admin/conferences/:id
 * Delete a conference
 */
exports.deleteConference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM conferences WHERE id = $1', [id]);
  res.json({ success: true, message: 'Conference deleted successfully' });
});

// ===== FUNDING PROSPECTS CRUD =====

/**
 * GET /api/admin/funding
 * Get all funding prospects with lead and ICSR funding details
 */
exports.getFunding = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      f.*,
      o.name as organization_name,
      (
        SELECT json_agg(json_build_object(
          'id', c.id,
          'name', COALESCE(c.first_name || ' ' || c.last_name, c.email),
          'email', c.email
        ))
        FROM contacts c
        WHERE c.id = ANY(f.lead_contact_ids)
      ) as assigned_leads
    FROM funding_prospects f
    LEFT JOIN organizations o ON f.organization_id = o.id
    ORDER BY f.created_at DESC
  `);
  res.json({ success: true, data: result.rows });
});

/**
 * POST /api/admin/funding
 * Create a new funding prospect
 */
exports.createFunding = asyncHandler(async (req, res) => {
  const { organization_id, contact_person, amount, status, date_contacted, notes } = req.body;
  const result = await query(`
    INSERT INTO funding_prospects (organization_id, contact_person, amount, status, date_contacted, notes)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [organization_id, contact_person, amount, status, date_contacted, notes]);
  res.json({ success: true, data: result.rows[0] });
});

/**
 * PUT /api/admin/funding/:id
 * Update a funding prospect
 */
exports.updateFunding = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    organization_id,
    contact_person,
    amount,
    status,
    date_contacted,
    notes,
    has_funded_icsr,
    icsr_funding_years,
    icsr_funding_notes
  } = req.body;

  const result = await query(`
    UPDATE funding_prospects
    SET organization_id = $1,
        contact_person = $2,
        amount = $3,
        status = $4,
        date_contacted = $5,
        notes = $6,
        has_funded_icsr = $7,
        icsr_funding_years = $8,
        icsr_funding_notes = $9,
        updated_at = NOW()
    WHERE id = $10
    RETURNING *
  `, [
    organization_id,
    contact_person,
    amount,
    status,
    date_contacted,
    notes,
    has_funded_icsr || false,
    icsr_funding_years || null,
    icsr_funding_notes || null,
    id
  ]);

  res.json({ success: true, data: result.rows[0] });
});

/**
 * DELETE /api/admin/funding/:id
 * Delete a funding prospect
 */
exports.deleteFunding = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM funding_prospects WHERE id = $1', [id]);
  res.json({ success: true, message: 'Funding prospect deleted successfully' });
});

/**
 * GET /api/admin/funding/available-leads
 * Get available board members and contacts for lead assignment
 */
exports.getAvailableLeads = asyncHandler(async (req, res) => {
  // Get all admin users (board members, advisory panel members) for lead assignment
  try {
    const result = await query(`
      SELECT
        c.id::text,
        c.first_name,
        c.last_name,
        c.email,
        c.title as organization,
        COALESCE(c.first_name || ' ' || c.last_name, c.email, 'Unknown') as display_name,
        au.role,
        au.access_level
      FROM admin_users au
      LEFT JOIN contacts c ON au.email = c.email
      WHERE au.email IS NOT NULL
      ORDER BY
        CASE
          WHEN c.role = 'Board Chair' THEN 1
          WHEN c.role = 'Board Vice Chair' THEN 2
          WHEN c.role = 'Board Member' THEN 3
          WHEN c.role = 'AP Member' THEN 4
          ELSE 5
        END,
        c.last_name NULLS LAST,
        c.first_name NULLS LAST
    `);

    res.json({ success: true, data: result.rows || [] });
  } catch (error) {
    console.error('Error in getAvailableLeads:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available leads',
      message: error.message
    });
  }
});

/**
 * POST /api/admin/funding/:id/assign-leads
 * Assign contact leads to a funding prospect
 */
exports.assignFundingLeads = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { lead_contact_ids } = req.body; // Array of contact UUIDs

  if (!lead_contact_ids || !Array.isArray(lead_contact_ids)) {
    return res.status(400).json({
      success: false,
      error: 'lead_contact_ids array is required'
    });
  }

  // Update the funding prospect with lead contact IDs
  await query(`
    UPDATE funding_prospects
    SET lead_contact_ids = $1, updated_at = NOW()
    WHERE id = $2
  `, [lead_contact_ids, id]);

  // Insert/update junction table records
  for (const contactId of lead_contact_ids) {
    await query(`
      INSERT INTO funding_prospect_leads (funding_prospect_id, contact_id, assigned_by)
      VALUES ($1, $2, $3)
      ON CONFLICT (funding_prospect_id, contact_id)
      DO UPDATE SET assigned_at = NOW(), assigned_by = $3
    `, [id, contactId, req.user.email]);
  }

  // Get the updated funding prospect with lead details
  const result = await query(`
    SELECT fp.*,
           o.name as organization_name,
           ARRAY_AGG(DISTINCT jsonb_build_object(
             'id', c.id,
             'name', c.first_name || ' ' || c.last_name,
             'email', c.email,
             'position', c.position
           )) FILTER (WHERE c.id IS NOT NULL) as leads
    FROM funding_prospects fp
    LEFT JOIN organizations o ON fp.organization_id = o.id
    LEFT JOIN LATERAL unnest(fp.lead_contact_ids) AS lead_id ON true
    LEFT JOIN contacts c ON c.id = lead_id
    WHERE fp.id = $1
    GROUP BY fp.id, o.name
  `, [id]);

  res.json({ success: true, data: result.rows[0] });
});

/**
 * POST /api/admin/funding/:id/notify-leads
 * Send email notification to assigned leads
 */
exports.notifyFundingLeads = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get funding prospect with organization and leads
  const prospectResult = await query(`
    SELECT fp.*,
           o.name as organization_name,
           o.website,
           fp.lead_contact_ids
    FROM funding_prospects fp
    LEFT JOIN organizations o ON fp.organization_id = o.id
    WHERE fp.id = $1
  `, [id]);

  if (prospectResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Funding prospect not found'
    });
  }

  const prospect = prospectResult.rows[0];

  if (!prospect.lead_contact_ids || prospect.lead_contact_ids.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No leads assigned to this funding prospect'
    });
  }

  // Get lead contact details
  const leadsResult = await query(`
    SELECT id, first_name, last_name, email
    FROM contacts
    WHERE id = ANY($1) AND email IS NOT NULL
  `, [prospect.lead_contact_ids]);

  const leads = leadsResult.rows;

  if (leads.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No valid email addresses found for assigned leads'
    });
  }

  // Send email to each lead
  const { sendBulkEmail } = require('../services/emailService');

  const emailData = {
    subject: `ISRS Funding Opportunity: ${prospect.organization_name}`,
    html: `
      <h2>Funding Opportunity Assignment</h2>
      <p>You have been assigned as a lead for pursuing funding from <strong>${prospect.organization_name}</strong>.</p>

      <h3>Prospect Details:</h3>
      <ul>
        <li><strong>Organization:</strong> ${prospect.organization_name}</li>
        ${prospect.website ? `<li><strong>Website:</strong> <a href="${prospect.website}">${prospect.website}</a></li>` : ''}
        ${prospect.amount ? `<li><strong>Target Amount:</strong> $${Number(prospect.amount).toLocaleString()}</li>` : ''}
        <li><strong>Status:</strong> ${prospect.status}</li>
        ${prospect.date_contacted ? `<li><strong>Last Contacted:</strong> ${new Date(prospect.date_contacted).toLocaleDateString()}</li>` : ''}
      </ul>

      ${prospect.notes ? `<h3>Notes:</h3><p>${prospect.notes}</p>` : ''}

      <p>Please review this opportunity and take appropriate action. You can update the status and add notes in the ISRS admin dashboard.</p>

      <p><a href="https://isrs-database-backend.onrender.com/admin/funding.html">View in Admin Dashboard</a></p>

      <p><em>This is an automated notification from the ISRS Funding Management System.</em></p>
    `
  };

  await sendBulkEmail(leads.map(l => l.email), emailData.subject, emailData.html);

  // Update notification tracking
  await query(`
    UPDATE funding_prospects
    SET last_notification_sent = NOW()
    WHERE id = $1
  `, [id]);

  await query(`
    UPDATE funding_prospect_leads
    SET notification_sent = TRUE, notification_sent_at = NOW()
    WHERE funding_prospect_id = $1 AND contact_id = ANY($2)
  `, [id, prospect.lead_contact_ids]);

  res.json({
    success: true,
    message: `Notification sent to ${leads.length} lead(s)`,
    recipients: leads.map(l => ({ name: `${l.first_name} ${l.last_name}`, email: l.email }))
  });
});

const { sendBulkEmail } = require('../services/emailService');
const { executeAIQuery, generateInsights } = require('../services/aiService');
const {
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
} = require('../services/contactManagementService');

/**
 * POST /api/admin/send-email
 * Send email to multiple contacts
 */
exports.sendEmail = asyncHandler(async (req, res) => {
  const { recipients, subject, body } = req.body;

  // Check permissions
  if (!req.user || !['admin', 'board'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions to send emails'
    });
  }

  // Validate input
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Recipients array is required and must not be empty'
    });
  }

  if (!subject || !body) {
    return res.status(400).json({
      success: false,
      error: 'Subject and body are required'
    });
  }

  try {
    // Send emails
    const results = await sendBulkEmail({
      recipients,
      subject,
      body,
      senderEmail: req.user.email,
      senderName: req.user.full_name || req.user.email
    });

    // Log to audit
    await query(`
      INSERT INTO audit_log (action, user_email, details, created_at)
      VALUES ($1, $2, $3, NOW())
    `, ['send_email', req.user.email, JSON.stringify({
      recipientCount: recipients.length,
      subject: subject,
      sent: results.sent.length,
      failed: results.failed.length
    })]);

    res.json({
      success: true,
      message: `Email sent successfully`,
      results: {
        total: results.total,
        sent: results.sent.length,
        failed: results.failed.length,
        failedEmails: results.failed.map(f => f.email)
      }
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send emails'
    });
  }
});

/**
 * POST /api/admin/ai-query
 * Query database using natural language (Admin only)
 */
exports.aiQuery = asyncHandler(async (req, res) => {
  const { question, includeInsights } = req.body;

  // Check permissions - admin only
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'AI queries are restricted to administrators only'
    });
  }

  if (!question || typeof question !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Question is required and must be a string'
    });
  }

  try {
    // Execute AI query
    const results = await executeAIQuery(question);

    // Optionally generate insights
    let insights = null;
    if (includeInsights && results.success && results.rowCount > 0) {
      insights = await generateInsights(question, results);
    }

    // Log to audit
    await query(`
      INSERT INTO audit_log (action, user_email, details, created_at)
      VALUES ($1, $2, $3, NOW())
    `, ['ai_query', req.user.email, JSON.stringify({
      question: question,
      success: results.success,
      rowCount: results.rowCount
    })]);

    res.json({
      ...results,
      insights
    });

  } catch (error) {
    console.error('AI query error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute AI query',
      question
    });
  }
});

// ===== CONTACT MANAGEMENT =====

/**
 * POST /api/admin/contacts/import/analyze
 * Analyze uploaded file and suggest field mappings
 */
exports.analyzeImportFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  const fileBuffer = req.file.buffer;
  const fileType = req.file.mimetype;

  // Parse file based on type
  let parsed;
  if (fileType === 'text/csv' || req.file.originalname.endsWith('.csv')) {
    parsed = parseCSV(fileBuffer);
  } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             fileType === 'application/vnd.ms-excel' ||
             req.file.originalname.endsWith('.xlsx') ||
             req.file.originalname.endsWith('.xls')) {
    parsed = await parseExcel(fileBuffer);
  } else {
    return res.status(400).json({
      success: false,
      error: 'Unsupported file type. Please upload CSV or Excel file.'
    });
  }

  if (!parsed.success) {
    return res.status(400).json({ success: false, error: parsed.error });
  }

  if (parsed.data.length === 0) {
    return res.status(400).json({ success: false, error: 'File is empty' });
  }

  // Use AI to map fields
  const mapping = await mapFieldsWithAI(parsed.data[0], []);

  // Find duplicates in import data
  const duplicates = await findDuplicates(parsed.data);

  res.json({
    success: true,
    rowCount: parsed.data.length,
    preview: parsed.data.slice(0, 5), // First 5 rows
    columns: Object.keys(parsed.data[0]),
    suggestedMapping: mapping.mapping,
    unmapped: mapping.unmapped,
    suggestions: mapping.suggestions,
    duplicates: duplicates.duplicateGroups || [],
    data: parsed.data // Include full data for import
  });
});

/**
 * POST /api/admin/contacts/import/execute
 * Execute the import with user-confirmed mappings
 */
exports.executeContactImport = asyncHandler(async (req, res) => {
  const { data, fieldMapping, options } = req.body;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({ success: false, error: 'No data provided for import' });
  }

  if (!fieldMapping || typeof fieldMapping !== 'object') {
    return res.status(400).json({ success: false, error: 'Field mapping is required' });
  }

  // Execute import
  const result = await importContacts(data, fieldMapping, options || {});

  // Log to audit
  await query(`
    INSERT INTO audit_log (action, user_email, details, created_at)
    VALUES ($1, $2, $3, NOW())
  `, ['import_contacts', req.user.email, JSON.stringify({
    totalRows: data.length,
    imported: result.results.imported,
    updated: result.results.updated,
    skipped: result.results.skipped,
    errors: result.results.errors.length
  })]);

  res.json({
    success: true,
    message: `Import completed: ${result.results.imported} imported, ${result.results.updated} updated, ${result.results.skipped} skipped`,
    results: result.results
  });
});

/**
 * GET /api/admin/contacts/export
 * Export contacts to CSV
 */
exports.exportContacts = asyncHandler(async (req, res) => {
  const filters = {
    country: req.query.country,
    member_type: req.query.member_type,
    organization_id: req.query.organization_id
  };

  const result = await exportContactsToCSV(filters);

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  // Log to audit
  await query(`
    INSERT INTO audit_log (action, user_email, details, created_at)
    VALUES ($1, $2, $3, NOW())
  `, ['export_contacts', req.user.email, JSON.stringify({
    count: result.count,
    filters
  })]);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=contacts-export-${Date.now()}.csv`);
  res.send(result.csv);
});

/**
 * GET /api/admin/contacts/duplicates
 * Detect duplicate contacts in database
 */
exports.detectDuplicates = asyncHandler(async (req, res) => {
  const result = await detectDatabaseDuplicates();

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  res.json({
    success: true,
    emailDuplicates: result.emailDuplicates,
    nameDuplicates: result.nameDuplicates,
    totalEmailDupes: result.emailDuplicates.length,
    totalNameDupes: result.nameDuplicates.length
  });
});

/**
 * POST /api/admin/contacts/merge
 * Merge two contacts
 */
exports.mergeContacts = asyncHandler(async (req, res) => {
  const { primaryId, secondaryId, fieldSelections } = req.body;

  if (!primaryId || !secondaryId) {
    return res.status(400).json({
      success: false,
      error: 'Both primaryId and secondaryId are required'
    });
  }

  if (!fieldSelections || typeof fieldSelections !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Field selections are required'
    });
  }

  const result = await mergeContacts(primaryId, secondaryId, fieldSelections);

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  // Log to audit
  await query(`
    INSERT INTO audit_log (action, user_email, details, created_at)
    VALUES ($1, $2, $3, NOW())
  `, ['merge_contacts', req.user.email, JSON.stringify({
    primaryId,
    secondaryId,
    fieldSelections
  })]);

  res.json({
    success: true,
    message: result.message,
    contact: result.mergedContact
  });
});

/**
 * POST /api/admin/contacts/bulk-update
 * Bulk update multiple contacts
 */
exports.bulkUpdateContacts = asyncHandler(async (req, res) => {
  const { contactIds, updates } = req.body;

  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Contact IDs array is required and must not be empty'
    });
  }

  if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Updates object is required and must not be empty'
    });
  }

  const result = await bulkUpdateContacts(contactIds, updates);

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  // Log to audit
  await query(`
    INSERT INTO audit_log (action, user_email, details, created_at)
    VALUES ($1, $2, $3, NOW())
  `, ['bulk_update_contacts', req.user.email, JSON.stringify({
    count: contactIds.length,
    updates
  })]);

  res.json({
    success: true,
    message: result.message,
    updated: result.updated
  });
});

/**
 * POST /api/admin/contacts/bulk-delete
 * Bulk delete multiple contacts
 */
exports.bulkDeleteContacts = asyncHandler(async (req, res) => {
  const { contactIds } = req.body;

  if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Contact IDs array is required and must not be empty'
    });
  }

  // Require confirmation for bulk delete
  if (!req.body.confirmed) {
    return res.status(400).json({
      success: false,
      error: 'Bulk delete requires confirmation. Set confirmed: true in request body.'
    });
  }

  const result = await bulkDeleteContacts(contactIds);

  if (!result.success) {
    return res.status(500).json({ success: false, error: result.error });
  }

  // Log to audit
  await query(`
    INSERT INTO audit_log (action, user_email, details, created_at)
    VALUES ($1, $2, $3, NOW())
  `, ['bulk_delete_contacts', req.user.email, JSON.stringify({
    count: contactIds.length
  })]);

  res.json({
    success: true,
    message: result.message,
    deleted: result.deleted
  });
});

// ===== CONFERENCE REGISTRATION MANAGEMENT =====

/**
 * GET /api/admin/conference/registrations
 * Get all conference registrations
 */
exports.getConferenceRegistrations = asyncHandler(async (req, res) => {
  const { conference_id, payment_status, status } = req.query;

  let queryStr = `
    SELECT
      cr.*,
      ap.first_name,
      ap.last_name,
      ap.user_email,
      ap.organization_name,
      ap.country,
      ce.name as conference_name,
      ce.year as conference_year
    FROM conference_registrations cr
    JOIN attendee_profiles ap ON cr.attendee_id = ap.id
    JOIN conference_editions ce ON cr.conference_id = ce.id
    WHERE 1=1
  `;

  const params = [];
  let paramIndex = 1;

  if (conference_id) {
    queryStr += ` AND cr.conference_id = $${paramIndex}`;
    params.push(conference_id);
    paramIndex++;
  }

  if (payment_status) {
    queryStr += ` AND cr.payment_status = $${paramIndex}`;
    params.push(payment_status);
    paramIndex++;
  }

  if (status) {
    queryStr += ` AND cr.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  queryStr += ` ORDER BY cr.registration_date DESC`;

  const result = await query(queryStr, params);
  res.json({ success: true, data: result.rows });
});

/**
 * GET /api/admin/conference/stats
 * Get conference registration statistics
 */
exports.getConferenceStats = asyncHandler(async (req, res) => {
  const { conference_id } = req.query;

  const statsQuery = `
    SELECT
      COUNT(*) as total_registrations,
      COUNT(CASE WHEN payment_status = 'paid' THEN 1 END) as paid_registrations,
      COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN registration_type = 'early_bird' THEN 1 END) as early_bird_count,
      COUNT(CASE WHEN registration_type = 'regular' THEN 1 END) as regular_count,
      COUNT(CASE WHEN registration_type = 'student' THEN 1 END) as student_count,
      COUNT(CASE WHEN is_virtual = true THEN 1 END) as virtual_attendees,
      COUNT(CASE WHEN is_virtual = false THEN 1 END) as in_person_attendees,
      COUNT(CASE WHEN is_presenter = true THEN 1 END) as presenters,
      SUM(CASE WHEN payment_status = 'paid' THEN registration_fee ELSE 0 END) as total_revenue,
      SUM(CASE WHEN payment_status = 'pending' THEN registration_fee ELSE 0 END) as pending_revenue
    FROM conference_registrations
    WHERE conference_id = $1
  `;

  const result = await query(statsQuery, [conference_id]);

  res.json({ success: true, data: result.rows[0] });
});

/**
 * PUT /api/admin/conference/registration/:id/payment-status
 * Update registration payment status
 */
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { payment_status, payment_method, payment_reference } = req.body;

  await query(`
    UPDATE conference_registrations
    SET
      payment_status = $1,
      payment_method = $2,
      payment_reference = $3,
      payment_date = CASE WHEN $1 = 'paid' THEN NOW() ELSE payment_date END,
      status = CASE WHEN $1 = 'paid' THEN 'confirmed' ELSE status END,
      updated_at = NOW()
    WHERE id = $4
  `, [payment_status, payment_method, payment_reference, id]);

  res.json({ success: true, message: 'Payment status updated successfully' });
});

/**
 * GET /api/admin/conference/attendees
 * Get all attendee profiles
 */
exports.getAttendeeProfiles = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      ap.*,
      COUNT(cr.id) as registration_count
    FROM attendee_profiles ap
    LEFT JOIN conference_registrations cr ON ap.id = cr.attendee_id
    GROUP BY ap.id
    ORDER BY ap.last_name, ap.first_name
  `);

  res.json({ success: true, data: result.rows });
});

/**
 * GET /api/admin/conference/payments
 * Get payment transactions
 */
exports.getPaymentTransactions = asyncHandler(async (req, res) => {
  const { registration_id } = req.query;

  let queryStr = `
    SELECT
      pt.*,
      cr.registration_number,
      ap.first_name,
      ap.last_name,
      ap.user_email
    FROM payment_transactions pt
    JOIN conference_registrations cr ON pt.registration_id = cr.id
    JOIN attendee_profiles ap ON cr.attendee_id = ap.id
    WHERE 1=1
  `;

  const params = [];

  if (registration_id) {
    queryStr += ` AND pt.registration_id = $1`;
    params.push(registration_id);
  }

  queryStr += ` ORDER BY pt.transaction_date DESC`;

  const result = await query(queryStr, params);
  res.json({ success: true, data: result.rows });
});

// ===== DATA ENRICHMENT =====

/**
 * GET /api/admin/data-quality-report
 * Get comprehensive data quality metrics
 */
exports.getDataQualityReport = asyncHandler(async (req, res) => {
  const result = await query('SELECT * FROM generate_data_quality_report()');

  res.json({
    success: true,
    metrics: result.rows,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/admin/contacts/enrich-preview
 * Preview enrichment suggestions without applying changes
 */
exports.previewContactEnrichment = asyncHandler(async (req, res) => {
  // Get contacts that need enrichment
  const contactsResult = await query(`
    SELECT
      c.id,
      c.email,
      c.first_name,
      c.last_name,
      c.organization_id,
      c.organization_name,
      o.name as current_org_name
    FROM contacts c
    LEFT JOIN organizations o ON c.organization_id = o.id
    WHERE c.email IS NOT NULL
  `);

  const enrichmentSuggestions = [];
  const organizationsToCreate = [];
  const orgMap = new Map();

  // Get all existing organizations
  const orgsResult = await query('SELECT id, name, lower(name) as name_lower FROM organizations');
  orgsResult.rows.forEach(org => {
    orgMap.set(org.name_lower, org);
  });

  for (const contact of contactsResult.rows) {
    const suggestion = {
      contactId: contact.id,
      email: contact.email,
      currentData: {
        firstName: contact.first_name,
        lastName: contact.last_name,
        organizationName: contact.organization_name
      },
      suggestedUpdates: {}
    };

    // Parse email for name suggestions
    const nameResult = await query('SELECT * FROM parse_email_name($1)', [contact.email]);
    if (nameResult.rows.length > 0) {
      const { first_name, last_name } = nameResult.rows[0];

      if (!contact.first_name && first_name) {
        suggestion.suggestedUpdates.first_name = first_name;
      }
      if (!contact.last_name && last_name) {
        suggestion.suggestedUpdates.last_name = last_name;
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
          suggestion.suggestedUpdates.organization_name = suggestedOrg.org_name;

          // Check if organization exists
          const existingOrg = orgMap.get(suggestedOrg.org_name.toLowerCase());
          if (existingOrg) {
            suggestion.suggestedUpdates.organization_id = existingOrg.id;
          } else {
            // Add to organizations to create
            if (!organizationsToCreate.find(o => o.name === suggestedOrg.org_name)) {
              organizationsToCreate.push({
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

    // Only add if there are suggestions
    if (Object.keys(suggestion.suggestedUpdates).length > 0) {
      enrichmentSuggestions.push(suggestion);
    }
  }

  res.json({
    success: true,
    totalContacts: contactsResult.rows.length,
    contactsToEnrich: enrichmentSuggestions.length,
    organizationsToCreate: organizationsToCreate.length,
    suggestions: enrichmentSuggestions.slice(0, 50), // First 50 for preview
    newOrganizations: organizationsToCreate,
    message: `Found ${enrichmentSuggestions.length} contacts that can be enriched`
  });
});

/**
 * POST /api/admin/contacts/enrich-apply
 * Apply enrichment suggestions
 */
exports.applyContactEnrichment = asyncHandler(async (req, res) => {
  const { suggestions, createOrganizations } = req.body;

  if (!Array.isArray(suggestions) || suggestions.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Suggestions array is required and must not be empty'
    });
  }

  const results = {
    contactsUpdated: 0,
    organizationsCreated: 0,
    errors: []
  };

  // Start transaction
  await query('BEGIN');

  try {
    // Create organizations first if requested
    if (createOrganizations && Array.isArray(createOrganizations)) {
      for (const org of createOrganizations) {
        try {
          const result = await query(`
            INSERT INTO organizations (name, type, website, notes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (name) DO NOTHING
            RETURNING id
          `, [org.name, org.type, org.website, org.notes]);

          if (result.rows.length > 0) {
            results.organizationsCreated++;
          }
        } catch (error) {
          results.errors.push({
            type: 'organization',
            organization: org.name,
            error: error.message
          });
        }
      }
    }

    // Apply contact updates
    for (const suggestion of suggestions) {
      try {
        const updates = suggestion.suggestedUpdates;
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

          results.contactsUpdated++;
        }
      } catch (error) {
        results.errors.push({
          type: 'contact',
          contactId: suggestion.contactId,
          email: suggestion.email,
          error: error.message
        });
      }
    }

    // Commit transaction
    await query('COMMIT');

    // Log to audit
    await query(`
      INSERT INTO audit_log (action, user_email, details, created_at)
      VALUES ($1, $2, $3, NOW())
    `, ['data_enrichment', req.user?.email || 'system', JSON.stringify({
      contactsUpdated: results.contactsUpdated,
      organizationsCreated: results.organizationsCreated,
      errorCount: results.errors.length
    })]);

    res.json({
      success: true,
      message: `Enrichment complete: ${results.contactsUpdated} contacts updated, ${results.organizationsCreated} organizations created`,
      results
    });

  } catch (error) {
    await query('ROLLBACK');
    throw error;
  }
});

/**
 * POST /api/admin/organizations/enrich-websites
 * Add missing websites to organizations
 */
exports.enrichOrganizationWebsites = asyncHandler(async (req, res) => {
  // Find organizations without websites that have associated contacts
  const orgsResult = await query(`
    SELECT DISTINCT
      o.id,
      o.name,
      o.website,
      c.email
    FROM organizations o
    JOIN contacts c ON c.organization_id = o.id
    WHERE (o.website IS NULL OR o.website = '')
      AND c.email IS NOT NULL
    LIMIT 100
  `);

  const suggestions = [];

  for (const org of orgsResult.rows) {
    const domain = await query('SELECT extract_email_domain($1) as domain', [org.email]);
    if (domain.rows.length > 0) {
      const websiteResult = await query('SELECT domain_to_website($1) as website', [domain.rows[0].domain]);
      if (websiteResult.rows.length > 0 && websiteResult.rows[0].website) {
        suggestions.push({
          organizationId: org.id,
          organizationName: org.name,
          suggestedWebsite: websiteResult.rows[0].website,
          sourceDomain: domain.rows[0].domain
        });
      }
    }
  }

  res.json({
    success: true,
    totalOrganizations: orgsResult.rows.length,
    suggestions
  });
});
