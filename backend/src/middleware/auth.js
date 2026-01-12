const crypto = require('crypto');
const { query } = require('../config/database');
const {
  USER_ROLES,
  ADMIN_USERS,
  BOARD_USERS,
  ADVISORY_USERS,
  ROLE_PERMISSIONS
} = require('../constants/boardMembers');

// Session expiry time (30 days for persistent sessions)
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000;

// In-memory cache for performance (backed by database for persistence)
const sessionCache = new Map();

/**
 * Get user role based on email
 */
function getUserRole(email) {
  const normalizedEmail = String(email || '').toLowerCase().trim();

  if (ADMIN_USERS.includes(normalizedEmail)) {
    return USER_ROLES.ADMIN;
  }
  if (BOARD_USERS.includes(normalizedEmail)) {
    return USER_ROLES.BOARD;
  }
  if (ADVISORY_USERS.includes(normalizedEmail)) {
    return USER_ROLES.ADVISORY;
  }
  return USER_ROLES.VIEWER;
}

/**
 * Generate a secure session token
 */
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a new session (stored in database for persistence)
 */
async function createSession(email, req = null) {
  const role = getUserRole(email);
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY);
  const ipAddress = req?.ip || req?.connection?.remoteAddress || null;
  const userAgent = req?.headers?.['user-agent'] || null;

  try {
    console.log('createSession: Starting for email:', email, 'role:', role);

    // Store session in database
    await query(`
      INSERT INTO admin_sessions (
        session_token, email, role, expires_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [sessionToken, email, role, expiresAt, ipAddress, userAgent]);

    console.log('createSession: Database insert successful');

    // Cache for performance
    sessionCache.set(sessionToken, {
      email,
      role,
      expiresAt: expiresAt.getTime(),
      createdAt: Date.now()
    });

    // Log session creation to audit log (non-fatal if it fails)
    try {
      await query(`
        INSERT INTO audit_log (
          action, user_email, details, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, ['login', email, JSON.stringify({ role, sessionToken: sessionToken.substring(0, 8) + '...' })]);
    } catch (auditError) {
      console.error('createSession: Audit log failed (non-fatal):', auditError.message);
    }

    console.log('createSession: Complete');
  } catch (error) {
    console.error('createSession: Failed:', error.message, error.stack);
    throw error;
  }

  return { sessionToken, expiresAt: expiresAt.getTime(), role };
}

/**
 * Verify session token (checks cache first, then database)
 */
async function verifySession(sessionToken) {
  // Check cache first
  let session = sessionCache.get(sessionToken);

  if (session) {
    // Check if cached session has expired
    if (Date.now() > session.expiresAt) {
      sessionCache.delete(sessionToken);
      // Also delete from database
      try {
        await query('DELETE FROM admin_sessions WHERE session_token = $1', [sessionToken]);
      } catch (e) { /* ignore cleanup errors */ }
      return null;
    }
    return session;
  }

  // Not in cache, check database
  try {
    const result = await query(`
      SELECT email, role, expires_at, created_at
      FROM admin_sessions
      WHERE session_token = $1 AND expires_at > NOW()
    `, [sessionToken]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    session = {
      email: row.email,
      role: row.role,
      expiresAt: new Date(row.expires_at).getTime(),
      createdAt: new Date(row.created_at).getTime()
    };

    // Update last activity
    await query(
      'UPDATE admin_sessions SET last_activity = NOW() WHERE session_token = $1',
      [sessionToken]
    );

    // Cache for future requests
    sessionCache.set(sessionToken, session);
    return session;
  } catch (error) {
    console.error('Failed to verify session:', error);
    return null;
  }
}

/**
 * Destroy a session (removes from both cache and database)
 */
async function destroySession(sessionToken) {
  const session = sessionCache.get(sessionToken);

  try {
    // Remove from database
    const result = await query(
      'DELETE FROM admin_sessions WHERE session_token = $1 RETURNING email',
      [sessionToken]
    );

    const email = session?.email || result.rows[0]?.email;

    if (email) {
      // Log session destruction to audit log
      await query(`
        INSERT INTO audit_log (
          action, user_email, details, created_at
        ) VALUES ($1, $2, $3, NOW())
      `, ['logout', email, JSON.stringify({ sessionToken: sessionToken.substring(0, 8) + '...' })]);
    }
  } catch (error) {
    console.error('Failed to destroy session:', error);
  }

  // Remove from cache
  sessionCache.delete(sessionToken);
}

/**
 * Clean up expired sessions (run periodically)
 */
async function cleanupExpiredSessions() {
  // Clean cache
  const now = Date.now();
  for (const [token, session] of sessionCache.entries()) {
    if (now > session.expiresAt) {
      sessionCache.delete(token);
    }
  }

  // Clean database
  try {
    const result = await query('DELETE FROM admin_sessions WHERE expires_at < NOW()');
    if (result.rowCount > 0) {
      console.log(`Cleaned up ${result.rowCount} expired sessions`);
    }
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

/**
 * Get user permissions
 */
function getUserPermissions(email) {
  const role = getUserRole(email);
  const permissions = ROLE_PERMISSIONS[role] || [];

  return {
    role,
    permissions,
    canAccessFinancials: [USER_ROLES.ADMIN, USER_ROLES.BOARD].includes(role),
    canManageUsers: role === USER_ROLES.ADMIN,
    canManageConference: [USER_ROLES.ADMIN, USER_ROLES.BOARD, USER_ROLES.ADVISORY].includes(role),
    canProcessVotes: [USER_ROLES.ADMIN, USER_ROLES.BOARD].includes(role), // Only ADMIN and BOARD can see/process board votes
    canSendEmails: [USER_ROLES.ADMIN, USER_ROLES.BOARD].includes(role),
    canUseAI: role === USER_ROLES.ADMIN
  };
}

/**
 * Simple API key authentication middleware (optional)
 * For now, we'll rely on email-based permissions from the frontend
 */
function optionalAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (apiKey && apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key'
    });
  }

  next();
}

/**
 * Authentication middleware - requires valid session
 */
async function requireAuth(req, res, next) {
  const sessionToken = req.headers.authorization?.replace('Bearer ', '');

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      error: 'No session token provided'
    });
  }

  try {
    const session = await verifySession(sessionToken);

    if (!session) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    // Attach session to request
    req.user = session;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error'
    });
  }
}

/**
 * Role-based authorization middleware
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions'
      });
    }

    next();
  };
}

module.exports = {
  getUserRole,
  getUserPermissions,
  optionalAuth,
  requireAuth,
  requireRole,
  createSession,
  verifySession,
  destroySession
};
