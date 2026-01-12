const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { requireAuth, requireRole } = require('../middleware/auth');

// SECURITY: All vote routes require authentication and board/admin role
router.use(requireAuth);

// Board vote routes - restricted to board members and admins
router.post('/process', requireRole('board', 'admin'), voteController.processVote);
router.post('/ai-process', requireRole('board', 'admin'), voteController.aiProcessVote);
router.get('/history', requireRole('board', 'admin'), voteController.getHistory);
router.get('/export', requireRole('board', 'admin'), voteController.exportHistory);

module.exports = router;
