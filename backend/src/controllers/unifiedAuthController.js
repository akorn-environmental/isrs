/**
 * Unified Authentication Controller
 * Combines magic link authentication with RBAC system and HTTP-only cookies
 *
 * Security Features:
 * - Magic link email verification (no passwords)
 * - HTTP-only, Secure, SameSite cookies
 * - Role-based access control (RBAC)
 * - Session activity logging
 * - CSRF protection ready
 */

const { pool } = require('../config/database');
const crypto = require('crypto');
const { sendMagicLink } = require('../services/emailService');

// Session configuration
const SESSION_COOKIE_NAME = 'isrs_session';
const SESSION_EXPIRY_HOURS = 24; // Reduced from 30 days to 24 hours (security improvement)
const MAGIC_LINK_EXPIRY_MINUTES = 15;

/**
 * Request magic link login
 * POST /api/auth/request-login
 *
 * Sends magic link email to user - works for all user types (admin, member, etc.)
 */
async function requestLogin(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in attendee_profiles
    const userResult = await pool.query(
      `SELECT id, first_name, last_name, user_email, account_status
       FROM attendee_profiles
       WHERE user_email = $1`,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      // Security: Don't reveal if email exists
      return res.json({
        success: true,
        message: 'If an account exists with this email, a magic link has been sent'
      });
    }

    const user = userResult.rows[0];

    // Check account status
    if (user.account_status === 'suspended' || user.account_status === 'deleted') {
      return res.status(403).json({
        success: false,
        error: 'This account is not active. Please contact support.'
      });
    }

    // Generate cryptographically secure magic link token
    const magicToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

    // Get active roles for logging purposes
    const rolesResult = await pool.query(
      `SELECT r.name, r.display_name
       FROM user_roles ur
       JOIN roles r ON ur.role_id = r.id
       WHERE ur.user_id = $1
         AND ur.is_active = TRUE
         AND (ur.active_from IS NULL OR ur.active_from <= NOW())
         AND (ur.active_until IS NULL OR ur.active_until >= NOW())
       ORDER BY r.permission_level DESC
       LIMIT 1`,
      [user.id]
    );

    const primaryRole = rolesResult.rows[0]?.display_name || 'Member';

    // Store magic link token in database
    await pool.query(
      `INSERT INTO user_sessions (
        attendee_id, email, magic_link_token, token_expires_at,
        ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        user.id,
        normalizedEmail,
        magicToken,
        tokenExpiresAt,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent') || 'Unknown'
      ]
    );

    // Build magic link URL (must point to backend /auth/verify endpoint)
    const backendUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const magicLink = `${backendUrl}/auth/verify?token=${magicToken}`;

    console.log(`🔐 Magic link generated for ${normalizedEmail} (${primaryRole})`);
    console.log(`   Link: ${magicLink}`);
    console.log(`   Expires: ${tokenExpiresAt.toISOString()}`);

    // Send magic link email
    try {
      await sendMagicLink(
        normalizedEmail,
        user.first_name || 'Member',
        magicLink
      );
      console.log(`✅ Magic link email sent to ${normalizedEmail}`);
    } catch (emailError) {
      console.error('❌ Failed to send magic link email:', emailError);
      // Don't block the response - email issues shouldn't prevent login attempts
    }

    // Response
    res.json({
      success: true,
      message: 'Magic link sent to your email address. Please check your inbox.',
      // Include link in development for testing
      ...(process.env.NODE_ENV !== 'production' && {
        devMagicLink: magicLink,
        devNote: 'Magic link included for development testing only'
      })
    });

  } catch (error) {
    console.error('Error requesting magic link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send magic link. Please try again.'
    });
  }
}

/**
 * Verify magic link and create authenticated session
 * POST /api/auth/verify-magic-link
 *
 * Validates magic link token, loads user roles/permissions, creates HTTP-only cookie
 */
async function verifyMagicLink(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Magic link token is required'
      });
    }

    // Find and validate magic link token
    const tokenResult = await pool.query(
      `SELECT
        us.id as session_id,
        us.attendee_id,
        us.email,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        ap.profile_photo_url,
        ap.organization_name
      FROM user_sessions us
      JOIN attendee_profiles ap ON us.attendee_id = ap.id
      WHERE us.magic_link_token = $1
        AND us.token_used = FALSE
        AND (us.token_expires_at AT TIME ZONE 'UTC') > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired magic link. Please request a new one.'
      });
    }

    const session = tokenResult.rows[0];
    const userId = session.attendee_id;

    // Load active roles with permissions
    const rolesResult = await pool.query(
      `SELECT
        r.id as role_id,
        r.name as role_name,
        r.display_name,
        r.permission_level,
        r.category,
        r.settings,
        ur.active_until,
        ur.conference_year
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
        AND ur.is_active = TRUE
        AND (ur.active_from IS NULL OR ur.active_from <= NOW())
        AND (ur.active_until IS NULL OR ur.active_until >= NOW())
      ORDER BY r.permission_level DESC`,
      [userId]
    );

    // Load all permissions for the user
    const permissionsResult = await pool.query(
      `SELECT DISTINCT
        p.name as permission_name,
        p.resource,
        p.action,
        COALESCE(rp.scope_override, p.scope) as scope
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1
        AND ur.is_active = TRUE
        AND (ur.active_from IS NULL OR ur.active_from <= NOW())
        AND (ur.active_until IS NULL OR ur.active_until >= NOW())`,
      [userId]
    );

    const roles = rolesResult.rows;
    const permissions = permissionsResult.rows;

    // Determine primary role (highest permission level)
    const primaryRole = roles[0] || {
      role_name: 'member',
      display_name: 'Member',
      permission_level: 50,
      category: 'member'
    };

    // Determine which dashboard to show based on primary role
    const dashboardPath = primaryRole.settings?.dashboard || 'member';

    // Generate session token
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create permissions and roles snapshot for session
    const rolesSnapshot = roles.map(r => ({
      name: r.role_name,
      displayName: r.display_name,
      level: r.permission_level,
      category: r.category
    }));

    const permissionsSnapshot = permissions.reduce((acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = {};
      if (!acc[p.resource][p.action]) acc[p.resource][p.action] = [];
      acc[p.resource][p.action].push(p.scope);
      return acc;
    }, {});

    // Mark magic link as used and update session
    await pool.query(
      `UPDATE user_sessions
       SET token_used = TRUE,
           token_used_at = NOW(),
           session_token = $1,
           session_expires_at = $2,
           last_activity = NOW(),
           roles_snapshot = $3,
           permissions_snapshot = $4
       WHERE id = $5`,
      [
        sessionToken,
        sessionExpiresAt,
        JSON.stringify(rolesSnapshot),
        JSON.stringify(permissionsSnapshot),
        session.session_id
      ]
    );

    // Update attendee profile
    await pool.query(
      `UPDATE attendee_profiles
       SET email_verified = TRUE,
           email_verified_at = COALESCE(email_verified_at, NOW()),
           last_login_at = NOW(),
           login_count = COALESCE(login_count, 0) + 1
       WHERE id = $1`,
      [userId]
    );

    // Log session activity
    await pool.query(
      `INSERT INTO session_activity_log (
        session_id, user_id, activity_type, ip_address, user_agent
      ) VALUES ($1, $2, 'login', $3, $4)`,
      [
        session.session_id,
        userId,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent') || 'Unknown'
      ]
    );

    console.log(`✅ Login successful for ${session.email}`);
    console.log(`   Primary role: ${primaryRole.display_name} (level ${primaryRole.permission_level})`);
    console.log(`   Total roles: ${roles.length}`);
    console.log(`   Total permissions: ${permissions.length}`);
    console.log(`   Dashboard: /${dashboardPath}`);

    // Set HTTP-only secure cookie
    res.cookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true, // Prevents JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection - 'lax' allows cookie on top-level navigation (redirects)
      maxAge: SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
      path: '/'
    });

    // Response with user data
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: userId,
          email: session.user_email,
          firstName: session.first_name,
          lastName: session.last_name,
          fullName: `${session.first_name} ${session.last_name}`.trim(),
          profilePhoto: session.profile_photo_url,
          organization: session.organization_name
        },
        primaryRole: {
          name: primaryRole.role_name,
          displayName: primaryRole.display_name,
          level: primaryRole.permission_level,
          category: primaryRole.category
        },
        roles: rolesSnapshot,
        permissions: permissionsSnapshot,
        dashboardPath: `/${dashboardPath}`,
        sessionExpiresAt: sessionExpiresAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify magic link. Please try again.'
    });
  }
}

/**
 * Get current session info
 * GET /api/auth/session
 *
 * Returns current user session data from HTTP-only cookie OR query parameter (for cross-origin)
 */
async function getSession(req, res) {
  try {
    // SECURITY: Check Authorization header first (for API clients), then cookie, then query parameter
    let sessionToken = null;

    // 1. Check Authorization header (Bearer token)
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // 2. Fallback to cookie (for same-origin requests)
    if (!sessionToken) {
      sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
    }

    // 3. Fallback to query parameter (for cross-origin compatibility)
    if (!sessionToken) {
      sessionToken = req.query.sessionToken;
    }

    console.log('🔍 getSession called');
    console.log('   Authorization header:', req.headers.authorization ? 'present' : 'none');
    console.log('   Cookie:', req.cookies?.[SESSION_COOKIE_NAME] ? 'present' : 'none');
    console.log('   Query param:', req.query.sessionToken ? 'present' : 'none');
    console.log('   Using token:', sessionToken ? sessionToken.substring(0, 20) + '...' : 'NONE');

    if (!sessionToken) {
      console.log('❌ No session token provided');
      return res.status(401).json({
        success: false,
        error: 'No active session',
        code: 'NO_SESSION'
      });
    }

    // Verify session
    console.log('📤 Querying database for session...');
    const sessionResult = await pool.query(
      `SELECT
        us.id as session_id,
        us.attendee_id,
        us.email,
        us.session_expires_at,
        us.roles_snapshot,
        us.permissions_snapshot,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        ap.profile_photo_url,
        ap.organization_name
      FROM user_sessions us
      JOIN attendee_profiles ap ON us.attendee_id = ap.id
      WHERE us.session_token = $1
        AND us.session_expires_at > NOW()`,
      [sessionToken]
    );

    console.log('📥 Database returned', sessionResult.rows.length, 'rows');

    if (sessionResult.rows.length === 0) {
      console.log('❌ Session not found or expired');
      // Clear invalid cookie
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid',
        code: 'SESSION_EXPIRED'
      });
    }

    const session = sessionResult.rows[0];
    console.log('✅ Session found for:', session.email);

    // Update last activity
    await pool.query(
      `UPDATE user_sessions SET last_activity = NOW() WHERE id = $1`,
      [session.session_id]
    );

    // Parse snapshots (JSONB columns are already parsed by node-postgres, don't JSON.parse them!)
    console.log('📋 Getting roles and permissions...');
    console.log('   roles_snapshot:', session.roles_snapshot ? 'present' : 'null');
    console.log('   permissions_snapshot:', session.permissions_snapshot ? 'present' : 'null');

    const roles = session.roles_snapshot || [];
    const permissions = session.permissions_snapshot || {};
    const primaryRole = roles[0] || { name: 'member', displayName: 'Member' };

    console.log('✅ Returning session data');

    res.json({
      success: true,
      data: {
        user: {
          id: session.attendee_id,
          email: session.user_email,
          firstName: session.first_name,
          lastName: session.last_name,
          fullName: `${session.first_name} ${session.last_name}`.trim(),
          profilePhoto: session.profile_photo_url,
          organization: session.organization_name
        },
        primaryRole,
        roles,
        permissions,
        sessionExpiresAt: session.session_expires_at
      }
    });

  } catch (error) {
    console.error('💥 ERROR in getSession:', error);
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}

/**
 * Logout - destroys session and clears cookie
 * POST /api/auth/logout
 */
async function logout(req, res) {
  try {
    // SECURITY: Check Authorization header first (for API clients), then cookie, then query parameter
    let sessionToken = null;

    // 1. Check Authorization header (Bearer token)
    if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith('Bearer ')) {
        sessionToken = authHeader.substring(7); // Remove 'Bearer ' prefix
      }
    }

    // 2. Fallback to cookie (for same-origin requests)
    if (!sessionToken) {
      sessionToken = req.cookies?.[SESSION_COOKIE_NAME];
    }

    // 3. Fallback to query parameter (for cross-origin compatibility)
    if (!sessionToken) {
      sessionToken = req.query.sessionToken;
    }

    if (sessionToken) {
      // Log logout activity
      const sessionResult = await pool.query(
        `SELECT id, attendee_id FROM user_sessions WHERE session_token = $1`,
        [sessionToken]
      );

      if (sessionResult.rows.length > 0) {
        const { id: sessionId, attendee_id: userId } = sessionResult.rows[0];

        await pool.query(
          `INSERT INTO session_activity_log (
            session_id, user_id, activity_type, ip_address, user_agent
          ) VALUES ($1, $2, 'logout', $3, $4)`,
          [
            sessionId,
            userId,
            req.ip || req.connection.remoteAddress,
            req.get('user-agent') || 'Unknown'
          ]
        );
      }

      // Delete session from database
      await pool.query(
        `DELETE FROM user_sessions WHERE session_token = $1`,
        [sessionToken]
      );

      console.log(`🔓 User logged out successfully`);
    }

    // Clear cookie
    res.clearCookie(SESSION_COOKIE_NAME);

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Error during logout:', error);
    // Still clear cookie even if DB operation fails
    res.clearCookie(SESSION_COOKIE_NAME);
    res.status(500).json({
      success: false,
      error: 'Logout completed with errors'
    });
  }
}

/**
 * Verify magic link and redirect to frontend
 * GET /auth/verify?token=xxx
 *
 * Handles magic link clicks - validates token, creates session, redirects to frontend
 */
async function verifyMagicLinkRedirect(req, res) {
  try {
    const token = req.query.token;

    if (!token) {
      return res.status(400).send('<h1>Invalid Magic Link</h1><p>No token provided. Please request a new magic link.</p>');
    }

    // Find and validate magic link token (same logic as verifyMagicLink)
    const tokenResult = await pool.query(
      `SELECT
        us.id as session_id,
        us.attendee_id,
        us.email,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        ap.profile_photo_url,
        ap.organization_name
      FROM user_sessions us
      JOIN attendee_profiles ap ON us.attendee_id = ap.id
      WHERE us.magic_link_token = $1
        AND us.token_used = FALSE
        AND (us.token_expires_at AT TIME ZONE 'UTC') > NOW()`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).send('<h1>Invalid or Expired Magic Link</h1><p>This magic link has expired or been used. Please request a new one.</p>');
    }

    const session = tokenResult.rows[0];
    const userId = session.attendee_id;

    // Load active roles with permissions
    const rolesResult = await pool.query(
      `SELECT
        r.id as role_id,
        r.name as role_name,
        r.display_name,
        r.permission_level,
        r.category,
        r.settings,
        ur.active_until,
        ur.conference_year
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = $1
        AND ur.is_active = TRUE
        AND (ur.active_from IS NULL OR ur.active_from <= NOW())
        AND (ur.active_until IS NULL OR ur.active_until >= NOW())
      ORDER BY r.permission_level DESC`,
      [userId]
    );

    // Load all permissions for the user
    const permissionsResult = await pool.query(
      `SELECT DISTINCT
        p.name as permission_name,
        p.resource,
        p.action,
        COALESCE(rp.scope_override, p.scope) as scope
      FROM user_roles ur
      JOIN role_permissions rp ON ur.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = $1
        AND ur.is_active = TRUE
        AND (ur.active_from IS NULL OR ur.active_from <= NOW())
        AND (ur.active_until IS NULL OR ur.active_until >= NOW())`,
      [userId]
    );

    const roles = rolesResult.rows;
    const permissions = permissionsResult.rows;

    // Determine primary role (highest permission level)
    const primaryRole = roles[0] || {
      role_name: 'member',
      display_name: 'Member',
      permission_level: 50,
      category: 'member'
    };

    // Determine which dashboard to show based on primary role
    const dashboardPath = primaryRole.settings?.dashboard || 'member';

    // Generate session token
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    // Create permissions and roles snapshot for session
    const rolesSnapshot = roles.map(r => ({
      name: r.role_name,
      displayName: r.display_name,
      level: r.permission_level,
      category: r.category
    }));

    const permissionsSnapshot = permissions.reduce((acc, p) => {
      if (!acc[p.resource]) acc[p.resource] = {};
      if (!acc[p.resource][p.action]) acc[p.resource][p.action] = [];
      acc[p.resource][p.action].push(p.scope);
      return acc;
    }, {});

    // Mark magic link as used and update session
    await pool.query(
      `UPDATE user_sessions
       SET token_used = TRUE,
           token_used_at = NOW(),
           session_token = $1,
           session_expires_at = $2,
           last_activity = NOW(),
           roles_snapshot = $3,
           permissions_snapshot = $4
       WHERE id = $5`,
      [
        sessionToken,
        sessionExpiresAt,
        JSON.stringify(rolesSnapshot),
        JSON.stringify(permissionsSnapshot),
        session.session_id
      ]
    );

    // Update attendee profile
    await pool.query(
      `UPDATE attendee_profiles
       SET email_verified = TRUE,
           email_verified_at = COALESCE(email_verified_at, NOW()),
           last_login_at = NOW(),
           login_count = COALESCE(login_count, 0) + 1
       WHERE id = $1`,
      [userId]
    );

    // Log session activity
    await pool.query(
      `INSERT INTO session_activity_log (
        session_id, user_id, activity_type, ip_address, user_agent
      ) VALUES ($1, $2, 'login', $3, $4)`,
      [
        session.session_id,
        userId,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent') || 'Unknown'
      ]
    );

    console.log(`✅ Login successful for ${session.email}`);
    console.log(`   Primary role: ${primaryRole.display_name} (level ${primaryRole.permission_level})`);
    console.log(`   Redirecting to: /${dashboardPath}`);

    // Generate a one-time exchange token (valid for 60 seconds)
    const exchangeToken = crypto.randomBytes(32).toString('hex');
    const exchangeExpiresAt = new Date(Date.now() + 60 * 1000); // 60 seconds

    // Store exchange token temporarily
    await pool.query(
      `UPDATE user_sessions
       SET exchange_token = $1,
           exchange_token_expires = $2
       WHERE id = $3`,
      [exchangeToken, exchangeExpiresAt, session.session_id]
    );

    // Determine frontend URL based on environment
    const frontendUrl = process.env.FRONTEND_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://www.shellfish-society.org'
        : 'http://localhost:8080');

    // Redirect to frontend with exchange token
    // Frontend will call /api/auth/exchange to get the session cookie
    res.redirect(`${frontendUrl}/${dashboardPath}?auth=${exchangeToken}`);

  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(500).send('<h1>Login Error</h1><p>Failed to verify magic link. Please try again.</p>');
  }
}

/**
 * Exchange a one-time token for a session cookie
 * Called by frontend after redirect from magic link verification
 */
async function exchangeToken(req, res) {
  try {
    const { token } = req.body;

    console.log('🔄 exchangeToken called');
    console.log('   Token received:', token ? token.substring(0, 20) + '...' : 'NONE');

    if (!token) {
      console.log('❌ No exchange token provided');
      return res.status(400).json({
        success: false,
        error: 'Exchange token is required'
      });
    }

    // Find and validate exchange token
    console.log('📤 Querying database for exchange token...');
    const result = await pool.query(
      `SELECT
        us.id as session_id,
        us.session_token,
        us.session_expires_at,
        us.attendee_id,
        us.email,
        us.roles_snapshot,
        us.permissions_snapshot,
        ap.first_name,
        ap.last_name
      FROM user_sessions us
      JOIN attendee_profiles ap ON us.attendee_id = ap.id
      WHERE us.exchange_token = $1
        AND us.exchange_token_expires > NOW()
        AND us.token_used = TRUE`,
      [token]
    );

    console.log('📥 Database returned', result.rows.length, 'rows');

    if (result.rows.length === 0) {
      console.log('❌ Exchange token not found or expired');
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired exchange token'
      });
    }

    const session = result.rows[0];
    console.log('✅ Exchange token valid for:', session.email);
    console.log('   Session token:', session.session_token ? session.session_token.substring(0, 20) + '...' : 'NONE');

    // Clear the exchange token (one-time use)
    await pool.query(
      `UPDATE user_sessions
       SET exchange_token = NULL,
           exchange_token_expires = NULL
       WHERE id = $1`,
      [session.session_id]
    );

    console.log('🧹 Exchange token cleared (one-time use)');

    // Set HTTP-only secure cookie
    res.cookie(SESSION_COOKIE_NAME, session.session_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
      path: '/'
    });

    console.log(`✅ Session cookie set for ${session.email}`);
    console.log(`✅ Returning sessionToken in response body for cross-origin`);

    // Return session data with sessionToken for cross-origin compatibility
    res.json({
      success: true,
      message: 'Session established',
      data: {
        sessionToken: session.session_token, // Include for cross-origin scenarios
        user: {
          firstName: session.first_name,
          lastName: session.last_name,
          email: session.email
        }
      }
    });

  } catch (error) {
    console.error('💥 ERROR in exchangeToken:', error);
    console.error('💥 Error name:', error.name);
    console.error('💥 Error message:', error.message);
    console.error('💥 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to exchange token',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
}

/**
 * Update user profile
 * PUT /api/auth/profile
 *
 * Updates user profile information in the database
 */
async function updateProfile(req, res) {
  try {
    const { first_name, last_name, organization, phone } = req.body;

    // Get session token from cookie or query parameter
    const sessionToken = req.cookies[SESSION_COOKIE_NAME] || req.query.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    console.log('🔧 Updating profile for session token:', sessionToken.substring(0, 20) + '...');

    // Get session to find user
    const sessionResult = await pool.query(
      `SELECT attendee_id, email FROM user_sessions
       WHERE session_token = $1 AND expires_at > NOW()
       LIMIT 1`,
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const session = sessionResult.rows[0];
    const userId = session.attendee_id;
    const userEmail = session.email;

    console.log('✅ Found user:', userEmail, 'ID:', userId);

    // Update user profile in attendee_profiles table
    const updateResult = await pool.query(
      `UPDATE attendee_profiles
       SET
         first_name = COALESCE($1, first_name),
         last_name = COALESCE($2, last_name),
         organization = COALESCE($3, organization),
         phone_number = COALESCE($4, phone_number),
         updated_at = NOW()
       WHERE id = $5
       RETURNING first_name, last_name, user_email, organization, phone_number`,
      [first_name, last_name, organization, phone, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const updatedUser = updateResult.rows[0];

    console.log('✅ Profile updated successfully for:', userEmail);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        email: updatedUser.user_email,
        organization: updatedUser.organization,
        phone: updatedUser.phone_number
      }
    });

  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}

module.exports = {
  requestLogin,
  verifyMagicLink,
  verifyMagicLinkRedirect,
  exchangeToken,
  getSession,
  logout,
  updateProfile,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRY_HOURS
};
