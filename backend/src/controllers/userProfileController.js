/**
 * User Profile Controller
 * Handles user profile management, magic link authentication, and sessions
 */

const { pool, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { sendMagicLink } = require('../services/emailService');

// Helper for development-only logging
const devLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args);
  }
};

// Mask email for safe logging
const maskEmail = (email) => {
  if (!email) return '[no email]';
  const [local, domain] = email.split('@');
  return `${local.substring(0, 2)}***@${domain}`;
};

/**
 * Send magic link to user email
 * POST /api/profile/request-login
 */
async function requestMagicLink(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userResult = await pool.query(
      'SELECT id, first_name, last_name FROM attendee_profiles WHERE user_email = $1',
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email address'
      });
    }

    const user = userResult.rows[0];

    // Generate magic link token
    const magicToken = crypto.randomBytes(32).toString('hex');
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    await pool.query(`
      INSERT INTO user_sessions (
        attendee_id, email, magic_link_token, token_expires_at, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      user.id,
      normalizedEmail,
      magicToken,
      tokenExpiresAt,
      req.ip,
      req.get('user-agent')
    ]);

    // Send email with magic link
    const siteHost = process.env.FRONTEND_URL || `${req.protocol}://${req.get('host')}`;
    const magicLink = `${siteHost}/member/verify.html?token=${magicToken}`;

    devLog(`🔐 Magic link generated for ${maskEmail(normalizedEmail)}`);

    // Send the magic link email
    try {
      await sendMagicLink(normalizedEmail, user.first_name, magicLink);
      devLog(`✅ Magic link email sent to ${maskEmail(normalizedEmail)}`);
    } catch (emailError) {
      console.error('Failed to send magic link email:', emailError);
      // Continue anyway - email failure shouldn't block the response
    }

    res.json({
      success: true,
      message: 'Magic link sent to your email',
      // Include link in development mode for easier testing
      magicLink: process.env.NODE_ENV !== 'production' ? magicLink : undefined
    });

  } catch (error) {
    console.error('Error sending magic link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send magic link'
    });
  }
}

/**
 * Verify magic link token and create session
 * POST /api/profile/verify-magic-link
 */
async function verifyMagicLink(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Token is required'
      });
    }

    // Find and verify token, also check for admin privileges
    const tokenResult = await pool.query(`
      SELECT
        us.*,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        au.role AS admin_role,
        au.access_level AS admin_access_level
      FROM user_sessions us
      JOIN attendee_profiles ap ON us.attendee_id = ap.id
      LEFT JOIN admin_users au ON ap.id = au.attendee_id
      WHERE us.magic_link_token = $1
      AND us.token_used = FALSE
      AND us.token_expires_at > NOW()
    `, [token]);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired magic link'
      });
    }

    const session = tokenResult.rows[0];

    // Generate session token
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Mark magic link as used and create session
    await pool.query(`
      UPDATE user_sessions
      SET token_used = TRUE,
          token_used_at = NOW(),
          session_token = $1,
          session_expires_at = $2,
          last_activity = NOW()
      WHERE id = $3
    `, [sessionToken, sessionExpiresAt, session.id]);

    // Update attendee profile
    await pool.query(`
      UPDATE attendee_profiles
      SET email_verified = TRUE,
          email_verified_at = COALESCE(email_verified_at, NOW()),
          last_login_at = NOW(),
          login_count = login_count + 1
      WHERE id = $1
    `, [session.attendee_id]);

    // Build user response with admin info if applicable
    const userData = {
      id: session.attendee_id,
      email: session.user_email,
      firstName: session.first_name,
      lastName: session.last_name
    };

    // Add admin info if user has admin privileges
    if (session.admin_role) {
      userData.isAdmin = true;
      userData.adminRole = session.admin_role;
      userData.adminAccessLevel = session.admin_access_level;
    }

    res.json({
      success: true,
      data: {
        sessionToken,
        expiresAt: sessionExpiresAt,
        user: userData
      }
    });

  } catch (error) {
    console.error('Error verifying magic link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify magic link'
    });
  }
}

/**
 * Get user profile and associated data
 * GET /api/profile/me
 */
async function getProfile(req, res) {
  try {
    const { sessionToken } = req.query;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token required'
      });
    }

    // Verify session
    const sessionResult = await pool.query(`
      SELECT attendee_id
      FROM user_sessions
      WHERE session_token = $1
      AND session_expires_at > NOW()
    `, [sessionToken]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const attendeeId = sessionResult.rows[0].attendee_id;

    // Get profile with admin info if applicable
    const profileResult = await pool.query(`
      SELECT
        ap.*,
        au.role AS admin_role,
        au.access_level AS admin_access_level,
        au.full_name AS admin_full_name
      FROM attendee_profiles ap
      LEFT JOIN admin_users au ON ap.id = au.attendee_id
      WHERE ap.id = $1
    `, [attendeeId]);

    // Get conference history (enriched participation data)
    const historyResult = await pool.query(`
      SELECT
        ce.year,
        ce.name,
        ce.location,
        mch.attendance_type,
        mch.roles,
        mch.presentations,
        mch.sponsor_level,
        mch.booth_number
      FROM member_conference_history mch
      JOIN conference_editions ce ON mch.conference_id = ce.id
      WHERE mch.attendee_id = $1
      ORDER BY ce.year DESC
    `, [attendeeId]);

    // Get registrations
    const registrationsResult = await pool.query(`
      SELECT
        cr.*,
        ce.year, ce.name as conference_name, ce.start_date, ce.end_date
      FROM conference_registrations cr
      JOIN conference_editions ce ON cr.conference_id = ce.id
      WHERE cr.attendee_id = $1
      ORDER BY ce.year DESC
    `, [attendeeId]);

    // Get abstract submissions
    const abstractsResult = await pool.query(`
      SELECT
        abs.*,
        ce.year, ce.name as conference_name
      FROM abstract_submissions abs
      JOIN conference_editions ce ON abs.conference_id = ce.id
      WHERE abs.attendee_id = $1
      ORDER BY abs.submission_date DESC
    `, [attendeeId]);

    // Update last activity
    await pool.query(`
      UPDATE user_sessions
      SET last_activity = NOW()
      WHERE session_token = $1
    `, [sessionToken]);

    const profile = profileResult.rows[0];

    // Build response with admin info if applicable
    const responseData = {
      profile: profile,
      conferenceHistory: historyResult.rows,
      registrations: registrationsResult.rows,
      abstracts: abstractsResult.rows,
      // Flag for first-time setup
      requiresFirstTimeSetup: !profile.privacy_consent_given || profile.profile_completion_score < 40
    };

    // Add admin info if user has admin privileges
    if (profile.admin_role) {
      responseData.adminInfo = {
        isAdmin: true,
        role: profile.admin_role,
        accessLevel: profile.admin_access_level,
        fullName: profile.admin_full_name
      };
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
}

/**
 * Update user profile
 * PUT /api/profile/me
 */
async function updateProfile(req, res) {
  try {
    const { sessionToken, ...updates } = req.body;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token required'
      });
    }

    // Verify session
    const sessionResult = await pool.query(`
      SELECT attendee_id
      FROM user_sessions
      WHERE session_token = $1
      AND session_expires_at > NOW()
    `, [sessionToken]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const attendeeId = sessionResult.rows[0].attendee_id;

    // Build update query
    const allowedFields = [
      'first_name', 'last_name', 'organization_name', 'position', 'department',
      'phone', 'country', 'city', 'bio', 'website', 'linkedin_url',
      'twitter_handle', 'orcid', 'research_areas', 'expertise_keywords',
      'preferred_language', 'timezone', 'profile_photo_url',
      'directory_opt_in', 'directory_visible_fields', 'notification_preferences'
    ];

    // Handle privacy consent separately (only set once with IP)
    if (updates.privacy_consent_given && !updates.privacy_consent_date) {
      await pool.query(`
        UPDATE attendee_profiles
        SET privacy_consent_given = TRUE,
            privacy_consent_date = NOW(),
            privacy_consent_ip = $2,
            terms_accepted = TRUE,
            terms_accepted_date = NOW()
        WHERE id = $1 AND privacy_consent_given = FALSE
      `, [attendeeId, req.ip]);
    }

    const updateFields = Object.keys(updates).filter(key => allowedFields.includes(key));

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    const setClause = updateFields.map((field, index) => `${field} = $${index + 2}`).join(', ');
    const values = [attendeeId, ...updateFields.map(field => updates[field])];

    const result = await pool.query(`
      UPDATE attendee_profiles
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, values);

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}

/**
 * Logout - invalidate session
 * POST /api/profile/logout
 */
async function logout(req, res) {
  try {
    const { sessionToken } = req.body;

    if (sessionToken) {
      await pool.query(
        'DELETE FROM user_sessions WHERE session_token = $1',
        [sessionToken]
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
}

/**
 * Get member directory (public profiles)
 * GET /api/profile/directory
 */
async function getMemberDirectory(req, res) {
  try {
    const { search, country, expertise, conference } = req.query;

    let query = `
      SELECT * FROM member_directory
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Search filter
    if (search) {
      query += ` AND (
        full_name ILIKE $${paramCount}
        OR organization ILIKE $${paramCount}
        OR bio ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    // Country filter
    if (country) {
      query += ` AND country = $${paramCount}`;
      params.push(country);
      paramCount++;
    }

    // Expertise filter
    if (expertise) {
      query += ` AND (
        $${paramCount} = ANY(research_areas)
        OR $${paramCount} = ANY(expertise_keywords)
      )`;
      params.push(expertise);
      paramCount++;
    }

    // Conference filter - check if they participated in a specific year
    if (conference) {
      query += ` AND conference_history @> '[{"year": ${parseInt(conference)}}]'::jsonb`;
    }

    query += ` ORDER BY profile_completion_score DESC, full_name ASC LIMIT 100`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });

  } catch (error) {
    console.error('Error getting member directory:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get member directory'
    });
  }
}

/**
 * Request data export (GDPR compliance)
 * POST /api/profile/request-data-export
 */
async function requestDataExport(req, res) {
  try {
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token required'
      });
    }

    // Verify session
    const sessionResult = await pool.query(`
      SELECT attendee_id, email
      FROM user_sessions
      WHERE session_token = $1
      AND session_expires_at > NOW()
    `, [sessionToken]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const { attendee_id, email } = sessionResult.rows[0];

    // Create export request
    await pool.query(`
      INSERT INTO data_export_requests (
        attendee_id, request_type, requested_by_email, requested_by_ip
      ) VALUES ($1, 'data_export', $2, $3)
    `, [attendee_id, email, req.ip]);

    // Update profile
    await pool.query(`
      UPDATE attendee_profiles
      SET data_export_requested_at = NOW()
      WHERE id = $1
    `, [attendee_id]);

    res.json({
      success: true,
      message: 'Data export request submitted. You will receive an email with your data within 48 hours.'
    });

  } catch (error) {
    console.error('Error requesting data export:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request data export'
    });
  }
}

/**
 * Request account deletion (GDPR compliance)
 * POST /api/profile/request-account-deletion
 */
async function requestAccountDeletion(req, res) {
  try {
    const { sessionToken, reason } = req.body;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Session token required'
      });
    }

    // Verify session
    const sessionResult = await pool.query(`
      SELECT attendee_id, email
      FROM user_sessions
      WHERE session_token = $1
      AND session_expires_at > NOW()
    `, [sessionToken]);

    if (sessionResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session'
      });
    }

    const { attendee_id, email } = sessionResult.rows[0];

    // Create deletion request
    await pool.query(`
      INSERT INTO data_export_requests (
        attendee_id, request_type, requested_by_email, requested_by_ip, deletion_reason
      ) VALUES ($1, 'account_deletion', $2, $3, $4)
    `, [attendee_id, email, req.ip, reason || '']);

    // Update profile
    await pool.query(`
      UPDATE attendee_profiles
      SET account_deletion_requested_at = NOW(),
          account_status = 'deletion_requested'
      WHERE id = $1
    `, [attendee_id]);

    // Invalidate all sessions
    await pool.query(`
      DELETE FROM user_sessions WHERE attendee_id = $1
    `, [attendee_id]);

    res.json({
      success: true,
      message: 'Account deletion request submitted. Your account will be reviewed and deleted within 7 days.'
    });

  } catch (error) {
    console.error('Error requesting account deletion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to request account deletion'
    });
  }
}

module.exports = {
  requestMagicLink,
  verifyMagicLink,
  getProfile,
  updateProfile,
  logout,
  getMemberDirectory,
  requestDataExport,
  requestAccountDeletion
};
