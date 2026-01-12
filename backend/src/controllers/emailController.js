const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');

// Get all campaigns
exports.getCampaigns = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT
      id, name, subject, body, target_audience, status,
      scheduled_send_date, sent_at,
      total_recipients, sent_count, opened_count, clicked_count,
      created_at, updated_at
    FROM email_campaigns
    ORDER BY created_at DESC
  `);

  res.json({
    success: true,
    campaigns: result.rows
  });
});

// Get campaign by ID
exports.getCampaignById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(`
    SELECT * FROM email_campaigns WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }

  // Get recipients
  const recipients = await query(`
    SELECT * FROM campaign_recipients
    WHERE campaign_id = $1
    ORDER BY created_at DESC
  `, [id]);

  res.json({
    success: true,
    campaign: result.rows[0],
    recipients: recipients.rows
  });
});

// Create campaign
exports.createCampaign = asyncHandler(async (req, res) => {
  const {
    name,
    subject,
    body,
    target_audience,
    filter_criteria,
    status = 'draft',
    scheduled_send_date
  } = req.body;

  const user_email = req.user?.email || 'system';

  const result = await query(`
    INSERT INTO email_campaigns (
      name, subject, body, target_audience, filter_criteria,
      status, scheduled_send_date, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `, [name, subject, body, target_audience, filter_criteria, status, scheduled_send_date, user_email]);

  res.json({
    success: true,
    campaign: result.rows[0]
  });
});

// Update campaign
exports.updateCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    subject,
    body,
    target_audience,
    filter_criteria,
    status,
    scheduled_send_date
  } = req.body;

  const result = await query(`
    UPDATE email_campaigns
    SET
      name = COALESCE($1, name),
      subject = COALESCE($2, subject),
      body = COALESCE($3, body),
      target_audience = COALESCE($4, target_audience),
      filter_criteria = COALESCE($5, filter_criteria),
      status = COALESCE($6, status),
      scheduled_send_date = COALESCE($7, scheduled_send_date),
      updated_at = NOW()
    WHERE id = $8
    RETURNING *
  `, [name, subject, body, target_audience, filter_criteria, status, scheduled_send_date, id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }

  res.json({
    success: true,
    campaign: result.rows[0]
  });
});

// Delete campaign
exports.deleteCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await query(`
    DELETE FROM email_campaigns
    WHERE id = $1
    RETURNING id
  `, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }

  res.json({
    success: true,
    message: 'Campaign deleted'
  });
});

// Get audience count
exports.getAudienceCount = asyncHandler(async (req, res) => {
  const { type } = req.query;

  let countQuery;
  switch (type) {
    case 'all_contacts':
      countQuery = 'SELECT COUNT(*) as count FROM contacts WHERE email IS NOT NULL';
      break;
    case 'board_members':
      countQuery = `SELECT COUNT(DISTINCT c.id) as count
                    FROM contacts c
                    JOIN admin_users au ON c.email = au.email
                    WHERE c.email IS NOT NULL`;
      break;
    case 'funding_prospects':
      countQuery = `SELECT COUNT(*) as count
                    FROM funding_prospects
                    WHERE contact_email IS NOT NULL OR organization_name IS NOT NULL`;
      break;
    case 'conference_attendees':
      countQuery = 'SELECT COUNT(*) as count FROM contacts WHERE email IS NOT NULL';
      break;
    case 'international_contacts':
      countQuery = `SELECT COUNT(*) as count FROM contacts
                    WHERE email IS NOT NULL AND country IS NOT NULL AND country != 'United States'`;
      break;
    case 'government_contacts':
      countQuery = `SELECT COUNT(*) as count FROM contacts
                    WHERE email IS NOT NULL AND organization ILIKE '%government%'`;
      break;
    default:
      return res.json({ success: true, count: 0 });
  }

  const result = await query(countQuery);
  res.json({
    success: true,
    count: parseInt(result.rows[0].count)
  });
});

// Send campaign
exports.sendCampaign = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Get campaign
  const campaignResult = await query(`
    SELECT * FROM email_campaigns WHERE id = $1
  `, [id]);

  if (campaignResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Campaign not found'
    });
  }

  const campaign = campaignResult.rows[0];

  // Get recipients based on target audience
  let recipientsQuery;
  switch (campaign.target_audience) {
    case 'all_contacts':
      recipientsQuery = 'SELECT id, email, first_name, last_name, organization, title, country FROM contacts WHERE email IS NOT NULL';
      break;
    case 'board_members':
      recipientsQuery = `SELECT DISTINCT c.id, c.email, c.first_name, c.last_name, c.organization, c.title, c.country
                        FROM contacts c
                        JOIN admin_users au ON c.email = au.email
                        WHERE c.email IS NOT NULL`;
      break;
    case 'funding_prospects':
      recipientsQuery = `SELECT id, contact_email as email, organization_name as organization, contact_name as first_name, '' as last_name, '' as title, '' as country
                        FROM funding_prospects
                        WHERE contact_email IS NOT NULL`;
      break;
    case 'conference_attendees':
      recipientsQuery = 'SELECT id, email, first_name, last_name, organization, title, country FROM contacts WHERE email IS NOT NULL';
      break;
    case 'international_contacts':
      recipientsQuery = `SELECT id, email, first_name, last_name, organization, title, country FROM contacts
                        WHERE email IS NOT NULL AND country IS NOT NULL AND country != 'United States'`;
      break;
    case 'government_contacts':
      recipientsQuery = `SELECT id, email, first_name, last_name, organization, title, country FROM contacts
                        WHERE email IS NOT NULL AND organization ILIKE '%government%'`;
      break;
    default:
      recipientsQuery = 'SELECT id, email, first_name, last_name, organization, title, country FROM contacts WHERE email IS NOT NULL LIMIT 10';
  }

  const recipientsResult = await query(recipientsQuery);
  const recipients = recipientsResult.rows;

  // Update campaign with total recipients and set to sending
  await query(`
    UPDATE email_campaigns
    SET total_recipients = $2, status = 'sending', updated_at = NOW()
    WHERE id = $1
  `, [id, recipients.length]);

  // Create campaign_recipients records
  for (const recipient of recipients) {
    await query(`
      INSERT INTO campaign_recipients (campaign_id, contact_id, email, status)
      VALUES ($1, $2, $3, 'pending')
      ON CONFLICT (campaign_id, contact_id) DO NOTHING
    `, [id, recipient.id, recipient.email]);
  }

  // Send emails in background (don't wait for completion)
  setImmediate(async () => {
    try {
      const results = await emailService.sendCampaignEmails(campaign, recipients);

      // Update campaign status to sent
      await query(`
        UPDATE email_campaigns
        SET status = 'sent', sent_at = NOW(), sent_count = $2, updated_at = NOW()
        WHERE id = $1
      `, [id, results.sent]);

      console.log(`Campaign ${id} sent: ${results.sent} sent, ${results.failed} failed`);
    } catch (error) {
      console.error(`Error sending campaign ${id}:`, error);
      await query(`
        UPDATE email_campaigns
        SET status = 'failed', updated_at = NOW()
        WHERE id = $1
      `, [id]);
    }
  });

  res.json({
    success: true,
    message: 'Campaign queued for sending',
    total_recipients: recipients.length
  });
});

// Get all templates
exports.getTemplates = asyncHandler(async (req, res) => {
  const result = await query(`
    SELECT * FROM email_templates
    ORDER BY created_at DESC
  `);

  res.json({
    success: true,
    templates: result.rows
  });
});

// Create template
exports.createTemplate = asyncHandler(async (req, res) => {
  const {
    name,
    subject,
    body,
    template_type,
    variables
  } = req.body;

  const user_email = req.user?.email || 'system';

  const result = await query(`
    INSERT INTO email_templates (
      name, subject, body, template_type, variables, created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [name, subject, body, template_type, variables, user_email]);

  res.json({
    success: true,
    template: result.rows[0]
  });
});
