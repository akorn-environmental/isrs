const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { requireAuth } = require('../middleware/auth');

/**
 * Profile Management Routes
 * All routes require authentication
 */

// Get current user's profile
router.get('/my-profile', requireAuth, profileController.getMyProfile);

// Update current user's profile
router.put('/my-profile', requireAuth, profileController.updateMyProfile);

// Get profile by ID (admin only)
router.get('/profile/:id', requireAuth, profileController.getProfileById);

// Get all admin profiles (admin directory)
router.get('/admin-profiles', requireAuth, profileController.getAllAdminProfiles);

module.exports = router;
