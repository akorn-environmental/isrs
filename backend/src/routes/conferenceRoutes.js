const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conferenceController');
const { recaptchaMiddleware } = require('../utils/recaptcha');

// Public routes (no auth required for registration)
router.get('/active', conferenceController.getActiveConference);
router.get('/:year', conferenceController.getConferenceByYear);
router.post('/profile', conferenceController.createOrUpdateProfile);
router.get('/profile/:email', conferenceController.getProfileByEmail);
router.post('/register', recaptchaMiddleware, conferenceController.createRegistration);
router.post('/payment/create', conferenceController.createPaymentCheckout);
router.post('/payment/confirm', conferenceController.confirmPayment);
router.get('/registration/:registration_id', conferenceController.getRegistration);

// Email invitations
router.post('/send-invites', conferenceController.sendInvites);

// Discount codes
router.post('/discount-code/validate', conferenceController.validateDiscountCode);

// Sessions/Workshops
router.get('/:conferenceId/sessions', conferenceController.getConferenceSessions);
router.post('/sessions/register', conferenceController.registerForSessions);

module.exports = router;
