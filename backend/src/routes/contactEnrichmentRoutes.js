const express = require('express');
const router = express.Router();
const contactEnrichmentService = require('../services/contactEnrichmentService');
const { query } = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');

/**
 * Contact Enrichment Routes for ISRS
 * Enrich contacts and attendees using Apollo.io, Clearbit, Hunter.io, and other APIs
 */

/**
 * Enrich a single contact or attendee
 * POST /api/contact-enrichment/enrich
 * Body: { contactId?, attendeeId?, email, name?, company? }
 */
router.post('/enrich', asyncHandler(async (req, res) => {
  const { contactId, attendeeId, email, name, company } = req.body;

  if (!email) {
    return res.status(400).json({
      error: 'Missing required field: email is required'
    });
  }

  if (!contactId && !attendeeId) {
    return res.status(400).json({
      error: 'Either contactId or attendeeId must be provided'
    });
  }

  console.log(`[Contact Enrichment API] Enriching ${email} (contactId: ${contactId}, attendeeId: ${attendeeId})`);

  const result = await contactEnrichmentService.enrichContact(
    contactId,
    attendeeId,
    email,
    name,
    company
  );

  if (!result || result.sources_used.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No enrichment data found for this contact',
      email
    });
  }

  res.json({
    success: true,
    message: `Contact enriched using: ${result.sources_used.join(', ')}`,
    data: result
  });
}));

/**
 * Batch enrich multiple contacts/attendees
 * POST /api/contact-enrichment/batch
 * Body: { contacts: [{ id?, attendee_id?, email, name?, company_domain? }], delayMs? }
 */
router.post('/batch', asyncHandler(async (req, res) => {
  const { contacts, delayMs = 1000 } = req.body;

  if (!Array.isArray(contacts) || contacts.length === 0) {
    return res.status(400).json({
      error: 'Missing or invalid contacts array'
    });
  }

  console.log(`[Contact Enrichment API] Starting batch enrichment of ${contacts.length} contacts`);

  // Return immediately to avoid timeout for large batches
  res.json({
    success: true,
    message: `Batch enrichment started for ${contacts.length} contacts. Processing in background.`,
    status: 'running',
    totalContacts: contacts.length
  });

  // Run in background
  contactEnrichmentService.batchEnrich(contacts, delayMs)
    .then(results => {
      const successful = results.filter(r => r.success).length;
      console.log(`✅ Batch enrichment completed: ${successful}/${contacts.length} enriched`);
    })
    .catch(error => {
      console.error('❌ Batch enrichment failed:', error);
    });
}));

/**
 * Get enriched data for a contact or attendee
 * GET /api/contact-enrichment/contact/:contactId
 * GET /api/contact-enrichment/attendee/:attendeeId
 */
router.get('/contact/:contactId', asyncHandler(async (req, res) => {
  const { contactId } = req.params;

  const enrichedData = await contactEnrichmentService.getEnrichedData(parseInt(contactId), null);

  if (!enrichedData || enrichedData.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No enrichment data found for this contact'
    });
  }

  res.json({
    success: true,
    contactId,
    data: enrichedData
  });
}));

router.get('/attendee/:attendeeId', asyncHandler(async (req, res) => {
  const { attendeeId } = req.params;

  const enrichedData = await contactEnrichmentService.getEnrichedData(null, attendeeId);

  if (!enrichedData || enrichedData.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No enrichment data found for this attendee'
    });
  }

  res.json({
    success: true,
    attendeeId,
    data: enrichedData
  });
}));

/**
 * Get enriched data by email
 * GET /api/contact-enrichment/email/:email
 */
router.get('/email/:email', asyncHandler(async (req, res) => {
  const { email } = req.params;

  const enrichedData = await contactEnrichmentService.getEnrichedDataByEmail(email);

  if (!enrichedData || enrichedData.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No enrichment data found for this email'
    });
  }

  res.json({
    success: true,
    email,
    data: enrichedData
  });
}));

/**
 * Find all emails at a company domain
 * POST /api/contact-enrichment/find-company-emails
 * Body: { companyDomain, limit? }
 */
router.post('/find-company-emails', asyncHandler(async (req, res) => {
  const { companyDomain, limit = 10 } = req.body;

  if (!companyDomain) {
    return res.status(400).json({
      error: 'Missing required field: companyDomain'
    });
  }

  console.log(`[Contact Enrichment API] Finding emails for domain: ${companyDomain}`);

  const result = await contactEnrichmentService.findCompanyEmails(companyDomain, limit);

  if (!result || !result.emails || result.emails.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No emails found for this domain',
      domain: companyDomain
    });
  }

  res.json({
    success: true,
    domain: result.domain,
    organization: result.organization,
    emailPattern: result.pattern,
    totalFound: result.emails.length,
    emails: result.emails
  });
}));

/**
 * Auto-enrich contact when created/updated
 * POST /api/contact-enrichment/auto-enrich-contact
 * Body: { contactId }
 */
router.post('/auto-enrich-contact', asyncHandler(async (req, res) => {
  const { contactId } = req.body;

  if (!contactId) {
    return res.status(400).json({
      error: 'Missing required field: contactId'
    });
  }

  // Get contact details from database
  const contactResult = await query(
    `SELECT c.id, c.email, c.first_name, c.last_name, c.organization_name
     FROM contacts c
     WHERE c.id = $1`,
    [contactId]
  );

  if (contactResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Contact not found'
    });
  }

  const contact = contactResult.rows[0];

  if (!contact.email) {
    return res.status(400).json({
      error: 'Contact has no email address to enrich'
    });
  }

  console.log(`[Contact Enrichment API] Auto-enriching contact ${contactId}`);

  const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.trim();

  // Run enrichment in background
  res.json({
    success: true,
    message: 'Auto-enrichment started in background',
    contactId,
    email: contact.email
  });

  contactEnrichmentService.enrichContact(
    contactId,
    null,
    contact.email,
    fullName,
    contact.organization_name
  )
    .then(result => {
      console.log(`✅ Auto-enrichment completed for contact ${contactId}`);
    })
    .catch(error => {
      console.error(`❌ Auto-enrichment failed for contact ${contactId}:`, error);
    });
}));

/**
 * Auto-enrich attendee when created/updated
 * POST /api/contact-enrichment/auto-enrich-attendee
 * Body: { attendeeId }
 */
router.post('/auto-enrich-attendee', asyncHandler(async (req, res) => {
  const { attendeeId } = req.body;

  if (!attendeeId) {
    return res.status(400).json({
      error: 'Missing required field: attendeeId'
    });
  }

  // Get attendee details from database
  const attendeeResult = await query(
    `SELECT ap.id, ap.user_email, ap.first_name, ap.last_name,
            ap.organization_name, o.website
     FROM attendee_profiles ap
     LEFT JOIN organizations o ON ap.organization_id = o.id
     WHERE ap.id = $1`,
    [attendeeId]
  );

  if (attendeeResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Attendee not found'
    });
  }

  const attendee = attendeeResult.rows[0];

  if (!attendee.user_email) {
    return res.status(400).json({
      error: 'Attendee has no email address to enrich'
    });
  }

  console.log(`[Contact Enrichment API] Auto-enriching attendee ${attendeeId}`);

  const fullName = `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim();

  // Extract domain from website if available
  let companyDomain = null;
  if (attendee.website) {
    try {
      const url = new URL(attendee.website.startsWith('http') ? attendee.website : `https://${attendee.website}`);
      companyDomain = url.hostname.replace('www.', '');
    } catch (e) {
      console.log('[Contact Enrichment] Could not parse website URL');
    }
  }

  // Run enrichment in background
  res.json({
    success: true,
    message: 'Auto-enrichment started in background',
    attendeeId,
    email: attendee.user_email
  });

  contactEnrichmentService.enrichContact(
    null,
    attendeeId,
    attendee.user_email,
    fullName,
    companyDomain || attendee.organization_name
  )
    .then(result => {
      console.log(`✅ Auto-enrichment completed for attendee ${attendeeId}`);
    })
    .catch(error => {
      console.error(`❌ Auto-enrichment failed for attendee ${attendeeId}:`, error);
    });
}));

/**
 * Check enrichment service status
 * GET /api/contact-enrichment/status
 */
router.get('/status', asyncHandler(async (req, res) => {
  const configured = contactEnrichmentService.getConfiguredServices();

  const enabledServices = Object.entries(configured)
    .filter(([_, enabled]) => enabled)
    .map(([service, _]) => service);

  res.json({
    success: true,
    servicesEnabled: enabledServices,
    servicesAvailable: Object.keys(configured),
    status: configured,
    message: enabledServices.length > 0
      ? `${enabledServices.length} enrichment service(s) configured: ${enabledServices.join(', ')}`
      : 'No enrichment services configured. Add API keys to environment variables.'
  });
}));

/**
 * Get API usage statistics
 * GET /api/contact-enrichment/usage-stats
 */
router.get('/usage-stats', asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const result = await query(
    `SELECT
      api_name,
      COUNT(*) as total_calls,
      SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful_calls,
      SUM(CASE WHEN NOT success THEN 1 ELSE 0 END) as failed_calls,
      SUM(credits_used) as total_credits_used,
      AVG(response_time_ms) as avg_response_time_ms
     FROM enrichment_api_logs
     WHERE created_at >= NOW() - INTERVAL '${parseInt(days)} days'
     GROUP BY api_name
     ORDER BY total_calls DESC`,
    []
  );

  res.json({
    success: true,
    period: `${days} days`,
    stats: result.rows
  });
}));

module.exports = router;
