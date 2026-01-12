/**
 * Conference Email Service
 * Handles sending emails for conference registration system
 */

const { sendEmail } = require('./emailService');
const { query } = require('../config/database');
const { registrationConfirmationTemplate } = require('./templates/registrationConfirmation');
const { paymentReceiptTemplate } = require('./templates/paymentReceipt');
const { conferenceReminderTemplate } = require('./templates/conferenceReminder');

/**
 * Send registration confirmation email
 */
async function sendRegistrationConfirmation(registrationData) {
  try {
    const {
      registration_id,
      attendee_id,
      conference_id,
      registration_type,
      registration_fee,
      payment_status,
      payment_method,
      discount_code
    } = registrationData;

    // Get attendee details
    const attendeeResult = await query(
      'SELECT first_name, last_name, user_email FROM attendee_profiles WHERE id = $1',
      [attendee_id]
    );

    if (attendeeResult.rows.length === 0) {
      throw new Error('Attendee not found');
    }

    const attendee = attendeeResult.rows[0];

    // Get conference details
    const conferenceResult = await query(
      'SELECT conference_name, conference_year, start_date, end_date FROM conference_editions WHERE id = $1',
      [conference_id]
    );

    if (conferenceResult.rows.length === 0) {
      throw new Error('Conference not found');
    }

    const conference = conferenceResult.rows[0];

    // Format conference date
    const startDate = new Date(conference.start_date);
    const endDate = new Date(conference.end_date);
    const conferenceDate = `${startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    })}-${endDate.toLocaleDateString('en-US', {
      day: 'numeric',
      year: 'numeric'
    })}`;

    // Get selected sessions
    const sessionsResult = await query(`
      SELECT cs.session_name, cs.session_date, cs.start_time, cs.room
      FROM session_attendance sa
      JOIN conference_sessions cs ON sa.session_id = cs.id
      WHERE sa.attendee_id = $1 AND sa.waitlisted = FALSE
      ORDER BY cs.session_date, cs.start_time
    `, [attendee_id]);

    const selectedSessions = sessionsResult.rows.map(s => ({
      name: s.session_name,
      date: new Date(s.session_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: s.start_time,
      room: s.room
    }));

    // Get discount information if applicable
    let discountAmount = 0;
    if (discount_code) {
      const discountResult = await query(
        'SELECT discount_type, discount_value FROM discount_codes WHERE UPPER(code) = UPPER($1)',
        [discount_code]
      );

      if (discountResult.rows.length > 0) {
        const discount = discountResult.rows[0];
        if (discount.discount_type === 'percentage') {
          discountAmount = (registration_fee * discount.discount_value) / 100;
        } else {
          discountAmount = Math.min(discount.discount_value, registration_fee);
        }
      }
    }

    // Generate email from template
    const emailContent = registrationConfirmationTemplate({
      firstName: attendee.first_name,
      lastName: attendee.last_name,
      email: attendee.user_email,
      registrationId: registration_id,
      registrationType: formatRegistrationType(registration_type),
      conferenceName: conference.conference_name,
      conferenceDate: conferenceDate,
      registrationFee: parseFloat(registration_fee),
      paymentStatus: payment_status,
      paymentMethod: payment_method,
      selectedSessions: selectedSessions,
      discountCode: discount_code,
      discountAmount: discountAmount
    });

    // Send email
    const result = await sendEmail({
      to: attendee.user_email,
      subject: emailContent.subject,
      body: emailContent.html
    });

    // Log email in database
    await query(`
      INSERT INTO registration_emails (
        registration_id,
        email_type,
        recipient_email,
        subject,
        sent_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [registration_id, 'registration_confirmation', attendee.user_email, emailContent.subject]);

    console.log(`✅ Registration confirmation sent to ${attendee.user_email}`);
    return result;

  } catch (error) {
    console.error('Error sending registration confirmation:', error);
    throw error;
  }
}

/**
 * Send payment receipt email
 */
async function sendPaymentReceipt(paymentData) {
  try {
    const {
      registration_id,
      transaction_id,
      payment_date,
      amount_paid,
      payment_method
    } = paymentData;

    // Get registration and attendee details
    const registrationResult = await query(`
      SELECT
        cr.attendee_id,
        cr.conference_id,
        cr.registration_type,
        cr.registration_fee,
        cr.discount_code,
        ap.first_name,
        ap.last_name,
        ap.user_email
      FROM conference_registrations cr
      JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      WHERE cr.id = $1
    `, [registration_id]);

    if (registrationResult.rows.length === 0) {
      throw new Error('Registration not found');
    }

    const registration = registrationResult.rows[0];

    // Get conference details
    const conferenceResult = await query(
      'SELECT conference_name FROM conference_editions WHERE id = $1',
      [registration.conference_id]
    );

    const conference = conferenceResult.rows[0];

    // Calculate discount amount
    let discountAmount = 0;
    if (registration.discount_code) {
      const discountResult = await query(
        'SELECT discount_type, discount_value FROM discount_codes WHERE UPPER(code) = UPPER($1)',
        [registration.discount_code]
      );

      if (discountResult.rows.length > 0) {
        const discount = discountResult.rows[0];
        if (discount.discount_type === 'percentage') {
          discountAmount = (parseFloat(registration.registration_fee) * discount.discount_value) / 100;
        } else {
          discountAmount = Math.min(discount.discount_value, parseFloat(registration.registration_fee));
        }
      }
    }

    // Generate email from template
    const emailContent = paymentReceiptTemplate({
      firstName: registration.first_name,
      lastName: registration.last_name,
      email: registration.user_email,
      registrationId: registration_id,
      transactionId: transaction_id,
      paymentDate: new Date(payment_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      paymentMethod: payment_method,
      registrationType: formatRegistrationType(registration.registration_type),
      conferenceName: conference.conference_name,
      registrationFee: parseFloat(registration.registration_fee),
      discountAmount: discountAmount,
      totalAmount: parseFloat(amount_paid)
    });

    // Send email
    const result = await sendEmail({
      to: registration.user_email,
      subject: emailContent.subject,
      body: emailContent.html
    });

    // Log email in database
    await query(`
      INSERT INTO registration_emails (
        registration_id,
        email_type,
        recipient_email,
        subject,
        sent_at
      ) VALUES ($1, $2, $3, $4, NOW())
    `, [registration_id, 'payment_receipt', registration.user_email, emailContent.subject]);

    console.log(`✅ Payment receipt sent to ${registration.user_email}`);
    return result;

  } catch (error) {
    console.error('Error sending payment receipt:', error);
    throw error;
  }
}

/**
 * Send conference reminder emails
 */
async function sendConferenceReminder(conferenceId, daysBeforeConference = 14) {
  try {
    // Get conference details
    const conferenceResult = await query(
      'SELECT * FROM conference_editions WHERE id = $1',
      [conferenceId]
    );

    if (conferenceResult.rows.length === 0) {
      throw new Error('Conference not found');
    }

    const conference = conferenceResult.rows[0];

    // Format conference date
    const startDate = new Date(conference.start_date);
    const endDate = new Date(conference.end_date);
    const conferenceDate = `${startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    })}-${endDate.toLocaleDateString('en-US', {
      day: 'numeric',
      year: 'numeric'
    })}`;

    // Get all confirmed registrations
    const registrationsResult = await query(`
      SELECT
        cr.id as registration_id,
        cr.attendee_id,
        ap.first_name,
        ap.last_name,
        ap.user_email
      FROM conference_registrations cr
      JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      WHERE cr.conference_id = $1
        AND cr.status = 'confirmed'
        AND cr.payment_status = 'confirmed'
    `, [conferenceId]);

    console.log(`Sending reminders to ${registrationsResult.rows.length} attendees...`);

    const results = { sent: 0, failed: 0, errors: [] };

    for (const registration of registrationsResult.rows) {
      try {
        // Get selected sessions for this attendee
        const sessionsResult = await query(`
          SELECT cs.session_name, cs.session_date, cs.start_time, cs.room
          FROM session_attendance sa
          JOIN conference_sessions cs ON sa.session_id = cs.id
          WHERE sa.attendee_id = $1 AND sa.waitlisted = FALSE
          ORDER BY cs.session_date, cs.start_time
        `, [registration.attendee_id]);

        const selectedSessions = sessionsResult.rows.map(s => ({
          name: s.session_name,
          date: new Date(s.session_date).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          time: s.start_time,
          room: s.room
        }));

        // Generate email from template
        const emailContent = conferenceReminderTemplate({
          firstName: registration.first_name,
          lastName: registration.last_name,
          registrationId: registration.registration_id,
          conferenceName: conference.conference_name,
          conferenceDate: conferenceDate,
          conferenceLocation: `${conference.venue_name}, ${conference.city}, ${conference.state}`,
          selectedSessions: selectedSessions,
          scheduleUrl: `https://isrs.org/conference/schedule`,
          mapUrl: `https://isrs.org/conference/venue-map`
        });

        // Send email
        await sendEmail({
          to: registration.user_email,
          subject: emailContent.subject,
          body: emailContent.html
        });

        // Log email in database
        await query(`
          INSERT INTO registration_emails (
            registration_id,
            email_type,
            recipient_email,
            subject,
            sent_at
          ) VALUES ($1, $2, $3, $4, NOW())
        `, [registration.registration_id, 'conference_reminder', registration.user_email, emailContent.subject]);

        results.sent++;
        console.log(`✅ Reminder sent to ${registration.user_email}`);

      } catch (error) {
        results.failed++;
        results.errors.push({
          email: registration.user_email,
          error: error.message
        });
        console.error(`❌ Failed to send reminder to ${registration.user_email}:`, error);
      }

      // Rate limiting - wait 100ms between emails
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`\n✅ Reminder emails complete: ${results.sent} sent, ${results.failed} failed`);
    return results;

  } catch (error) {
    console.error('Error sending conference reminders:', error);
    throw error;
  }
}

/**
 * Helper function to format registration type
 */
function formatRegistrationType(type) {
  const typeMap = {
    'early_bird': 'Early Bird Registration',
    'student': 'Student Registration',
    'regular': 'Regular Registration',
    'late': 'Late Registration',
    'group': 'Group Registration'
  };
  return typeMap[type] || type;
}

module.exports = {
  sendRegistrationConfirmation,
  sendPaymentReceipt,
  sendConferenceReminder
};
