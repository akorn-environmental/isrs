const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const migrationController = require('../controllers/migrationController');
const { requireAuth } = require('../middleware/auth');

// Migration routes (no auth required in development for ease of use)
router.get('/migration/status', migrationController.getMigrationStatus);
router.post('/migration/:migrationNumber/run', migrationController.runMigration);

// All other routes require authentication
router.use(requireAuth);

// Campaign routes
router.get('/campaigns', emailController.getCampaigns);
router.get('/campaigns/:id', emailController.getCampaignById);
router.post('/campaigns', emailController.createCampaign);
router.put('/campaigns/:id', emailController.updateCampaign);
router.delete('/campaigns/:id', emailController.deleteCampaign);
router.post('/campaigns/:id/send', emailController.sendCampaign);

// Template routes
router.get('/templates', emailController.getTemplates);
router.post('/templates', emailController.createTemplate);

// Utility routes
router.get('/audience-count', emailController.getAudienceCount);

module.exports = router;
