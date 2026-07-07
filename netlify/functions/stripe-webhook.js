exports.handler = async (event) => {
  // TODO: verify Stripe signature using STRIPE_WEBHOOK_SECRET.
  const payload = JSON.parse(event.body || '{}');
  // TODO: update Neon subscription/order records and forward payment events to EMG Loop.
  return { statusCode: 200, body: JSON.stringify({ ok: true, placeholder: true, received: payload.type || 'stripe.event' }) };
};
