const express = require('express');
const router = express.Router();
const committeeController = require('../controllers/committeeController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public committee routes (read-only)
router.get('/', committeeController.getAllCommittees);
router.get('/:id', committeeController.getCommitteeById);
router.get('/member/:memberId', committeeController.getMemberCommittees);

// SECURITY: Protected committee routes (admin only)
router.post('/', requireAuth, requireRole('admin'), committeeController.createCommittee);
router.put('/:id', requireAuth, requireRole('admin'), committeeController.updateCommittee);

// Committee member management (admin only)
router.post('/:committeeId/members', requireAuth, requireRole('admin'), committeeController.addCommitteeMember);
router.delete('/:committeeId/members/:memberId', requireAuth, requireRole('admin'), committeeController.removeCommitteeMember);

module.exports = router;
