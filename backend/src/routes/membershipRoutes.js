const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

// Public routes (no auth required)
router.post('/join', membershipController.createMember);
router.get('/lookup', membershipController.getMemberByEmail);

// Member routes (could add auth later)
router.get('/dashboard/:member_id', membershipController.getMemberDashboard);
router.put('/profile/:member_id', membershipController.updateMemberProfile);
router.post('/donate', membershipController.recordDonation);

module.exports = router;
