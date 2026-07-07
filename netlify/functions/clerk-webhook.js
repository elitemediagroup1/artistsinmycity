exports.handler = async (event) => {
  // TODO: verify Clerk webhook signature using CLERK_WEBHOOK_SECRET.
  const payload = JSON.parse(event.body || '{}');
  // TODO: upsert user into Neon and forward user_signed_up to EMG Loop.
  return { statusCode: 200, body: JSON.stringify({ ok: true, placeholder: true, received: payload.type || 'clerk.event' }) };
};
