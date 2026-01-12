const { asyncHandler } = require('../middleware/errorHandler');
const paymentService = require('../services/paymentService');

exports.createMembershipPayment = asyncHandler(async (req, res) => {
  const { contactId, membershipType, autoRenew } = req.body;
  
  if (!contactId || !membershipType) {
    return res.status(400).json({ success: false, error: 'Contact ID and membership type required' });
  }
  
  if (!['student', 'regular', 'institutional'].includes(membershipType)) {
    return res.status(400).json({ success: false, error: 'Invalid membership type' });
  }
  
  const result = await paymentService.createMembershipPayment({ contactId, membershipType, autoRenew });
  
  res.json({ success: true, ...result });
});

exports.createConferencePayment = asyncHandler(async (req, res) => {
  const { contactId, conferenceId, registrationType, amount, metadata } = req.body;
  
  if (!contactId || !registrationType || !amount) {
    return res.status(400).json({ success: false, error: 'Contact ID, registration type, and amount required' });
  }
  
  const result = await paymentService.createConferencePayment({
    contactId,
    conferenceId,
    registrationType,
    amount,
    metadata
  });
  
  res.json({ success: true, ...result });
});

exports.handleStripeWebhook = asyncHandler(async (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }
  
  await paymentService.handleWebhookEvent(event);
  
  res.json({ received: true });
});

exports.getPaymentHistory = asyncHandler(async (req, res) => {
  const { contactId } = req.params;
  
  const payments = await paymentService.getPaymentHistory(contactId);
  
  res.json({ success: true, payments });
});

exports.getMembershipPrices = asyncHandler(async (req, res) => {
  res.json({ success: true, prices: paymentService.MEMBERSHIP_PRICES });
});
