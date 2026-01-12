const { pool, getClient } = require('../config/database');

/**
 * Get all upcoming meetings (for calendar view)
 */
async function getUpcomingMeetings(req, res) {
  try {
    const { committee_id, start_date, end_date, member_id } = req.query;

    let query = `
      SELECT
        m.*,
        c.name AS committee_name,
        c.type AS committee_type,
        creator.first_name || ' ' || creator.last_name AS created_by_name,
        (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id) AS total_invites,
        (SELECT COUNT(*) FROM meeting_attendees WHERE meeting_id = m.id AND rsvp_status = 'accepted') AS accepted_count
      FROM meetings m
      JOIN committees c ON m.committee_id = c.id
      LEFT JOIN attendee_profiles creator ON m.created_by = creator.id
      WHERE m.status IN ('scheduled', 'in_progress')
    `;

    const params = [];
    let paramCount = 1;

    if (committee_id) {
      query += ` AND m.committee_id = $${paramCount}`;
      params.push(committee_id);
      paramCount++;
    }

    if (start_date) {
      query += ` AND m.scheduled_start >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND m.scheduled_start <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (member_id) {
      query += ` AND EXISTS (
        SELECT 1 FROM meeting_attendees ma
        WHERE ma.meeting_id = m.id AND ma.attendee_id = $${paramCount}
      )`;
      params.push(member_id);
      paramCount++;
    }

    query += ` ORDER BY m.scheduled_start ASC`;

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meetings'
    });
  }
}

/**
 * Get meeting by ID with full details
 */
async function getMeetingById(req, res) {
  try {
    const { id } = req.params;

    // Get meeting details
    const meetingResult = await pool.query(`
      SELECT
        m.*,
        c.name AS committee_name,
        c.type AS committee_type,
        creator.first_name || ' ' || creator.last_name AS created_by_name,
        creator.email AS created_by_email
      FROM meetings m
      JOIN committees c ON m.committee_id = c.id
      LEFT JOIN attendee_profiles creator ON m.created_by = creator.id
      WHERE m.id = $1
    `, [id]);

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Get attendees
    const attendeesResult = await pool.query(`
      SELECT
        ma.*,
        p.first_name,
        p.last_name,
        p.email,
        p.organization_name
      FROM meeting_attendees ma
      JOIN attendee_profiles p ON ma.attendee_id = p.id
      WHERE ma.meeting_id = $1
      ORDER BY
        ma.is_required DESC,
        p.last_name
    `, [id]);

    // Get agenda items
    const agendaResult = await pool.query(`
      SELECT
        ai.*,
        p.first_name || ' ' || p.last_name AS presenter_name
      FROM meeting_agenda_items ai
      LEFT JOIN attendee_profiles p ON ai.presenter_id = p.id
      WHERE ai.meeting_id = $1
      ORDER BY ai.item_order
    `, [id]);

    res.json({
      success: true,
      data: {
        ...meetingResult.rows[0],
        attendees: attendeesResult.rows,
        agenda: agendaResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meeting details'
    });
  }
}

/**
 * Create new meeting
 */
async function createMeeting(req, res) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      committee_id,
      title,
      description,
      meeting_type,
      scheduled_start,
      scheduled_end,
      timezone,
      location,
      is_virtual,
      meeting_url,
      meeting_password,
      dial_in_number,
      quorum_required,
      created_by,
      attendees, // array of attendee objects
      agenda // array of agenda items
    } = req.body;

    // Create meeting
    const meetingResult = await client.query(`
      INSERT INTO meetings (
        committee_id, title, description, meeting_type,
        scheduled_start, scheduled_end, timezone,
        location, is_virtual, meeting_url, meeting_password, dial_in_number,
        quorum_required, created_by, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'scheduled')
      RETURNING *
    `, [
      committee_id, title, description, meeting_type,
      scheduled_start, scheduled_end, timezone,
      location, is_virtual, meeting_url, meeting_password, dial_in_number,
      quorum_required, created_by
    ]);

    const meeting = meetingResult.rows[0];

    // Add attendees
    if (attendees && attendees.length > 0) {
      for (const attendee of attendees) {
        await client.query(`
          INSERT INTO meeting_attendees (
            meeting_id, attendee_id, role, is_required, rsvp_status
          )
          VALUES ($1, $2, $3, $4, 'pending')
        `, [
          meeting.id,
          attendee.attendee_id,
          attendee.role || 'attendee',
          attendee.is_required || false
        ]);
      }
    }

    // Add agenda items
    if (agenda && agenda.length > 0) {
      for (let i = 0; i < agenda.length; i++) {
        const item = agenda[i];
        await client.query(`
          INSERT INTO meeting_agenda_items (
            meeting_id, title, description, item_order,
            duration_minutes, item_type, presenter_id
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          meeting.id,
          item.title,
          item.description,
          item.item_order || i + 1,
          item.duration_minutes,
          item.item_type,
          item.presenter_id
        ]);
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Meeting created successfully',
      data: meeting
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting'
    });
  } finally {
    client.release();
  }
}

/**
 * Update meeting
 */
async function updateMeeting(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
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
      UPDATE meetings
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meeting'
    });
  }
}

/**
 * Cancel meeting
 */
async function cancelMeeting(req, res) {
  try {
    const { id } = req.params;
    const { cancelled_reason } = req.body;

    const result = await pool.query(`
      UPDATE meetings
      SET status = 'cancelled', cancelled_reason = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, cancelled_reason]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    res.json({
      success: true,
      message: 'Meeting cancelled',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error cancelling meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel meeting'
    });
  }
}

/**
 * RSVP to meeting
 */
async function rsvpToMeeting(req, res) {
  try {
    const { id } = req.params;
    const { attendee_id, rsvp_status, rsvp_note } = req.body;

    const result = await pool.query(`
      UPDATE meeting_attendees
      SET
        rsvp_status = $3,
        rsvp_note = $4,
        rsvp_at = NOW(),
        updated_at = NOW()
      WHERE meeting_id = $1 AND attendee_id = $2
      RETURNING *
    `, [id, attendee_id, rsvp_status, rsvp_note]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Meeting attendee not found'
      });
    }

    // Update meeting attendance_count
    await pool.query(`
      UPDATE meetings
      SET attendance_count = (
        SELECT COUNT(*) FROM meeting_attendees
        WHERE meeting_id = $1 AND rsvp_status = 'accepted'
      )
      WHERE id = $1
    `, [id]);

    res.json({
      success: true,
      message: 'RSVP updated',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating RSVP:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update RSVP'
    });
  }
}

/**
 * Add agenda item to meeting
 */
async function addAgendaItem(req, res) {
  try {
    const { meetingId } = req.params;
    const {
      title,
      description,
      item_order,
      duration_minutes,
      item_type,
      presenter_id
    } = req.body;

    const result = await pool.query(`
      INSERT INTO meeting_agenda_items (
        meeting_id, title, description, item_order,
        duration_minutes, item_type, presenter_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [meetingId, title, description, item_order, duration_minutes, item_type, presenter_id]);

    res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding agenda item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add agenda item'
    });
  }
}

module.exports = {
  getUpcomingMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  cancelMeeting,
  rsvpToMeeting,
  addAgendaItem
};
