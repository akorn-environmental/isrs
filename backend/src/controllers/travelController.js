const pool = require('../config/database');
const { v4: uuidv4 } = require('uuid');

/**
 * Create or update travel arrangements
 */
async function saveTravelArrangements(req, res) {
  try {
    const {
      registration_id,
      arrival_date,
      arrival_time,
      arrival_flight,
      arrival_airport,
      arrival_notes,
      departure_date,
      departure_time,
      departure_flight,
      departure_airport,
      departure_notes,
      needs_accommodation,
      hotel_name,
      hotel_address,
      hotel_check_in,
      hotel_check_out,
      hotel_confirmation,
      hotel_phone,
      room_type,
      roommate_preferences,
      needs_shuttle,
      needs_airport_pickup,
      needs_airport_dropoff,
      has_rental_car,
      special_requests,
      accessibility_transport_needs
    } = req.body;

    if (!registration_id) {
      return res.status(400).json({
        success: false,
        error: 'registration_id is required'
      });
    }

    // Check if travel arrangements already exist
    const checkQuery = 'SELECT id FROM travel_arrangements WHERE registration_id = $1';
    const checkResult = await pool.query(checkQuery, [registration_id]);

    let query, values, result;

    if (checkResult.rows.length > 0) {
      // Update existing
      query = `
        UPDATE travel_arrangements SET
          arrival_date = $1,
          arrival_time = $2,
          arrival_flight = $3,
          arrival_airport = $4,
          arrival_notes = $5,
          departure_date = $6,
          departure_time = $7,
          departure_flight = $8,
          departure_airport = $9,
          departure_notes = $10,
          needs_accommodation = $11,
          hotel_name = $12,
          hotel_address = $13,
          hotel_check_in = $14,
          hotel_check_out = $15,
          hotel_confirmation = $16,
          hotel_phone = $17,
          room_type = $18,
          roommate_preferences = $19,
          needs_shuttle = $20,
          needs_airport_pickup = $21,
          needs_airport_dropoff = $22,
          has_rental_car = $23,
          special_requests = $24,
          accessibility_transport_needs = $25,
          updated_at = NOW()
        WHERE registration_id = $26
        RETURNING *
      `;

      values = [
        arrival_date, arrival_time, arrival_flight, arrival_airport, arrival_notes,
        departure_date, departure_time, departure_flight, departure_airport, departure_notes,
        needs_accommodation, hotel_name, hotel_address, hotel_check_in, hotel_check_out,
        hotel_confirmation, hotel_phone, room_type, roommate_preferences,
        needs_shuttle, needs_airport_pickup, needs_airport_dropoff, has_rental_car,
        special_requests, accessibility_transport_needs, registration_id
      ];
    } else {
      // Create new
      query = `
        INSERT INTO travel_arrangements (
          id, registration_id, arrival_date, arrival_time, arrival_flight, arrival_airport, arrival_notes,
          departure_date, departure_time, departure_flight, departure_airport, departure_notes,
          needs_accommodation, hotel_name, hotel_address, hotel_check_in, hotel_check_out,
          hotel_confirmation, hotel_phone, room_type, roommate_preferences,
          needs_shuttle, needs_airport_pickup, needs_airport_dropoff, has_rental_car,
          special_requests, accessibility_transport_needs
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
        )
        RETURNING *
      `;

      values = [
        uuidv4(), registration_id, arrival_date, arrival_time, arrival_flight, arrival_airport, arrival_notes,
        departure_date, departure_time, departure_flight, departure_airport, departure_notes,
        needs_accommodation, hotel_name, hotel_address, hotel_check_in, hotel_check_out,
        hotel_confirmation, hotel_phone, room_type, roommate_preferences,
        needs_shuttle, needs_airport_pickup, needs_airport_dropoff, has_rental_car,
        special_requests, accessibility_transport_needs
      ];
    }

    result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Travel arrangements saved successfully'
    });
  } catch (error) {
    console.error('Error saving travel arrangements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save travel arrangements'
    });
  }
}

/**
 * Get travel arrangements for a registration
 */
async function getTravelArrangements(req, res) {
  try {
    const { registration_id } = req.params;

    const query = `
      SELECT ta.*, cr.attendee_id, ap.first_name, ap.last_name, ap.user_email
      FROM travel_arrangements ta
      LEFT JOIN conference_registrations cr ON ta.registration_id = cr.id
      LEFT JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      WHERE ta.registration_id = $1
    `;

    const result = await pool.query(query, [registration_id]);

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: 'No travel arrangements found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching travel arrangements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel arrangements'
    });
  }
}

/**
 * Find potential travel buddies based on similar arrival/departure
 */
async function findTravelBuddies(req, res) {
  try {
    const { registration_id } = req.params;
    const { date_range_days = 1 } = req.query;

    // Get user's travel info
    const userQuery = 'SELECT * FROM travel_arrangements WHERE registration_id = $1';
    const userResult = await pool.query(userQuery, [registration_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No travel arrangements found for this registration'
      });
    }

    const userTravel = userResult.rows[0];

    // Find similar travelers
    const query = `
      SELECT
        ta.*,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        ap.organization_name,
        ap.city,
        ap.country,
        CASE
          WHEN ta.arrival_date IS NOT NULL AND $2 IS NOT NULL
          THEN ABS(EXTRACT(DAY FROM (ta.arrival_date - $2::date)))
          ELSE NULL
        END as arrival_day_diff,
        CASE
          WHEN ta.departure_date IS NOT NULL AND $3 IS NOT NULL
          THEN ABS(EXTRACT(DAY FROM (ta.departure_date - $3::date)))
          ELSE NULL
        END as departure_day_diff
      FROM travel_arrangements ta
      LEFT JOIN conference_registrations cr ON ta.registration_id = cr.id
      LEFT JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      WHERE ta.registration_id != $1
        AND (
          ($2 IS NOT NULL AND ta.arrival_date IS NOT NULL AND ABS(EXTRACT(DAY FROM (ta.arrival_date - $2::date))) <= $4)
          OR
          ($3 IS NOT NULL AND ta.departure_date IS NOT NULL AND ABS(EXTRACT(DAY FROM (ta.departure_date - $3::date))) <= $4)
          OR
          ($5 IS NOT NULL AND ta.arrival_airport = $5)
          OR
          ($6 IS NOT NULL AND ta.departure_airport = $6)
        )
      ORDER BY
        LEAST(
          COALESCE(ABS(EXTRACT(DAY FROM (ta.arrival_date - $2::date))), 999),
          COALESCE(ABS(EXTRACT(DAY FROM (ta.departure_date - $3::date))), 999)
        ) ASC
      LIMIT 20
    `;

    const values = [
      registration_id,
      userTravel.arrival_date,
      userTravel.departure_date,
      date_range_days,
      userTravel.arrival_airport,
      userTravel.departure_airport
    ];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error finding travel buddies:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find travel buddies'
    });
  }
}

/**
 * Find potential roommates based on hotel dates
 */
async function findRoommates(req, res) {
  try {
    const { registration_id } = req.params;

    // Get user's hotel info
    const userQuery = 'SELECT * FROM travel_arrangements WHERE registration_id = $1';
    const userResult = await pool.query(userQuery, [registration_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No travel arrangements found for this registration'
      });
    }

    const userTravel = userResult.rows[0];

    if (!userTravel.needs_accommodation || !userTravel.hotel_check_in || !userTravel.hotel_check_out) {
      return res.json({
        success: true,
        data: [],
        message: 'No hotel dates specified'
      });
    }

    // Find people with overlapping hotel dates
    const query = `
      SELECT
        ta.*,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        ap.organization_name,
        ap.city,
        ap.country,
        ap.bio,
        cr.dietary_restrictions,
        cr.accessibility_needs
      FROM travel_arrangements ta
      LEFT JOIN conference_registrations cr ON ta.registration_id = cr.id
      LEFT JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      WHERE ta.registration_id != $1
        AND ta.needs_accommodation = TRUE
        AND ta.hotel_check_in IS NOT NULL
        AND ta.hotel_check_out IS NOT NULL
        AND (
          (ta.hotel_check_in <= $2 AND ta.hotel_check_out >= $3)
          OR
          (ta.hotel_check_in >= $2 AND ta.hotel_check_in < $3)
          OR
          (ta.hotel_check_out > $2 AND ta.hotel_check_out <= $3)
        )
      ORDER BY
        CASE
          WHEN ta.hotel_check_in = $2 AND ta.hotel_check_out = $3 THEN 0
          ELSE 1
        END,
        ta.hotel_check_in ASC
      LIMIT 30
    `;

    const values = [
      registration_id,
      userTravel.hotel_check_in,
      userTravel.hotel_check_out
    ];

    const result = await pool.query(query, values);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error finding roommates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find roommates'
    });
  }
}

/**
 * Get all travel arrangements for a conference (admin)
 */
async function getConferenceTravelArrangements(req, res) {
  try {
    const { conference_id } = req.params;

    const query = `
      SELECT
        ta.*,
        ap.first_name,
        ap.last_name,
        ap.user_email,
        ap.phone,
        ap.organization_name,
        cr.registration_type,
        cr.status
      FROM travel_arrangements ta
      LEFT JOIN conference_registrations cr ON ta.registration_id = cr.id
      LEFT JOIN attendee_profiles ap ON cr.attendee_id = ap.id
      WHERE cr.conference_id = $1
        AND cr.status = 'confirmed'
      ORDER BY ta.arrival_date ASC, ta.arrival_time ASC
    `;

    const result = await pool.query(query, [conference_id]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching conference travel arrangements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch travel arrangements'
    });
  }
}

module.exports = {
  saveTravelArrangements,
  getTravelArrangements,
  findTravelBuddies,
  findRoommates,
  getConferenceTravelArrangements
};
