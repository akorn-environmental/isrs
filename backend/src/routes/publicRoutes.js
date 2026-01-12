const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Public routes - no authentication required
// These endpoints provide read-only access to non-sensitive data

// Organizations - public list
router.get('/organizations', adminController.getOrganizations);

// Funding prospects - public list (for website display)
router.get('/funding', adminController.getFunding);

// Available leads for funding prospects
router.get('/funding/available-leads', adminController.getAvailableLeads);

// Conference information - public
router.get('/conferences', adminController.getConferences);
router.get('/conference/stats', adminController.getConferenceStats);

// Basic stats - public
router.get('/stats', adminController.getStats);

// ICSR data - public
router.get('/icsr-data', adminController.getICSRData);

// Board members list - public
router.get('/board-members', adminController.getBoardMembers);

module.exports = router;
