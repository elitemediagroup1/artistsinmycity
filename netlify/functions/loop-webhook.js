exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const loopUrl = process.env.LOOP_WEBHOOK_URL;
  if (!loopUrl) return { statusCode: 200, body: JSON.stringify({ ok: true, placeholder: true, message: 'LOOP_WEBHOOK_URL not set' }) };
  const res = await fetch(loopUrl, { method: 'POST', headers: { 'content-type': 'application/json', 'x-loop-secret': process.env.LOOP_WEBHOOK_SECRET || '' }, body: JSON.stringify({ platform_id: process.env.LOOP_PLATFORM_ID || 'artistsinmycity', ...body }) });
  return { statusCode: res.ok ? 200 : 502, body: JSON.stringify({ ok: res.ok }) };
};
