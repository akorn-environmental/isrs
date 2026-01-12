const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public route - anyone can submit feedback
router.post('/submit', feedbackController.submitFeedback);

// SECURITY: Admin routes - require authentication and admin role
router.get('/', requireAuth, requireRole('admin'), feedbackController.getAllFeedback);
router.get('/summary', requireAuth, requireRole('admin'), feedbackController.getFeedbackSummary);
router.patch('/:id', requireAuth, requireRole('admin'), feedbackController.updateFeedbackStatus);

module.exports = router;
