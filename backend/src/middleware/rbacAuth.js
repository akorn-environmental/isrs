/**
 * RBAC Authentication Middleware
 * Role-Based Access Control with HTTP-only cookies and database-driven permissions
 *
 * Replaces hardcoded admin users with dynamic RBAC system
 */

const { pool } = require('../config/database');
const { SESSION_COOKIE_NAME } = require('../controllers/unifiedAuthController');

/**
 * Middleware: Require authentication
 * Reads session from HTTP-only cookie and attaches user to req.user
 */
async function requireAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'NO_SESSION'
      });
    }

    // Verify session in database
    const sessionResult = await pool.query(
      `SELECT
        us.id as session_id,
        us.attendee_id as user_id,
        us.email,
        us.session_expires_at,
        us.roles_snapshot,
        us.permissions_snapshot,
        ap.first_name,
        ap.last_name,
        ap.user_email
      FROM user_sessions us
      JOIN attendee_profiles ap ON us.attendee_id = ap.id
      WHERE us.session_token = $1
        AND us.session_expires_at > NOW()`,
      [sessionToken]
    );

    if (sessionResult.rows.length === 0) {
      res.clearCookie(SESSION_COOKIE_NAME);
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid',
        code: 'SESSION_EXPIRED'
      });
    }

    const session = sessionResult.rows[0];

    // Get roles and permissions from snapshot (JSONB already parsed by node-postgres)
    const roles = session.roles_snapshot || [];
    const permissions = session.permissions_snapshot || {};

    // Attach user info to request
    req.user = {
      id: session.user_id,
      email: session.user_email,
      firstName: session.first_name,
      lastName: session.last_name,
      fullName: `${session.first_name} ${session.last_name}`.trim(),
      roles,
      permissions,
      primaryRole: roles[0] || { name: 'member', level: 50 },
      sessionId: session.session_id
    };

    // Update last activity
    await pool.query(
      `UPDATE user_sessions SET last_activity = NOW() WHERE id = $1`,
      [session.session_id]
    );

    next();

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
}

/**
 * Middleware: Require specific permission
 * Usage: requirePermission('users.edit.all')
 */
function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
      // Ensure user is authenticated first
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      // Check if user has the required permission
      const hasPermission = await checkUserPermission(req.user.id, permissionName);

      if (!hasPermission) {
        // Log permission check failure
        await pool.query(
          `INSERT INTO session_activity_log (
            session_id, user_id, activity_type, resource_accessed,
            action_attempted, permission_granted
          ) VALUES ($1, $2, 'permission_check', $3, $4, false)`,
          [
            req.user.sessionId,
            req.user.id,
            permissionName.split('.')[0], // resource
            permissionName // full permission
          ]
        );

        return res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          requiredPermission: permissionName
        });
      }

      // Log successful permission check
      await pool.query(
        `INSERT INTO session_activity_log (
          session_id, user_id, activity_type, resource_accessed,
          action_attempted, permission_granted
        ) VALUES ($1, $2, 'permission_check', $3, $4, true)`,
        [
          req.user.sessionId,
          req.user.id,
          permissionName.split('.')[0],
          permissionName
        ]
      );

      next();

    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware: Require minimum permission level
 * Usage: requirePermissionLevel(80) // Board member or higher
 */
function requirePermissionLevel(minLevel) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const userLevel = req.user.primaryRole?.level || 0;

      if (userLevel < minLevel) {
        return res.status(403).json({
          success: false,
          error: 'Insufficient access level',
          code: 'FORBIDDEN',
          requiredLevel: minLevel,
          userLevel
        });
      }

      next();

    } catch (error) {
      console.error('Permission level check error:', error);
      res.status(500).json({
        success: false,
        error: 'Permission check failed'
      });
    }
  };
}

/**
 * Middleware: Require specific role
 * Usage: requireRole('board_member')
 */
function requireRole(roleName) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const hasRole = req.user.roles.some(r => r.name === roleName);

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          error: 'Required role not found',
          code: 'FORBIDDEN',
          requiredRole: roleName
        });
      }

      next();

    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Role check failed'
      });
    }
  };
}

/**
 * Middleware: Require any of the specified roles
 * Usage: requireAnyRole(['board_member', 'advisory_panel'])
 */
function requireAnyRole(roleNames) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }

      const hasAnyRole = req.user.roles.some(r => roleNames.includes(r.name));

      if (!hasAnyRole) {
        return res.status(403).json({
          success: false,
          error: 'Required role not found',
          code: 'FORBIDDEN',
          requiredRoles: roleNames
        });
      }

      next();

    } catch (error) {
      console.error('Role check error:', error);
      res.status(500).json({
        success: false,
        error: 'Role check failed'
      });
    }
  };
}

/**
 * Helper: Check if user has specific permission
 */
async function checkUserPermission(userId, permissionName) {
  try {
    const result = await pool.query(
      `SELECT user_has_permission($1, $2) as has_permission`,
      [userId, permissionName]
    );

    return result.rows[0]?.has_permission || false;

  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
}

/**
 * Helper: Get user's permission level
 */
async function getUserPermissionLevel(userId) {
  try {
    const result = await pool.query(
      `SELECT get_user_max_permission_level($1) as level`,
      [userId]
    );

    return result.rows[0]?.level || 0;

  } catch (error) {
    console.error('Error getting permission level:', error);
    return 0;
  }
}

/**
 * Helper: Get all user roles
 */
async function getUserRoles(userId) {
  try {
    const result = await pool.query(
      `SELECT * FROM get_user_roles($1)`,
      [userId]
    );

    return result.rows;

  } catch (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
}

/**
 * Helper: Get all user permissions
 */
async function getUserPermissions(userId) {
  try {
    const result = await pool.query(
      `SELECT * FROM get_user_permissions($1)`,
      [userId]
    );

    return result.rows;

  } catch (error) {
    console.error('Error getting user permissions:', error);
    return [];
  }
}

/**
 * Middleware: Optional auth - doesn't fail if not authenticated
 * Useful for endpoints that show different data to authenticated users
 */
async function optionalAuth(req, res, next) {
  try {
    const sessionToken = req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionToken) {
      req.user = null;
      return next();
    }

    const sessionResult = await pool.query(
      `SELECT
        us.id as session_id,
        us.attendee_id as user_id,
        us.email,
        us.roles_snapshot,
        us.permissions_snapshot,
        ap.first_name,
        ap.last_name,
        ap.user_email
      FROM user_sessions us
      JOIN attendee_profiles ap ON us.attendee_id = ap.id
      WHERE us.session_token = $1
        AND us.session_expires_at > NOW()`,
      [sessionToken]
    );

    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      const roles = session.roles_snapshot || [];
      const permissions = session.permissions_snapshot || {};

      req.user = {
        id: session.user_id,
        email: session.user_email,
        firstName: session.first_name,
        lastName: session.last_name,
        roles,
        permissions,
        primaryRole: roles[0] || { name: 'member', level: 50 },
        sessionId: session.session_id
      };
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
}

module.exports = {
  requireAuth,
  requirePermission,
  requirePermissionLevel,
  requireRole,
  requireAnyRole,
  optionalAuth,
  // Helper functions
  checkUserPermission,
  getUserPermissionLevel,
  getUserRoles,
  getUserPermissions
};
