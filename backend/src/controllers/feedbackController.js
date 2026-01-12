const { pool } = require('../config/database');

/**
 * Submit user feedback
 */
async function submitFeedback(req, res) {
  try {
    const {
      user_email,
      user_name,
      user_id,
      session_id,
      page_url,
      page_title,
      component_name,
      feedback_type = 'general',
      rating,
      subject,
      message,
      browser_info,
      is_admin_portal = false
    } = req.body;

    // Validation
    if (!page_url || !message) {
      return res.status(400).json({
        success: false,
        error: 'Page URL and message are required'
      });
    }

    if (message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long (max 5000 characters)'
      });
    }

    // Get IP address and user agent from request
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];

    // Insert feedback
    const result = await pool.query(`
      INSERT INTO feedback_submissions (
        user_email, user_name, user_id, session_id,
        page_url, page_title, component_name, feedback_type, rating,
        subject, message, browser_info, user_agent, ip_address, is_admin_portal
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, created_at
    `, [
      user_email,
      user_name,
      user_id,
      session_id,
      page_url,
      page_title,
      component_name,
      feedback_type,
      rating,
      subject,
      message,
      browser_info ? JSON.stringify(browser_info) : null,
      user_agent,
      ip_address,
      is_admin_portal
    ]);

    console.log(`✅ Feedback submitted: ${result.rows[0].id}`);

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        created_at: result.rows[0].created_at
      },
      message: 'Thank you for your feedback!'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
}

/**
 * Get all feedback (admin only)
 */
async function getAllFeedback(req, res) {
  try {
    const {
      status,
      feedback_type,
      is_admin_portal,
      limit = 100,
      offset = 0
    } = req.query;

    let query = 'SELECT * FROM feedback_submissions WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (feedback_type) {
      query += ` AND feedback_type = $${paramCount}`;
      params.push(feedback_type);
      paramCount++;
    }

    if (is_admin_portal !== undefined) {
      query += ` AND is_admin_portal = $${paramCount}`;
      params.push(is_admin_portal === 'true');
      paramCount++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    const countQuery = 'SELECT COUNT(*) FROM feedback_submissions WHERE 1=1' +
      (status ? ` AND status = '${status}'` : '') +
      (feedback_type ? ` AND feedback_type = '${feedback_type}'` : '') +
      (is_admin_portal !== undefined ? ` AND is_admin_portal = ${is_admin_portal === 'true'}` : '');

    const countResult = await pool.query(countQuery);

    res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback'
    });
  }
}

/**
 * Get feedback summary
 */
async function getFeedbackSummary(req, res) {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT * FROM daily_feedback_summary
      WHERE feedback_date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
      ORDER BY feedback_date DESC
    `);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Error fetching feedback summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback summary'
    });
  }
}

/**
 * Update feedback status (admin only)
 */
async function updateFeedbackStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, priority, notes, reviewed_by } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (status) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (priority) {
      updates.push(`priority = $${paramCount}`);
      params.push(priority);
      paramCount++;
    }

    if (notes) {
      updates.push(`notes = $${paramCount}`);
      params.push(notes);
      paramCount++;
    }

    if (reviewed_by) {
      updates.push(`reviewed_by = $${paramCount}, reviewed_at = NOW()`);
      params.push(reviewed_by);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No updates provided'
      });
    }

    params.push(id);
    const result = await pool.query(`
      UPDATE feedback_submissions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update feedback'
    });
  }
}

module.exports = {
  submitFeedback,
  getAllFeedback,
  getFeedbackSummary,
  updateFeedbackStatus
};
