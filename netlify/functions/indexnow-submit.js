exports.handler = async (event) => {
  const key = process.env.INDEXNOW_KEY;
  const endpoint = process.env.INDEXNOW_ENDPOINT || 'https://api.indexnow.org/indexnow';
  const site = process.env.SITE_URL || 'https://artistsinmycity.com';
  const body = JSON.parse(event.body || '{}');
  const urlList = body.urlList || [site];
  if (!key) return { statusCode: 200, body: JSON.stringify({ ok: true, placeholder: true, message: 'INDEXNOW_KEY not set', urlList }) };
  const res = await fetch(endpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ host: new URL(site).host, key, keyLocation: process.env.INDEXNOW_KEY_LOCATION, urlList }) });
  return { statusCode: res.ok ? 200 : 502, body: JSON.stringify({ ok: res.ok }) };
};
