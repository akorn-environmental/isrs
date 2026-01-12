const { pool } = require('../config/database');

/**
 * Profile Controller
 * Handles user profile management for board members, AP members, and conference planners
 */

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;

    const result = await pool.query(
      `SELECT
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.full_name,
        c.title,
        c.role,
        c.phone,
        c.country,
        c.state_province,
        c.city,
        c.expertise,
        c.interests,
        c.notes as bio,
        o.name as organization_name,
        o.id as organization_id,
        au.role as admin_role,
        au.access_level,
        c.created_at,
        c.updated_at
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN admin_users au ON c.email = au.email
      WHERE c.email = $1`,
      [userEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

// Update current user's profile
exports.updateMyProfile = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const {
      first_name,
      last_name,
      phone,
      country,
      state_province,
      city,
      expertise,
      interests,
      bio,
      organization_id
    } = req.body;

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (first_name !== undefined) {
      updates.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }

    if (last_name !== undefined) {
      updates.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }

    // Auto-generate full_name if first or last name changed
    if (first_name !== undefined || last_name !== undefined) {
      const nameResult = await pool.query(
        'SELECT first_name, last_name FROM contacts WHERE email = $1',
        [userEmail]
      );
      const current = nameResult.rows[0];
      const newFirstName = first_name || current.first_name;
      const newLastName = last_name || current.last_name;
      updates.push(`full_name = $${paramCount}`);
      values.push(`${newFirstName} ${newLastName}`);
      paramCount++;
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (country !== undefined) {
      updates.push(`country = $${paramCount}`);
      values.push(country);
      paramCount++;
    }

    if (state_province !== undefined) {
      updates.push(`state_province = $${paramCount}`);
      values.push(state_province);
      paramCount++;
    }

    if (city !== undefined) {
      updates.push(`city = $${paramCount}`);
      values.push(city);
      paramCount++;
    }

    if (expertise !== undefined) {
      updates.push(`expertise = $${paramCount}`);
      values.push(expertise);
      paramCount++;
    }

    if (interests !== undefined) {
      updates.push(`interests = $${paramCount}`);
      values.push(interests);
      paramCount++;
    }

    if (bio !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(bio);
      paramCount++;
    }

    if (organization_id !== undefined) {
      updates.push(`organization_id = $${paramCount}`);
      values.push(organization_id || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(userEmail);

    const query = `
      UPDATE contacts
      SET ${updates.join(', ')}
      WHERE email = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
};

// Get profile by ID (admin only - for viewing other profiles)
exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.full_name,
        c.title,
        c.role,
        c.phone,
        c.country,
        c.state_province,
        c.city,
        c.expertise,
        c.interests,
        c.notes as bio,
        o.name as organization_name,
        o.id as organization_id,
        au.role as admin_role,
        au.access_level,
        c.created_at,
        c.updated_at
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN admin_users au ON c.email = au.email
      WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching profile by ID:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
};

// Get all profiles with admin access (for admin directory)
exports.getAllAdminProfiles = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        c.id,
        c.email,
        c.first_name,
        c.last_name,
        c.full_name,
        c.title,
        c.role,
        c.phone,
        c.country,
        c.state_province,
        c.city,
        o.name as organization_name,
        au.role as admin_role,
        au.access_level,
        c.created_at
      FROM contacts c
      LEFT JOIN organizations o ON c.organization_id = o.id
      INNER JOIN admin_users au ON c.email = au.email
      ORDER BY
        CASE
          WHEN c.role = 'Board Chair' THEN 1
          WHEN c.role = 'Board Vice Chair' THEN 2
          WHEN c.role = 'Board Member' THEN 3
          WHEN c.role = 'AP Member' THEN 4
          WHEN c.role = 'Conference Planner' THEN 5
          WHEN c.role = 'Partner' THEN 6
          ELSE 7
        END,
        c.last_name ASC`
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching admin profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profiles'
    });
  }
};
