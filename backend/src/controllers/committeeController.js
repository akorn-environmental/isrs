const { pool } = require('../config/database');

/**
 * Get all active committees
 */
async function getAllCommittees(req, res) {
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        chair.first_name || ' ' || chair.last_name AS chair_name,
        chair.email AS chair_email,
        vice.first_name || ' ' || vice.last_name AS vice_chair_name,
        (SELECT COUNT(*) FROM committee_members WHERE committee_id = c.id AND is_active = TRUE) AS member_count
      FROM committees c
      LEFT JOIN attendee_profiles chair ON c.chair_id = chair.id
      LEFT JOIN attendee_profiles vice ON c.vice_chair_id = vice.id
      WHERE c.is_active = TRUE
      ORDER BY
        CASE c.type
          WHEN 'board' THEN 1
          WHEN 'advisory_panel' THEN 2
          WHEN 'standing' THEN 3
          WHEN 'ad_hoc' THEN 4
        END,
        c.name
    `);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching committees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch committees'
    });
  }
}

/**
 * Get committee by ID with members
 */
async function getCommitteeById(req, res) {
  try {
    const { id } = req.params;

    const committeeResult = await pool.query(`
      SELECT
        c.*,
        chair.first_name || ' ' || chair.last_name AS chair_name,
        chair.email AS chair_email,
        vice.first_name || ' ' || vice.last_name AS vice_chair_name
      FROM committees c
      LEFT JOIN attendee_profiles chair ON c.chair_id = chair.id
      LEFT JOIN attendee_profiles vice ON c.vice_chair_id = vice.id
      WHERE c.id = $1
    `, [id]);

    if (committeeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Committee not found'
      });
    }

    const membersResult = await pool.query(`
      SELECT
        cm.*,
        p.first_name,
        p.last_name,
        p.email,
        p.organization_name,
        p.position
      FROM committee_members cm
      JOIN attendee_profiles p ON cm.member_id = p.id
      WHERE cm.committee_id = $1 AND cm.is_active = TRUE
      ORDER BY
        CASE cm.role
          WHEN 'Chair' THEN 1
          WHEN 'Vice Chair' THEN 2
          WHEN 'Secretary' THEN 3
          ELSE 4
        END,
        p.last_name
    `, [id]);

    res.json({
      success: true,
      data: {
        ...committeeResult.rows[0],
        members: membersResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching committee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch committee details'
    });
  }
}

/**
 * Create new committee
 */
async function createCommittee(req, res) {
  try {
    const {
      name,
      type,
      description,
      purpose,
      chair_id,
      vice_chair_id,
      meeting_frequency,
      typical_meeting_duration,
      email_list,
      formed_date
    } = req.body;

    const result = await pool.query(`
      INSERT INTO committees (
        name, type, description, purpose, chair_id, vice_chair_id,
        meeting_frequency, typical_meeting_duration, email_list, formed_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      name, type, description, purpose, chair_id, vice_chair_id,
      meeting_frequency, typical_meeting_duration, email_list, formed_date
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating committee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create committee'
    });
  }
}

/**
 * Update committee
 */
async function updateCommittee(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(`
      UPDATE committees
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Committee not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating committee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update committee'
    });
  }
}

/**
 * Add member to committee
 */
async function addCommitteeMember(req, res) {
  try {
    const { committeeId } = req.params;
    const {
      member_id,
      role,
      start_date,
      end_date,
      term_length,
      voting_member,
      calendar_link,
      notes
    } = req.body;

    const result = await pool.query(`
      INSERT INTO committee_members (
        committee_id, member_id, role, start_date, end_date,
        term_length, voting_member, calendar_link, notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      committeeId, member_id, role, start_date, end_date,
      term_length, voting_member, calendar_link, notes
    ]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding committee member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add committee member'
    });
  }
}

/**
 * Remove member from committee
 */
async function removeCommitteeMember(req, res) {
  try {
    const { committeeId, memberId } = req.params;

    const result = await pool.query(`
      UPDATE committee_members
      SET is_active = FALSE, end_date = CURRENT_DATE, updated_at = NOW()
      WHERE committee_id = $1 AND member_id = $2
      RETURNING *
    `, [committeeId, memberId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Committee member not found'
      });
    }

    res.json({
      success: true,
      message: 'Member removed from committee',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error removing committee member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove committee member'
    });
  }
}

/**
 * Get committees for a specific member
 */
async function getMemberCommittees(req, res) {
  try {
    const { memberId } = req.params;

    const result = await pool.query(`
      SELECT
        c.*,
        cm.role,
        cm.start_date,
        cm.end_date,
        cm.voting_member
      FROM committees c
      JOIN committee_members cm ON c.id = cm.committee_id
      WHERE cm.member_id = $1 AND cm.is_active = TRUE AND c.is_active = TRUE
      ORDER BY c.type, c.name
    `, [memberId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching member committees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch member committees'
    });
  }
}

module.exports = {
  getAllCommittees,
  getCommitteeById,
  createCommittee,
  updateCommittee,
  addCommitteeMember,
  removeCommitteeMember,
  getMemberCommittees
};
