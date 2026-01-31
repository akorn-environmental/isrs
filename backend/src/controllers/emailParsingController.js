const { asyncHandler } = require('../middleware/errorHandler');
const emailParsingService = require('../services/emailParsingService');

exports.parseEmail = asyncHandler(async (req, res) => {
  const { subject, fromEmail, fromName, toEmails, ccEmails, receivedDate, emailBody, context } = req.body;

  if (!emailBody) {
    return res.status(400).json({ success: false, error: 'Email body is required' });
  }

  const result = await emailParsingService.parseEmail({
    subject, fromEmail, fromName, toEmails, ccEmails, receivedDate, emailBody, context
  });

  res.json(result);
});

exports.getParsedEmails = asyncHandler(async (req, res) => {
  const { reviewStatus, fromEmail } = req.query;
  const emails = await emailParsingService.getParsedEmails({ reviewStatus, fromEmail });
  res.json({ success: true, emails });
});

exports.importContacts = asyncHandler(async (req, res) => {
  const { parsedEmailId } = req.params;
  const result = await emailParsingService.importContactsFromEmail(parseInt(parsedEmailId));
  res.json(result);
});

exports.updateReviewStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reviewStatus } = req.body;
  const { query } = require('../config/database');

  await query(
    'UPDATE parsed_emails SET review_status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3',
    [reviewStatus, req.user?.email || 'system', id]
  );

  res.json({ success: true });
});

exports.getAnalytics = asyncHandler(async (req, res) => {
  const { period = '30', status = 'all' } = req.query;
  const analytics = await emailParsingService.getAnalytics({ period, status });
  res.json({ success: true, analytics });
});

exports.getEmailById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { query } = require('../config/database');

  const result = await query(
    'SELECT * FROM parsed_emails WHERE id = $1',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Email not found' });
  }

  res.json({ success: true, email: result.rows[0] });
});

exports.approveEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { query } = require('../config/database');

  await query(
    'UPDATE parsed_emails SET review_status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3',
    ['approved', req.user?.email || 'system', id]
  );

  res.json({ success: true });
});

exports.rejectEmail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { query } = require('../config/database');

  await query(
    'UPDATE parsed_emails SET review_status = $1, reviewed_by = $2, reviewed_at = NOW() WHERE id = $3',
    ['rejected', req.user?.email || 'system', id]
  );

  res.json({ success: true });
});
