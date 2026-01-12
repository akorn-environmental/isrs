/**
 * User Profile Routes
 * Magic link authentication and profile management
 */

const express = require('express');
const router = express.Router();
const {
  requestMagicLink,
  verifyMagicLink,
  getProfile,
  updateProfile,
  logout,
  getMemberDirectory,
  requestDataExport,
  requestAccountDeletion
} = require('../controllers/userProfileController');

// Magic Link Authentication
router.post('/request-login', requestMagicLink);
router.post('/verify-magic-link', verifyMagicLink);

// Profile Management
router.get('/me', getProfile);
router.put('/me', updateProfile);

// Member Directory (public)
router.get('/directory', getMemberDirectory);

// Privacy & GDPR
router.post('/request-data-export', requestDataExport);
router.post('/request-account-deletion', requestAccountDeletion);

// Logout
router.post('/logout', logout);

module.exports = router;
