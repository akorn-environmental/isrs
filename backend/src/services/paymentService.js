const Stripe = require('stripe');
const { query } = require('../config/database');

// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const MEMBERSHIP_PRICES = {
  student: 2500, // $25.00
  regular: 7500, // $75.00
  institutional: 50000 // $500.00
};

async function createPaymentIntent({ amount, currency = 'usd', contactId, paymentType, description, metadata = {} }) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { ...metadata, contactId, paymentType },
    description
  });

  await query(`
    INSERT INTO payment_transactions (contact_id, stripe_payment_intent_id, amount, currency, status, payment_type, description, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
  `, [contactId, paymentIntent.id, amount, currency, 'pending', paymentType, description, JSON.stringify(metadata)]);

  return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id };
}

async function createMembershipPayment({ contactId, membershipType, autoRenew = false }) {
  const amount = MEMBERSHIP_PRICES[membershipType] / 100;
  const description = `ISRS ${membershipType} membership`;
  
  const { clientSecret, paymentIntentId } = await createPaymentIntent({
    amount,
    contactId,
    paymentType: 'membership',
    description,
    metadata: { membershipType, autoRenew }
  });
  
  return { clientSecret, paymentIntentId, amount };
}

async function createConferencePayment({ contactId, conferenceId, registrationType, amount, metadata = {} }) {
  const description = `ICSR Conference Registration - ${registrationType}`;
  
  const { clientSecret, paymentIntentId } = await createPaymentIntent({
    amount,
    contactId,
    paymentType: 'conference_registration',
    description,
    metadata: { conferenceId, registrationType, ...metadata }
  });
  
  return { clientSecret, paymentIntentId, amount };
}

async function handleWebhookEvent(event) {
  const eventId = event.id;
  
  const existing = await query(`SELECT id FROM stripe_webhook_events WHERE stripe_event_id = $1`, [eventId]);
  if (existing.rows.length > 0) {
    return { success: true, message: 'Event already processed' };
  }
  
  await query(`
    INSERT INTO stripe_webhook_events (stripe_event_id, event_type, payload)
    VALUES ($1, $2, $3)
  `, [eventId, event.type, JSON.stringify(event.data)]);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
    case 'charge.succeeded':
      await handleChargeSuccess(event.data.object);
      break;
  }
  
  await query(`UPDATE stripe_webhook_events SET processed = true, processed_at = NOW() WHERE stripe_event_id = $1`, [eventId]);
  
  return { success: true };
}

async function handlePaymentSuccess(paymentIntent) {
  const result = await query(`
    UPDATE payment_transactions
    SET status = 'succeeded', stripe_charge_id = $2, updated_at = NOW()
    WHERE stripe_payment_intent_id = $1
    RETURNING *
  `, [paymentIntent.id, paymentIntent.latest_charge]);
  
  if (result.rows.length === 0) return;
  
  const transaction = result.rows[0];
  
  if (transaction.payment_type === 'membership') {
    const metadata = typeof transaction.metadata === 'string' ? JSON.parse(transaction.metadata) : transaction.metadata;
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setFullYear(endDate.getFullYear() + 1);
    
    await query(`
      INSERT INTO membership_payments (transaction_id, contact_id, membership_type, start_date, end_date, auto_renew)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [transaction.id, transaction.contact_id, metadata.membershipType, startDate, endDate, metadata.autoRenew]);
  } else if (transaction.payment_type === 'conference_registration') {
    const metadata = typeof transaction.metadata === 'string' ? JSON.parse(transaction.metadata) : transaction.metadata;
    
    await query(`
      INSERT INTO conference_payments (transaction_id, contact_id, conference_id, registration_type, amount_paid)
      VALUES ($1, $2, $3, $4, $5)
    `, [transaction.id, transaction.contact_id, metadata.conferenceId, metadata.registrationType, transaction.amount]);
  }
}

async function handlePaymentFailure(paymentIntent) {
  await query(`
    UPDATE payment_transactions
    SET status = 'failed', updated_at = NOW()
    WHERE stripe_payment_intent_id = $1
  `, [paymentIntent.id]);
}

async function handleChargeSuccess(charge) {
  await query(`
    UPDATE payment_transactions
    SET stripe_charge_id = $2, updated_at = NOW()
    WHERE stripe_payment_intent_id = $1
  `, [charge.payment_intent, charge.id]);
}

async function getPaymentHistory(contactId) {
  const result = await query(`
    SELECT * FROM payment_transactions
    WHERE contact_id = $1
    ORDER BY created_at DESC
  `, [contactId]);
  
  return result.rows;
}

module.exports = {
  createPaymentIntent,
  createMembershipPayment,
  createConferencePayment,
  handleWebhookEvent,
  getPaymentHistory,
  MEMBERSHIP_PRICES
};
