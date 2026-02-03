const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const weeklyDigestScheduler = require('../services/weeklyDigestScheduler');

// All weekly digest endpoints require authentication
router.use(requireAuth);

/**
 * POST /api/weekly-digest/trigger
 * Manually trigger weekly digest (for testing)
 */
router.post('/trigger', async (req, res) => {
  try {
    const result = await weeklyDigestScheduler.triggerManualDigest();

    res.json({
      success: true,
      result: result,
      message: 'Weekly digest triggered successfully'
    });
  } catch (error) {
    console.error('[Weekly Digest API] Error triggering digest:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/weekly-digest/preview
 * Preview weekly digest content (for testing)
 */
router.get('/preview', async (req, res) => {
  try {
    const { subject, html } = await weeklyDigestScheduler.generateWeeklyDigest();

    res.json({
      success: true,
      subject: subject,
      html: html
    });
  } catch (error) {
    console.error('[Weekly Digest API] Error generating preview:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
