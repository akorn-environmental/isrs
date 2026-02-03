const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// All notification endpoints require authentication
router.use(requireAuth);

/**
 * GET /api/notifications
 * Get dashboard notifications
 */
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const unreadOnly = req.query.unread === 'true';

    const notifications = await notificationService.getDashboardNotifications({
      limit,
      unreadOnly
    });

    res.json({
      success: true,
      notifications: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('[Notification API] Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/notifications/stats
 * Get notification statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await notificationService.getNotificationStats();

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('[Notification API] Error fetching stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/notifications/:id/read
 * Mark notification as read
 */
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);

    const notification = await notificationService.markAsRead(notificationId);

    res.json({
      success: true,
      notification: notification
    });
  } catch (error) {
    console.error('[Notification API] Error marking as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
router.put('/read-all', async (req, res) => {
  try {
    const count = await notificationService.markAllAsRead();

    res.json({
      success: true,
      count: count,
      message: `${count} notifications marked as read`
    });
  } catch (error) {
    console.error('[Notification API] Error marking all as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/notifications/cleanup
 * Delete old notifications (30+ days)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days) || 30;
    const count = await notificationService.deleteOldNotifications(daysToKeep);

    res.json({
      success: true,
      count: count,
      message: `${count} old notifications deleted`
    });
  } catch (error) {
    console.error('[Notification API] Error cleaning up notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
