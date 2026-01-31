const express = require('express');
const router = express.Router();
const emailParsingController = require('../controllers/emailParsingController');
const { requireAuth } = require('../middleware/auth');
const gmailPoller = require('../services/gmailPollerService');

router.use(requireAuth);

router.post('/parse', emailParsingController.parseEmail);
router.get('/', emailParsingController.getParsedEmails);
router.get('/:id', emailParsingController.getEmailById);
router.get('/analytics', emailParsingController.getAnalytics);
router.post('/:parsedEmailId/import-contacts', emailParsingController.importContacts);
router.put('/:id/review', emailParsingController.updateReviewStatus);
router.post('/:id/approve', emailParsingController.approveEmail);
router.post('/:id/reject', emailParsingController.rejectEmail);

// Gmail Poller control endpoints
router.post('/gmail-poller/start', async (req, res) => {
  const result = await gmailPoller.startPolling();
  res.json(result);
});

router.post('/gmail-poller/stop', (req, res) => {
  const result = gmailPoller.stopPolling();
  res.json(result);
});

router.post('/gmail-poller/pause', (req, res) => {
  const result = gmailPoller.pause();
  res.json(result);
});

router.post('/gmail-poller/resume', (req, res) => {
  const result = gmailPoller.resume();
  res.json(result);
});

router.get('/gmail-poller/status', (req, res) => {
  const status = gmailPoller.getStatus();
  res.json({ success: true, ...status });
});

router.post('/gmail-poller/trigger', async (req, res) => {
  if (!gmailPoller.isPolling) {
    const initResult = await gmailPoller.initialize();
    if (!initResult) {
      return res.json({ success: false, message: 'Failed to initialize Gmail poller' });
    }
  }
  gmailPoller.poll();
  res.json({ success: true, message: 'Manual poll triggered' });
});

module.exports = router;
