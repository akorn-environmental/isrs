const { pool, getClient } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const {
  sendRegistrationConfirmation,
  sendPaymentReceipt
} = require('../services/conferenceEmailService');

/**
 * Get active conference details
 */
async function getActiveConference(req, res) {
  try {
    const result = await pool.query(`
      SELECT * FROM conference_editions
      WHERE is_active = TRUE
      ORDER BY year DESC
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No active conference found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching conference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conference details'
    });
  }
}

/**
 * Get conference by year
 */
async function getConferenceByYear(req, res) {
  try {
    const { year } = req.params;

    const result = await pool.query(
      'SELECT * FROM conference_editions WHERE year = $1',
      [year]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conference not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching conference:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conference details'
    });
  }
}

/**
 * Create or update attendee profile
 */
async function createOrUpdateProfile(req, res) {
  try {
    const {
      user_email,
      contact_id,
      first_name,
      last_name,
      organization_id,
      organization_name,
      position,
      department,
      phone,
      country,
      state_province,
      city,
      bio,
      cv_url,
      cv_file_path,
      profile_photo_url,
      website,
      linkedin_url,
      twitter_handle,
      orcid,
      research_areas,
      expertise_keywords,
      preferred_language,
      timezone
    } = req.body;

    // Validate required fields
    if (!user_email || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        error: 'Email, first name, and last name are required'
      });
    }

    // Check if profile exists
    const existingProfile = await pool.query(
      'SELECT id FROM attendee_profiles WHERE user_email = $1',
      [user_email]
    );

    let profileId;

    if (existingProfile.rows.length > 0) {
      // Update existing profile
      profileId = existingProfile.rows[0].id;

      await pool.query(`
        UPDATE attendee_profiles SET
          contact_id = $2,
          first_name = $3,
          last_name = $4,
          organization_id = $5,
          organization_name = $6,
          position = $7,
          department = $8,
          phone = $9,
          country = $10,
          state_province = $11,
          city = $12,
          bio = $13,
          cv_url = $14,
          cv_file_path = $15,
          profile_photo_url = $16,
          website = $17,
          linkedin_url = $18,
          twitter_handle = $19,
          orcid = $20,
          research_areas = $21,
          expertise_keywords = $22,
          preferred_language = $23,
          timezone = $24,
          updated_at = NOW()
        WHERE id = $1
      `, [
        profileId, contact_id, first_name, last_name, organization_id,
        organization_name, position, department, phone, country, state_province, city,
        bio, cv_url, cv_file_path, profile_photo_url, website, linkedin_url,
        twitter_handle, orcid, research_areas, expertise_keywords,
        preferred_language, timezone
      ]);
    } else {
      // Create new profile
      const result = await pool.query(`
        INSERT INTO attendee_profiles (
          user_email, contact_id, first_name, last_name, organization_id,
          organization_name, position, department, phone, country, state_province, city,
          bio, cv_url, cv_file_path, profile_photo_url, website, linkedin_url,
          twitter_handle, orcid, research_areas, expertise_keywords,
          preferred_language, timezone
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING id
      `, [
        user_email, contact_id, first_name, last_name, organization_id,
        organization_name, position, department, phone, country, state_province, city,
        bio, cv_url, cv_file_path, profile_photo_url, website, linkedin_url,
        twitter_handle, orcid, research_areas, expertise_keywords,
        preferred_language, timezone
      ]);

      profileId = result.rows[0].id;
    }

    // Fetch and return the complete profile
    const profile = await pool.query(
      'SELECT * FROM attendee_profiles WHERE id = $1',
      [profileId]
    );

    res.json({
      success: true,
      data: profile.rows[0]
    });
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update profile'
    });
  }
}

/**
 * Create conference registration
 */
async function createRegistration(req, res) {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const {
      conference_id,
      attendee_id,
      registration_type,
      registration_fee,
      currency = 'USD',
      attending_days,
      is_virtual = false,
      is_presenter = false,
      is_first_time = false,
      dietary_restrictions,
      dietary_notes,
      accessibility_needs,
      special_requirements,
      emergency_contact_name,
      emergency_contact_email,
      emergency_contact_phone,
      emergency_contact_relationship,
      emergency_contact_authorization = false,
      interested_in_workshops = false,
      interested_in_field_trips = false,
      interested_in_social_events = true,
      needs_accommodation_help = false,
      willing_to_volunteer = false,
      opt_in_mailing_list = true,
      opt_in_future_conferences = true,
      // Special Events & Activities
      welcome_reception = false,
      low_country_boil = false,
      dolphin_tours = false,
      sea_turtle_center = false,
      restoration_site_tour = false,
      golf_tournament = false,
      // T-Shirt & Guests
      tshirt_size,
      guest_count = 0,
      guest_fee = 0,
      // Continuing Education
      continuing_education = false,
      license_number,
      licensing_org,
      // Room Sharing
      room_sharing = false,
      roommate_notes,
      // Abstract Submission Interest
      interested_in_abstract_submission = false,
      // Discount Code
      discount_code = null
    } = req.body;

    // Validate required fields
    if (!conference_id || !attendee_id || !registration_type || !registration_fee) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Conference ID, attendee ID, registration type, and fee are required'
      });
    }

    // Check if already registered
    const existingReg = await client.query(
      'SELECT id FROM conference_registrations WHERE conference_id = $1 AND attendee_id = $2',
      [conference_id, attendee_id]
    );

    if (existingReg.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: 'Already registered for this conference'
      });
    }

    // Get conference year for registration number
    const conferenceResult = await client.query(
      'SELECT year FROM conference_editions WHERE id = $1',
      [conference_id]
    );

    if (conferenceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        error: 'Conference not found'
      });
    }

    const year = conferenceResult.rows[0].year;

    // Generate registration number
    const countResult = await client.query(
      'SELECT COUNT(*) FROM conference_registrations WHERE conference_id = $1',
      [conference_id]
    );
    const registrationNumber = `ISRS${year}-${String(parseInt(countResult.rows[0].count) + 1).padStart(3, '0')}`;

    // Create registration
    const regResult = await client.query(`
      INSERT INTO conference_registrations (
        conference_id, attendee_id, registration_number, registration_type,
        registration_fee, currency, attending_days, is_virtual, is_presenter,
        is_first_time, dietary_restrictions, dietary_notes, accessibility_needs,
        special_requirements, emergency_contact_name, emergency_contact_email,
        emergency_contact_phone, emergency_contact_relationship,
        emergency_contact_authorization, interested_in_workshops,
        interested_in_field_trips, interested_in_social_events,
        needs_accommodation_help, willing_to_volunteer, opt_in_mailing_list,
        opt_in_future_conferences, payment_status, status,
        welcome_reception, low_country_boil, dolphin_tours, sea_turtle_center,
        restoration_site_tour, golf_tournament, tshirt_size, guest_count,
        guest_fee, continuing_education, license_number, licensing_org,
        room_sharing, roommate_notes, interested_in_abstract_submission,
        discount_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, 'pending', 'pending',
        $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42
      )
      RETURNING *
    `, [
      conference_id, attendee_id, registrationNumber, registration_type,
      registration_fee, currency, attending_days, is_virtual, is_presenter,
      is_first_time, dietary_restrictions, dietary_notes, accessibility_needs,
      special_requirements, emergency_contact_name, emergency_contact_email,
      emergency_contact_phone, emergency_contact_relationship,
      emergency_contact_authorization, interested_in_workshops,
      interested_in_field_trips, interested_in_social_events,
      needs_accommodation_help, willing_to_volunteer, opt_in_mailing_list,
      opt_in_future_conferences,
      welcome_reception, low_country_boil, dolphin_tours, sea_turtle_center,
      restoration_site_tour, golf_tournament, tshirt_size, guest_count,
      guest_fee, continuing_education, license_number, licensing_org,
      room_sharing, roommate_notes, interested_in_abstract_submission,
      discount_code
    ]);

    await client.query('COMMIT');

    // Send registration confirmation email (async, don't wait for it)
    const registration = regResult.rows[0];
    sendRegistrationConfirmation({
      registration_id: registration.id,
      attendee_id: registration.attendee_id,
      conference_id: registration.conference_id,
      registration_type: registration.registration_type,
      registration_fee: registration.registration_fee,
      payment_status: registration.payment_status,
      payment_method: registration.payment_method || 'zeffy',
      discount_code: registration.discount_code
    }).catch(err => {
      console.error('Failed to send registration confirmation email:', err);
      // Don't fail the request if email fails
    });

    res.json({
      success: true,
      data: registration
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create registration'
    });
  } finally {
    client.release();
  }
}

/**
 * Create Zeffy payment checkout
 */
async function createPaymentCheckout(req, res) {
  try {
    const { registration_id, amount, currency = 'USD' } = req.body;

    if (!registration_id || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID and amount are required'
      });
    }

    // Get registration details
    const regResult = await pool.query(`
      SELECT cr.*, ap.first_name, ap.last_name, ap.user_email
      FROM conference_registrations cr
      JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      WHERE cr.id = $1
    `, [registration_id]);

    if (regResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    const registration = regResult.rows[0];

    // Get conference details to use the correct Zeffy URL
    const conferenceResult = await pool.query(
      'SELECT website FROM conference_editions WHERE id = $1',
      [registration.conference_id]
    );

    const zeffyCheckoutUrl = conferenceResult.rows[0]?.website ||
      'https://www.zeffy.com/en-US/ticketing/icsr2026-international-conference-on-shellfish-restoration';

    // Create payment transaction record
    await pool.query(`
      INSERT INTO payment_transactions (
        registration_id, transaction_type, amount, currency,
        payment_method, payment_provider, status, checkout_url
      ) VALUES ($1, 'payment', $2, $3, 'zeffy', 'zeffy', 'pending', $4)
    `, [registration_id, amount, currency, zeffyCheckoutUrl]);

    // Update registration with checkout URL
    await pool.query(`
      UPDATE conference_registrations
      SET zeffy_checkout_url = $1, updated_at = NOW()
      WHERE id = $2
    `, [zeffyCheckoutUrl, registration_id]);

    res.json({
      success: true,
      data: {
        checkout_url: zeffyCheckoutUrl,
        registration_number: registration.registration_number,
        amount,
        currency
      }
    });
  } catch (error) {
    console.error('Error creating payment checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment checkout'
    });
  }
}

/**
 * Confirm payment completion
 */
async function confirmPayment(req, res) {
  try {
    const { registration_id, external_transaction_id, payment_method = 'zeffy' } = req.body;

    if (!registration_id) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID is required'
      });
    }

    // Update registration payment status
    await pool.query(`
      UPDATE conference_registrations
      SET
        payment_status = 'paid',
        payment_method = $2,
        payment_reference = $3,
        payment_date = NOW(),
        status = 'confirmed',
        updated_at = NOW()
      WHERE id = $1
    `, [registration_id, payment_method, external_transaction_id]);

    // Update payment transaction
    const transactionResult = await pool.query(`
      UPDATE payment_transactions
      SET
        status = 'completed',
        external_transaction_id = $2,
        completed_date = NOW()
      WHERE registration_id = $1 AND status = 'pending'
      RETURNING *
    `, [registration_id, external_transaction_id]);

    // Send payment receipt email (async, don't wait for it)
    if (transactionResult.rows.length > 0) {
      const transaction = transactionResult.rows[0];
      sendPaymentReceipt({
        registration_id: registration_id,
        transaction_id: transaction.external_transaction_id || transaction.id,
        payment_date: transaction.completed_date || new Date(),
        amount_paid: transaction.amount,
        payment_method: payment_method
      }).catch(err => {
        console.error('Failed to send payment receipt email:', err);
        // Don't fail the request if email fails
      });
    }

    res.json({
      success: true,
      message: 'Payment confirmed successfully'
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to confirm payment'
    });
  }
}

/**
 * Get attendee profile by email
 */
async function getProfileByEmail(req, res) {
  try {
    const { email } = req.params;

    const result = await pool.query(
      'SELECT * FROM attendee_profiles WHERE user_email = $1',
      [email]
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
}

/**
 * Get registration details
 */
async function getRegistration(req, res) {
  try {
    const { registration_id } = req.params;

    const result = await pool.query(`
      SELECT
        cr.*,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        ap.organization_name,
        ce.name as conference_name,
        ce.year as conference_year,
        ce.start_date,
        ce.end_date
      FROM conference_registrations cr
      JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      JOIN conference_editions ce ON cr.conference_id = ce.id
      WHERE cr.id = $1
    `, [registration_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registration'
    });
  }
}

/**
 * Send conference invitations to email addresses
 */
async function sendInvites(req, res) {
  try {
    const { emails, message, conference_url } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least one email address'
      });
    }

    if (emails.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 50 email addresses allowed per request'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    if (invalidEmails.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid email addresses: ${invalidEmails.join(', ')}`
      });
    }

    // In a real implementation, this would send actual emails
    // For now, we'll log them and return success
    console.log('Conference invites to send:', {
      recipients: emails,
      message: message,
      url: conference_url,
      timestamp: new Date().toISOString()
    });

    // TODO: Implement actual email sending via SendGrid, AWS SES, or similar
    // Example implementation would look like:
    // const results = await Promise.all(
    //   emails.map(email => sendEmail({
    //     to: email,
    //     subject: 'You\'re Invited: ISRS International Conference 2026',
    //     body: message,
    //     from: 'conference@shellfish-restoration.org'
    //   }))
    // );

    res.json({
      success: true,
      message: `Invitations sent to ${emails.length} recipient(s)`,
      recipients: emails.length
    });

  } catch (error) {
    console.error('Error sending conference invites:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send invitations. Please try again.'
    });
  }
}

/**
 * Validate discount code
 * POST /api/conference/discount-code/validate
 */
async function validateDiscountCode(req, res) {
  try {
    const { code, conferenceId, registrationType, attendeeCount = 1, userEmail } = req.body;

    if (!code || !conferenceId) {
      return res.status(400).json({
        success: false,
        error: 'Code and conference ID are required'
      });
    }

    // Get discount code details
    const codeResult = await pool.query(`
      SELECT * FROM discount_codes
      WHERE UPPER(code) = UPPER($1)
      AND (conference_id = $2 OR conference_id IS NULL)
      AND is_active = TRUE
    `, [code, conferenceId]);

    if (codeResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or inactive discount code'
      });
    }

    const discountCode = codeResult.rows[0];

    // Check validity period
    const now = new Date();
    if (discountCode.valid_from && new Date(discountCode.valid_from) > now) {
      return res.status(400).json({
        success: false,
        error: 'This discount code is not yet valid'
      });
    }

    if (discountCode.valid_until && new Date(discountCode.valid_until) < now) {
      return res.status(400).json({
        success: false,
        error: 'This discount code has expired'
      });
    }

    // Check usage limits
    if (discountCode.max_uses && discountCode.uses_count >= discountCode.max_uses) {
      return res.status(400).json({
        success: false,
        error: 'This discount code has reached its usage limit'
      });
    }

    // Check per-user usage limit
    if (userEmail && discountCode.max_uses_per_user) {
      const userUsageResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM discount_code_usage
        WHERE discount_code_id = $1
        AND user_email = $2
      `, [discountCode.id, userEmail]);

      if (parseInt(userUsageResult.rows[0].count) >= discountCode.max_uses_per_user) {
        return res.status(400).json({
          success: false,
          error: 'You have already used this discount code'
        });
      }
    }

    // Check registration type applicability
    if (discountCode.applies_to_registration_types &&
        discountCode.applies_to_registration_types.length > 0 &&
        registrationType &&
        !discountCode.applies_to_registration_types.includes(registrationType)) {
      return res.status(400).json({
        success: false,
        error: `This discount code is not applicable to ${registrationType} registrations`
      });
    }

    // Check minimum attendees (for group discounts)
    if (discountCode.minimum_attendees && attendeeCount < discountCode.minimum_attendees) {
      return res.status(400).json({
        success: false,
        error: `This discount code requires a minimum of ${discountCode.minimum_attendees} attendees`
      });
    }

    // Code is valid!
    res.json({
      success: true,
      data: {
        code: discountCode.code,
        description: discountCode.description,
        discountType: discountCode.discount_type,
        discountValue: discountCode.discount_value,
        usesRemaining: discountCode.max_uses ? discountCode.max_uses - discountCode.uses_count : null
      }
    });

  } catch (error) {
    console.error('Error validating discount code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate discount code'
    });
  }
}

/**
 * Apply discount code to registration
 * (Called internally during registration process)
 */
async function applyDiscountCode(codeId, registrationId, originalAmount, userEmail) {
  try {
    // Get discount code details
    const codeResult = await pool.query(
      'SELECT * FROM discount_codes WHERE id = $1',
      [codeId]
    );

    if (codeResult.rows.length === 0) {
      throw new Error('Discount code not found');
    }

    const discountCode = codeResult.rows[0];

    // Calculate discount amount
    let discountAmount = 0;
    if (discountCode.discount_type === 'percentage') {
      discountAmount = (originalAmount * discountCode.discount_value) / 100;
    } else if (discountCode.discount_type === 'fixed_amount') {
      discountAmount = Math.min(discountCode.discount_value, originalAmount);
    }

    const finalAmount = originalAmount - discountAmount;

    // Record usage
    await pool.query(`
      INSERT INTO discount_code_usage (
        discount_code_id, registration_id, discount_amount, original_amount, final_amount, user_email
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `, [codeId, registrationId, discountAmount, originalAmount, finalAmount, userEmail]);

    // Increment usage count
    await pool.query(
      'UPDATE discount_codes SET uses_count = uses_count + 1, updated_at = NOW() WHERE id = $1',
      [codeId]
    );

    return { discountAmount, finalAmount };

  } catch (error) {
    console.error('Error applying discount code:', error);
    throw error;
  }
}

/**
 * Get available sessions for a conference
 * GET /api/conference/:conferenceId/sessions
 */
async function getConferenceSessions(req, res) {
  try {
    const { conferenceId } = req.params;
    const { sessionType, date, requiresRegistration } = req.query;

    let query = `
      SELECT
        cs.*,
        ap_chair.first_name || ' ' || ap_chair.last_name as chair_name,
        ap_cochair.first_name || ' ' || ap_cochair.last_name as co_chair_name
      FROM conference_sessions cs
      LEFT JOIN attendee_profiles ap_chair ON cs.chair_id = ap_chair.id
      LEFT JOIN attendee_profiles ap_cochair ON cs.co_chair_id = ap_cochair.id
      WHERE cs.conference_id = $1
    `;

    const params = [conferenceId];
    let paramCount = 2;

    if (sessionType) {
      query += ` AND cs.session_type = $${paramCount}`;
      params.push(sessionType);
      paramCount++;
    }

    if (date) {
      query += ` AND cs.session_date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    if (requiresRegistration !== undefined) {
      query += ` AND cs.requires_registration = $${paramCount}`;
      params.push(requiresRegistration === 'true');
      paramCount++;
    }

    query += ` ORDER BY cs.session_date, cs.start_time`;

    const result = await pool.query(query, params);

    // Add availability info
    const sessions = result.rows.map(session => ({
      ...session,
      availableSpots: session.max_capacity ?
        Math.max(0, session.max_capacity - (session.current_registrations || 0)) :
        null,
      isFull: session.max_capacity ?
        (session.current_registrations || 0) >= session.max_capacity :
        false
    }));

    res.json({
      success: true,
      data: sessions
    });

  } catch (error) {
    console.error('Error fetching conference sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conference sessions'
    });
  }
}

/**
 * Register for sessions
 * POST /api/conference/sessions/register
 */
async function registerForSessions(req, res) {
  try {
    const { registrationId, sessionIds } = req.body;

    if (!registrationId || !sessionIds || !Array.isArray(sessionIds)) {
      return res.status(400).json({
        success: false,
        error: 'Registration ID and session IDs array are required'
      });
    }

    // Verify registration exists
    const regResult = await pool.query(
      'SELECT * FROM conference_registrations WHERE id = $1',
      [registrationId]
    );

    if (regResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }

    const registration = regResult.rows[0];

    // Register for each session
    const results = [];
    for (let i = 0; i < sessionIds.length; i++) {
      const sessionId = sessionIds[i];

      // Check if session exists and has capacity
      const sessionResult = await pool.query(
        'SELECT * FROM conference_sessions WHERE id = $1',
        [sessionId]
      );

      if (sessionResult.rows.length === 0) {
        results.push({ sessionId, success: false, error: 'Session not found' });
        continue;
      }

      const session = sessionResult.rows[0];

      // Check capacity
      if (session.max_capacity && session.current_registrations >= session.max_capacity) {
        if (session.enable_waitlist) {
          // Add to waitlist
          try {
            await pool.query(`
              INSERT INTO session_attendance (session_id, attendee_id, waitlisted)
              VALUES ($1, $2, TRUE)
              ON CONFLICT (session_id, attendee_id) DO NOTHING
            `, [sessionId, registration.attendee_id]);

            results.push({ sessionId, success: true, waitlisted: true });
          } catch (error) {
            results.push({ sessionId, success: false, error: 'Failed to add to waitlist' });
          }
        } else {
          results.push({ sessionId, success: false, error: 'Session is full' });
        }
      } else {
        // Register for session
        try {
          await pool.query(`
            INSERT INTO session_attendance (session_id, attendee_id, selection_priority)
            VALUES ($1, $2, $3)
            ON CONFLICT (session_id, attendee_id) DO UPDATE
            SET selection_priority = $3, waitlisted = FALSE
          `, [sessionId, registration.attendee_id, i + 1]);

          results.push({ sessionId, success: true, waitlisted: false });
        } catch (error) {
          results.push({ sessionId, success: false, error: 'Registration failed' });
        }
      }
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error registering for sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register for sessions'
    });
  }
}

module.exports = {
  getActiveConference,
  getConferenceByYear,
  createOrUpdateProfile,
  createRegistration,
  createPaymentCheckout,
  confirmPayment,
  getProfileByEmail,
  getRegistration,
  sendInvites,
  // New endpoints
  validateDiscountCode,
  getConferenceSessions,
  registerForSessions
};
