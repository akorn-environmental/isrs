/**
 * Unified Authentication Routes
 * Secure magic link authentication with RBAC and HTTP-only cookies
 *
 * Routes:
 * - POST /api/auth/request-login - Request magic link email
 * - POST /api/auth/verify-magic-link - Verify token and create session
 * - GET  /api/auth/session - Get current session info
 * - POST /api/auth/logout - Logout and destroy session
 */

const express = require('express');
const router = express.Router();
const {
  requestLogin,
  verifyMagicLink,
  exchangeToken,
  getSession,
  logout,
  updateProfile
} = require('../controllers/unifiedAuthController');

// Magic Link Authentication
router.post('/request-login', requestLogin);
router.post('/verify-magic-link', verifyMagicLink);
router.post('/exchange', exchangeToken);

// Session Management
router.get('/session', getSession);
router.post('/logout', logout);

// Profile Management
router.put('/profile', updateProfile);

module.exports = router;
