const { query } = require('../config/database');

/**
 * Create new member
 * POST /api/membership/join
 */
async function createMember(req, res) {
  try {
    const {
      email,
      first_name,
      last_name,
      organization_name,
      position,
      country,
      state_province,
      city,
      phone,
      membership_type,
      research_areas,
      bio,
      website_url,
      linkedin_url,
      opt_in_emails,
      opt_in_newsletter,
      donation_amount,
      donation_type,
      in_honor_of,
      dedication_message
    } = req.body;

    // Validate required fields
    if (!email || !first_name || !last_name || !country || !membership_type) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Check if email already exists
    const existing = await query(
      'SELECT id FROM members WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered as a member'
      });
    }

    // Calculate membership expiry date
    let expiry_date = null;
    if (membership_type !== 'lifetime') {
      const start_date = new Date();
      expiry_date = new Date(start_date);
      expiry_date.setFullYear(expiry_date.getFullYear() + 1); // 1 year from now
    }

    // Insert member
    const memberResult = await query(`
      INSERT INTO members (
        email, first_name, last_name, organization_name, position,
        country, state_province, city, phone, membership_type,
        membership_status, membership_start_date, membership_expiry_date,
        research_areas, bio, website_url, linkedin_url,
        opt_in_emails, opt_in_newsletter
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), $12, $13, $14, $15, $16, $17, $18)
      RETURNING *
    `, [
      email, first_name, last_name, organization_name, position,
      country, state_province, city, phone, membership_type,
      'active', expiry_date, research_areas, bio, website_url, linkedin_url,
      opt_in_emails, opt_in_newsletter
    ]);

    const member = memberResult.rows[0];

    // If donation was made, create donation record
    if (donation_amount && parseFloat(donation_amount) > 0) {
      await query(`
        INSERT INTO membership_donations (
          member_id, amount, donation_type, payment_status,
          in_honor_of, dedication_message
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        member.id,
        parseFloat(donation_amount),
        donation_type || 'one_time',
        'pending',
        in_honor_of,
        dedication_message
      ]);
    }

    res.json({
      success: true,
      data: {
        member_id: member.id,
        email: member.email,
        membership_type: member.membership_type,
        expiry_date: member.membership_expiry_date
      },
      message: 'Membership created successfully'
    });

  } catch (error) {
    console.error('Error creating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create membership'
    });
  }
}

/**
 * Get member by email
 * GET /api/membership/lookup?email=xxx
 */
async function getMemberByEmail(req, res) {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email required'
      });
    }

    const result = await query(
      'SELECT * FROM members WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        found: false
      });
    }

    const member = result.rows[0];

    res.json({
      success: true,
      found: true,
      data: {
        id: member.id,
        email: member.email,
        first_name: member.first_name,
        last_name: member.last_name,
        organization_name: member.organization_name,
        position: member.position,
        country: member.country,
        state_province: member.state_province,
        city: member.city,
        phone: member.phone,
        research_areas: member.research_areas,
        bio: member.bio,
        membership_type: member.membership_type,
        membership_status: member.membership_status,
        expiry_date: member.membership_expiry_date
      }
    });

  } catch (error) {
    console.error('Error looking up member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to lookup member'
    });
  }
}

/**
 * Get member dashboard data
 * GET /api/membership/dashboard/:member_id
 */
async function getMemberDashboard(req, res) {
  try {
    const { member_id } = req.params;

    // Get member info
    const memberResult = await query(
      'SELECT * FROM members WHERE id = $1',
      [member_id]
    );

    if (memberResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    const member = memberResult.rows[0];

    // Get donation history
    const donationsResult = await query(
      'SELECT * FROM membership_donations WHERE member_id = $1 ORDER BY created_at DESC',
      [member_id]
    );

    // Get transaction history
    const transactionsResult = await query(
      'SELECT * FROM membership_transactions WHERE member_id = $1 ORDER BY created_at DESC',
      [member_id]
    );

    res.json({
      success: true,
      data: {
        member,
        donations: donationsResult.rows,
        transactions: transactionsResult.rows
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
}

/**
 * Update member profile
 * PUT /api/membership/profile/:member_id
 */
async function updateMemberProfile(req, res) {
  try {
    const { member_id } = req.params;
    const updates = req.body;

    // Build dynamic UPDATE query
    const allowedFields = [
      'first_name', 'last_name', 'organization_name', 'position',
      'country', 'state_province', 'city', 'phone',
      'research_areas', 'bio', 'website_url', 'linkedin_url',
      'opt_in_emails', 'opt_in_newsletter'
    ];

    const setClause = [];
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (setClause.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    values.push(member_id);
    setClause.push('updated_at = NOW()');

    const result = await query(`
      UPDATE members
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Member not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
}

/**
 * Record a donation
 * POST /api/membership/donate
 */
async function recordDonation(req, res) {
  try {
    const {
      member_id,
      amount,
      donation_type,
      zeffy_transaction_id,
      in_honor_of,
      dedication_message
    } = req.body;

    if (!member_id || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Member ID and amount required'
      });
    }

    const result = await query(`
      INSERT INTO membership_donations (
        member_id, amount, donation_type, payment_status,
        zeffy_transaction_id, payment_date,
        in_honor_of, dedication_message
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      RETURNING *
    `, [
      member_id,
      parseFloat(amount),
      donation_type || 'one_time',
      'completed',
      zeffy_transaction_id,
      in_honor_of,
      dedication_message
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Donation recorded successfully'
    });

  } catch (error) {
    console.error('Error recording donation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record donation'
    });
  }
}

module.exports = {
  createMember,
  getMemberByEmail,
  getMemberDashboard,
  updateMemberProfile,
  recordDonation
};
