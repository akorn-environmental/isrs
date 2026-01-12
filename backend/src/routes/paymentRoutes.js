const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

router.get('/prices', paymentController.getMembershipPrices);

router.use(requireAuth);

router.post('/membership', paymentController.createMembershipPayment);
router.post('/conference', paymentController.createConferencePayment);
router.get('/history/:contactId', paymentController.getPaymentHistory);

router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

module.exports = router;
