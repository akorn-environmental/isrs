/**
 * Authentication Routes
 * Handles login, logout, and session management
 */

const express = require('express');
const router = express.Router();
const {
  createSession,
  destroySession,
  verifySession,
  getUserRole,
  getUserPermissions,
  requireAuth
} = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Login endpoint - creates a new session
 */
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user has valid role
    const role = getUserRole(normalizedEmail);
    if (role === 'viewer') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. This email is not registered in the system.'
      });
    }

    // Create session (pass req for IP/user-agent logging)
    const { sessionToken, expiresAt, role: userRole } = await createSession(normalizedEmail, req);

    // Get user permissions
    const permissions = getUserPermissions(normalizedEmail);

    res.json({
      success: true,
      data: {
        sessionToken,
        expiresAt,
        email: normalizedEmail,
        role: userRole,
        permissions
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout endpoint - destroys the session
 */
router.post('/logout', requireAuth, async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (sessionToken) {
      await destroySession(sessionToken);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * GET /api/auth/session
 * Check session validity
 */
router.get('/session', async (req, res) => {
  try {
    const sessionToken = req.headers.authorization?.replace('Bearer ', '');

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'No session token provided'
      });
    }

    const session = await verifySession(sessionToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Get user permissions
    const permissions = getUserPermissions(session.email);

    res.json({
      success: true,
      data: {
        email: session.email,
        role: session.role,
        expiresAt: session.expiresAt,
        permissions
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({
      success: false,
      error: 'Session check failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', requireAuth, (req, res) => {
  try {
    const permissions = getUserPermissions(req.user.email);

    res.json({
      success: true,
      data: {
        email: req.user.email,
        role: req.user.role,
        permissions
      }
    });

  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

/**
 * PUT /api/auth/profile
 * Update user profile (stored in localStorage on frontend, this endpoint acknowledges receipt)
 */
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { first_name, last_name, organization, phone } = req.body;

    // Profile data is primarily stored client-side in localStorage
    // This endpoint acknowledges the save and could store to DB in future
    console.log(`Profile update for ${req.user.email}:`, { first_name, last_name, organization, phone });

    res.json({
      success: true,
      message: 'Profile updated',
      data: {
        email: req.user.email,
        first_name,
        last_name,
        organization,
        phone
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

module.exports = router;
