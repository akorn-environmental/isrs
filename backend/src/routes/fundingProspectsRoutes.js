const express = require('express');
const router = express.Router();
const fundingProspectsController = require('../controllers/fundingProspectsController');
const { requireAuth } = require('../middleware/auth');

/**
 * Funding Prospects Routes
 * All routes require authentication
 * Board members, AP members, and partners have access
 */

// Get all funding prospects with filters
router.get('/', requireAuth, fundingProspectsController.getAllProspects);

// Get dashboard stats
router.get('/stats', requireAuth, fundingProspectsController.getDashboardStats);

// Get single prospect by ID
router.get('/:id', requireAuth, fundingProspectsController.getProspectById);

// Create new funding prospect
router.post('/', requireAuth, fundingProspectsController.createProspect);

// Update funding prospect
router.put('/:id', requireAuth, fundingProspectsController.updateProspect);

// Delete funding prospect
router.delete('/:id', requireAuth, fundingProspectsController.deleteProspect);

// Toggle follow-up flag
router.put('/:id/follow-up', requireAuth, fundingProspectsController.toggleFollowUp);

// Engagement routes
router.post('/:prospect_id/engagements', requireAuth, fundingProspectsController.createEngagement);
router.get('/:prospect_id/engagements', requireAuth, fundingProspectsController.getEngagements);

// Activity log
router.get('/:prospect_id/activities', requireAuth, fundingProspectsController.getActivities);
router.get('/activities/all', requireAuth, fundingProspectsController.getActivities);

module.exports = router;
