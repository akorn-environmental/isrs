const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Grant Writing routes
router.post('/grant/generate-section', aiController.generateGrantSection);
router.post('/grant/draft', aiController.createGrantDraft);
router.put('/grant/draft/:id', aiController.updateGrantDraft);
router.get('/grant/drafts/:prospectId', aiController.getGrantDrafts);
router.post('/grant/generation/:generationId/rate', aiController.rateGeneration);

// AI Assistant query endpoint
router.post('/query', aiController.queryDatabase);

// Insights routes
router.post('/insights/funding', aiController.generateFundingInsights);
router.post('/insights/data-quality', aiController.assessDataQuality);
router.post('/insights/trends', aiController.generateTrendAnalysis);
router.post('/insights/suggest-actions', aiController.suggestActions);
router.get('/insights', aiController.getInsights);
router.get('/insights/actions', aiController.getSuggestedActions);

module.exports = router;
