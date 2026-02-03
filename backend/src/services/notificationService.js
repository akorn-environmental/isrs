/**
 * Notification Service
 * Creates and manages dashboard notifications for email parsing events
 */

const { query } = require('../config/database');

/**
 * Create a new notification
 * @param {Object} notification - Notification data
 * @param {string} notification.type - Notification type (email_parsed, email_review_needed, email_parse_error)
 * @param {string} notification.title - Notification title
 * @param {string} notification.message - Notification message
 * @param {Object} notification.data - Additional data (parsedEmailId, confidence, etc.)
 * @returns {Promise<Object>} Created notification
 */
async function createNotification({ type, title, message, data = {} }) {
  try {
    const result = await query(
      `INSERT INTO notifications (type, title, message, data, read, created_at)
       VALUES ($1, $2, $3, $4, false, NOW())
       RETURNING *`,
      [type, title, message, JSON.stringify(data)]
    );

    console.log(`[Notification] Created notification: ${type} - ${title}`);
    return result.rows[0];
  } catch (error) {
    console.error('[Notification] Error creating notification:', error);
    throw error;
  }
}

/**
 * Get dashboard notifications (most recent first)
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of notifications to return (default: 50)
 * @param {boolean} options.unreadOnly - Only return unread notifications (default: false)
 * @returns {Promise<Array>} Array of notifications
 */
async function getDashboardNotifications({ limit = 50, unreadOnly = false } = {}) {
  try {
    let sql = `
      SELECT *
      FROM notifications
    `;

    const params = [];

    if (unreadOnly) {
      sql += ` WHERE read = false`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(sql, params);
    return result.rows;
  } catch (error) {
    console.error('[Notification] Error fetching notifications:', error);
    throw error;
  }
}

/**
 * Mark notification as read
 * @param {number} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification
 */
async function markAsRead(notificationId) {
  try {
    const result = await query(
      `UPDATE notifications
       SET read = true, read_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [notificationId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Notification ${notificationId} not found`);
    }

    return result.rows[0];
  } catch (error) {
    console.error('[Notification] Error marking as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read
 * @returns {Promise<number>} Number of notifications marked as read
 */
async function markAllAsRead() {
  try {
    const result = await query(
      `UPDATE notifications
       SET read = true, read_at = NOW()
       WHERE read = false
       RETURNING id`
    );

    console.log(`[Notification] Marked ${result.rows.length} notifications as read`);
    return result.rows.length;
  } catch (error) {
    console.error('[Notification] Error marking all as read:', error);
    throw error;
  }
}

/**
 * Delete old notifications (cleanup)
 * @param {number} daysToKeep - Number of days to keep notifications (default: 30)
 * @returns {Promise<number>} Number of notifications deleted
 */
async function deleteOldNotifications(daysToKeep = 30) {
  try {
    const result = await query(
      `DELETE FROM notifications
       WHERE created_at < NOW() - INTERVAL '${daysToKeep} days'
       RETURNING id`
    );

    console.log(`[Notification] Deleted ${result.rows.length} old notifications`);
    return result.rows.length;
  } catch (error) {
    console.error('[Notification] Error deleting old notifications:', error);
    throw error;
  }
}

/**
 * Get notification statistics
 * @returns {Promise<Object>} Notification statistics
 */
async function getNotificationStats() {
  try {
    const result = await query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE read = false) as unread,
        COUNT(*) FILTER (WHERE type = 'email_parsed') as email_parsed,
        COUNT(*) FILTER (WHERE type = 'email_review_needed') as email_review_needed,
        COUNT(*) FILTER (WHERE type = 'email_parse_error') as email_parse_error
      FROM notifications
      WHERE created_at >= NOW() - INTERVAL '7 days'
    `);

    return result.rows[0];
  } catch (error) {
    console.error('[Notification] Error getting stats:', error);
    throw error;
  }
}

module.exports = {
  createNotification,
  getDashboardNotifications,
  markAsRead,
  markAllAsRead,
  deleteOldNotifications,
  getNotificationStats
};
