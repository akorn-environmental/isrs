const { pool } = require('../config/database');

/**
 * Funding Prospects Controller
 * Manages funding prospects tracking for organizations and individuals
 */

// Get all funding prospects with filters
exports.getAllProspects = async (req, res) => {
  try {
    const {
      status,
      prospect_type,
      tier,
      priority,
      assigned_to,
      follow_up_flag,
      search,
      sort_by = 'created_at',
      sort_order = 'DESC',
      limit,
      offset = 0
    } = req.query;

    let query = `
      SELECT
        fp.*,
        o.name as org_name,
        c.full_name as contact_full_name,
        c.email as contact_email_address,
        (SELECT COUNT(*) FROM funding_engagements WHERE prospect_id = fp.id) as engagement_count,
        (SELECT MAX(engagement_date) FROM funding_engagements WHERE prospect_id = fp.id) as last_engagement_date
      FROM funding_prospects fp
      LEFT JOIN organizations o ON fp.organization_id = o.id
      LEFT JOIN contacts c ON fp.contact_id = c.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 1;

    // Apply filters
    if (status) {
      query += ` AND fp.status = $${paramCount}`;
      values.push(status);
      paramCount++;
    }

    if (prospect_type) {
      query += ` AND fp.prospect_type = $${paramCount}`;
      values.push(prospect_type);
      paramCount++;
    }

    if (tier) {
      query += ` AND fp.tier = $${paramCount}`;
      values.push(parseInt(tier));
      paramCount++;
    }

    if (priority) {
      query += ` AND fp.priority = $${paramCount}`;
      values.push(priority);
      paramCount++;
    }

    if (assigned_to) {
      query += ` AND fp.assigned_to = $${paramCount}`;
      values.push(assigned_to);
      paramCount++;
    }

    if (follow_up_flag === 'true') {
      query += ` AND fp.follow_up_flag = TRUE`;
    }

    // Search across multiple fields
    if (search) {
      query += ` AND (
        fp.organization_name ILIKE $${paramCount} OR
        fp.contact_name ILIKE $${paramCount} OR
        fp.contact_email ILIKE $${paramCount} OR
        fp.notes ILIKE $${paramCount} OR
        fp.tags ILIKE $${paramCount}
      )`;
      values.push(`%${search}%`);
      paramCount++;
    }

    // Sorting
    const validSortColumns = ['created_at', 'updated_at', 'status', 'priority', 'tier', 'estimated_amount', 'next_follow_up_date'];
    const sortColumn = validSortColumns.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY fp.${sortColumn} ${sortDirection}`;

    // Pagination
    if (limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(parseInt(limit));
      paramCount++;
    }

    if (offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(parseInt(offset));
    }

    const result = await pool.query(query, values);

    // Get total count for pagination
    let countQuery = `SELECT COUNT(*) FROM funding_prospects fp WHERE 1=1`;
    const countValues = [];
    let countParamCount = 1;

    if (status) {
      countQuery += ` AND fp.status = $${countParamCount}`;
      countValues.push(status);
      countParamCount++;
    }
    if (prospect_type) {
      countQuery += ` AND fp.prospect_type = $${countParamCount}`;
      countValues.push(prospect_type);
      countParamCount++;
    }
    if (search) {
      countQuery += ` AND (
        fp.organization_name ILIKE $${countParamCount} OR
        fp.contact_name ILIKE $${countParamCount} OR
        fp.contact_email ILIKE $${countParamCount} OR
        fp.notes ILIKE $${countParamCount}
      )`;
      countValues.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countValues);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      total: totalCount,
      limit: limit ? parseInt(limit) : null,
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error fetching funding prospects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch funding prospects'
    });
  }
};

// Get single prospect by ID
exports.getProspectById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
        fp.*,
        o.name as org_name,
        c.full_name as contact_full_name,
        c.email as contact_email_address
      FROM funding_prospects fp
      LEFT JOIN organizations o ON fp.organization_id = o.id
      LEFT JOIN contacts c ON fp.contact_id = c.id
      WHERE fp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Funding prospect not found'
      });
    }

    // Get engagements for this prospect
    const engagements = await pool.query(
      `SELECT * FROM funding_engagements
       WHERE prospect_id = $1
       ORDER BY engagement_date DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        engagements: engagements.rows
      }
    });
  } catch (error) {
    console.error('Error fetching prospect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prospect'
    });
  }
};

// Create new funding prospect
exports.createProspect = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const prospectData = req.body;

    const query = `
      INSERT INTO funding_prospects (
        prospect_type, organization_id, organization_name, organization_type,
        contact_id, contact_name, contact_email, contact_phone, contact_title,
        funding_type, funding_focus, estimated_amount, currency, funding_cycle,
        status, priority, tier,
        first_contact_date, last_contact_date, next_follow_up_date,
        assigned_to, website_url, address, city, state_province, country, postal_code,
        notes, tags, internal_notes, source, source_details,
        created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
      ) RETURNING *
    `;

    const values = [
      prospectData.prospect_type,
      prospectData.organization_id || null,
      prospectData.organization_name || null,
      prospectData.organization_type || null,
      prospectData.contact_id || null,
      prospectData.contact_name || null,
      prospectData.contact_email || null,
      prospectData.contact_phone || null,
      prospectData.contact_title || null,
      prospectData.funding_type || null,
      prospectData.funding_focus || null,
      prospectData.estimated_amount || null,
      prospectData.currency || 'USD',
      prospectData.funding_cycle || null,
      prospectData.status || 'prospect',
      prospectData.priority || 'medium',
      prospectData.tier || 2,
      prospectData.first_contact_date || null,
      prospectData.last_contact_date || null,
      prospectData.next_follow_up_date || null,
      prospectData.assigned_to || null,
      prospectData.website_url || null,
      prospectData.address || null,
      prospectData.city || null,
      prospectData.state_province || null,
      prospectData.country || 'United States',
      prospectData.postal_code || null,
      prospectData.notes || null,
      prospectData.tags || null,
      prospectData.internal_notes || null,
      prospectData.source || null,
      prospectData.source_details || null,
      userEmail
    ];

    const result = await pool.query(query, values);

    // Log activity
    await pool.query(
      `INSERT INTO funding_activities (
        prospect_id, action_type, action_description, user_email, user_name
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        result.rows[0].id,
        'created',
        `Created new funding prospect: ${prospectData.organization_name || prospectData.contact_name}`,
        userEmail,
        req.user.name || userEmail
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Funding prospect created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating prospect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create funding prospect'
    });
  }
};

// Update funding prospect
exports.updateProspect = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    const updates = req.body;

    // Get current prospect for activity logging
    const current = await pool.query(
      'SELECT * FROM funding_prospects WHERE id = $1',
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prospect not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = [
      'prospect_type', 'organization_id', 'organization_name', 'organization_type',
      'contact_id', 'contact_name', 'contact_email', 'contact_phone', 'contact_title',
      'funding_type', 'funding_focus', 'estimated_amount', 'currency', 'funding_cycle',
      'status', 'priority', 'tier',
      'first_contact_date', 'last_contact_date', 'next_follow_up_date',
      'application_submitted_date', 'decision_date', 'award_date',
      'assigned_to', 'follow_up_flag', 'follow_up_assigned_to', 'follow_up_notes',
      'proposal_status', 'proposal_deadline', 'reporting_requirements', 'compliance_status',
      'awarded_amount', 'award_start_date', 'award_end_date', 'award_restrictions',
      'website_url', 'address', 'city', 'state_province', 'country', 'postal_code',
      'notes', 'tags', 'internal_notes', 'source', 'source_details'
    ];

    allowedFields.forEach(field => {
      if (updates.hasOwnProperty(field)) {
        updateFields.push(`${field} = $${paramCount}`);
        values.push(updates[field]);
        paramCount++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE funding_prospects
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    // Log status changes
    if (updates.status && updates.status !== current.rows[0].status) {
      await pool.query(
        `INSERT INTO funding_activities (
          prospect_id, action_type, action_description, old_value, new_value, field_name, user_email, user_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          id,
          'status_changed',
          `Status changed from ${current.rows[0].status} to ${updates.status}`,
          current.rows[0].status,
          updates.status,
          'status',
          userEmail,
          req.user.name || userEmail
        ]
      );
    }

    res.json({
      success: true,
      message: 'Prospect updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating prospect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update prospect'
    });
  }
};

// Delete funding prospect
exports.deleteProspect = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;

    const result = await pool.query(
      'DELETE FROM funding_prospects WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prospect not found'
      });
    }

    res.json({
      success: true,
      message: 'Prospect deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting prospect:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete prospect'
    });
  }
};

// Toggle follow-up flag
exports.toggleFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const { follow_up_flag, follow_up_assigned_to, follow_up_notes, next_follow_up_date } = req.body;
    const userEmail = req.user.email;

    const result = await pool.query(
      `UPDATE funding_prospects
       SET follow_up_flag = $1,
           follow_up_assigned_to = $2,
           follow_up_notes = $3,
           next_follow_up_date = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [follow_up_flag, follow_up_assigned_to, follow_up_notes, next_follow_up_date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Prospect not found'
      });
    }

    // Log activity
    await pool.query(
      `INSERT INTO funding_activities (
        prospect_id, action_type, action_description, user_email, user_name
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        'follow_up_added',
        follow_up_flag ? 'Follow-up flag set' : 'Follow-up flag cleared',
        userEmail,
        req.user.name || userEmail
      ]
    );

    res.json({
      success: true,
      message: 'Follow-up updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update follow-up'
    });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funding_dashboard_stats');

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard stats'
    });
  }
};

// Create engagement
exports.createEngagement = async (req, res) => {
  try {
    const { prospect_id } = req.params;
    const userEmail = req.user.email;
    const engagementData = req.body;

    const query = `
      INSERT INTO funding_engagements (
        prospect_id, engagement_type, engagement_date, duration_minutes,
        isrs_participants, prospect_participants, subject, notes, outcome,
        requires_follow_up, follow_up_date, attachments, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const values = [
      prospect_id,
      engagementData.engagement_type,
      engagementData.engagement_date,
      engagementData.duration_minutes || null,
      engagementData.isrs_participants || null,
      engagementData.prospect_participants || null,
      engagementData.subject || null,
      engagementData.notes || null,
      engagementData.outcome || null,
      engagementData.requires_follow_up || false,
      engagementData.follow_up_date || null,
      engagementData.attachments || null,
      userEmail
    ];

    const result = await pool.query(query, values);

    // Update last_contact_date on prospect
    await pool.query(
      `UPDATE funding_prospects
       SET last_contact_date = $1
       WHERE id = $2`,
      [engagementData.engagement_date, prospect_id]
    );

    // Log activity
    await pool.query(
      `INSERT INTO funding_activities (
        prospect_id, action_type, action_description, user_email, user_name
      ) VALUES ($1, $2, $3, $4, $5)`,
      [
        prospect_id,
        'engagement_logged',
        `Logged ${engagementData.engagement_type} engagement`,
        userEmail,
        req.user.name || userEmail
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Engagement created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating engagement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create engagement'
    });
  }
};

// Get engagements for a prospect
exports.getEngagements = async (req, res) => {
  try {
    const { prospect_id } = req.params;

    const result = await pool.query(
      `SELECT * FROM funding_engagements
       WHERE prospect_id = $1
       ORDER BY engagement_date DESC`,
      [prospect_id]
    );

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching engagements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch engagements'
    });
  }
};

// Get activity log
exports.getActivities = async (req, res) => {
  try {
    const { prospect_id } = req.params;
    const { limit = 50 } = req.query;

    let query = `
      SELECT * FROM funding_activities
    `;

    const values = [];
    if (prospect_id) {
      query += ` WHERE prospect_id = $1`;
      values.push(prospect_id);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
    values.push(parseInt(limit));

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities'
    });
  }
};
