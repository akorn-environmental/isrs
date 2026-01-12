const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public meeting routes (read-only)
router.get('/', meetingController.getUpcomingMeetings);
router.get('/:id', meetingController.getMeetingById);

// SECURITY: Protected meeting routes (require authentication)
router.post('/', requireAuth, requireRole('admin', 'board'), meetingController.createMeeting);
router.put('/:id', requireAuth, requireRole('admin', 'board'), meetingController.updateMeeting);
router.post('/:id/cancel', requireAuth, requireRole('admin', 'board'), meetingController.cancelMeeting);

// RSVP routes (require authentication)
router.post('/:id/rsvp', requireAuth, meetingController.rsvpToMeeting);

// Agenda routes (admin/board only)
router.post('/:meetingId/agenda', requireAuth, requireRole('admin', 'board'), meetingController.addAgendaItem);

module.exports = router;
