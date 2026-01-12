const express = require('express');
const router = express.Router();
const emailParsingController = require('../controllers/emailParsingController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/parse', emailParsingController.parseEmail);
router.get('/', emailParsingController.getParsedEmails);
router.get('/analytics', emailParsingController.getAnalytics);
router.post('/:parsedEmailId/import-contacts', emailParsingController.importContacts);
router.put('/:id/review', emailParsingController.updateReviewStatus);

module.exports = router;
