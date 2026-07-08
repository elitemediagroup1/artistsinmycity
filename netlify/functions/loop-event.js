/*
 * ArtistsInMyCity - EMG LOOP event pipeline (Sprint 10).
 * ------------------------------------------------------------------
 * Receives normalized site events from the browser (window.AIMCLoop)
 * and forwards them, signed, to the EMG LOOP webhook. LOOP is the only
 * component that writes to Neon. This function never touches Neon and
 * never exposes any secret to the browser.
 */

const crypto = require("crypto");

const CORS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};

function resp(statusCode, obj) {
  return { statusCode: statusCode, headers: CORS, body: JSON.stringify(obj) };
}

function newId() {
  try { return crypto.randomUUID(); }
  catch (e) { return "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10); }
}

function str(v) { return (typeof v === "string") ? v : (v == null ? null : String(v)); }

exports.handler = async (event) => {
  // POST only.
  if (event.httpMethod !== "POST") {
    return resp(405, { ok: false, error: "Method not allowed" });
  }

  // Validate JSON body.
  let input;
  try {
    input = JSON.parse(event.body || "{}");
  } catch (e) {
    return resp(400, { ok: false, error: "Invalid JSON" });
  }
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return resp(400, { ok: false, error: "Invalid body" });
  }

  // event_name is required.
  const eventName = str(input.event_name);
  if (!eventName) {
    return resp(400, { ok: false, error: "event_name is required" });
  }

  // Config from Netlify env (never sent to browser).
  const WEBHOOK_URL = process.env.EMG_LOOP_WEBHOOK_URL;
  const WEBHOOK_SECRET = process.env.EMG_LOOP_WEBHOOK_SECRET;
  const PLATFORM_ID = process.env.AIMC_PLATFORM_ID || "artistsinmycity";
  const SITE_ID = process.env.AIMC_SITE_ID || "artistsinmycity";
  const ENVIRONMENT = process.env.CONTEXT || process.env.NODE_ENV || "production";

  if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
    // Safe setup error - no secret values leaked.
    return resp(503, { ok: false, error: "LOOP webhook not configured" });
  }

  // Build the normalized event envelope.
  const now = new Date().toISOString();
  const normalized = {
    event_id: str(input.event_id) || newId(),
    event_name: eventName,
    occurred_at: str(input.occurred_at) || now,
    received_at: now,
    platform_id: PLATFORM_ID,
    site_id: SITE_ID,
    site_url: "https://artistsinmycity.com",
    environment: str(input.environment) || ENVIRONMENT,
    source: "web",
    anonymous_id: str(input.anonymous_id) || null,
    clerk_user_id: str(input.clerk_user_id) || null,
    role: str(input.role) || null,
    session_id: str(input.session_id) || null,
    page_url: str(input.page_url) || null,
    referrer: str(input.referrer) || null,
    payload: (input.payload && typeof input.payload === "object" && !Array.isArray(input.payload)) ? input.payload : {}
  };

  // Sign the request body with the shared secret (HMAC-SHA256).
  const bodyString = JSON.stringify(normalized);
  const timestamp = String(Date.now());
  let signature;
  try {
    signature = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(timestamp + "." + bodyString)
      .digest("hex");
  } catch (e) {
    return resp(500, { ok: false, error: "Signing failed" });
  }

  // Forward the signed, normalized event to EMG LOOP.
  let loopStatus = 0;
  try {
    const controller = new AbortController();
    const timer = setTimeout(function () { controller.abort(); }, 8000);
    const loopRes = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AIMC-Platform": PLATFORM_ID,
        "X-AIMC-Timestamp": timestamp,
        "X-AIMC-Signature": signature
      },
      body: bodyString,
      signal: controller.signal
    });
    clearTimeout(timer);
    loopStatus = loopRes.status;
    if (!loopRes.ok) {
      // Do not leak upstream response detail; return a generic gateway error.
      return resp(502, { ok: false, error: "LOOP rejected event", event_id: normalized.event_id });
    }
  } catch (e) {
    // Network / timeout / abort - browser should queue and retry.
    return resp(502, { ok: false, error: "LOOP unreachable", event_id: normalized.event_id });
  }

  // Success. Return only non-sensitive normalized identifiers.
  return resp(200, {
    ok: true,
    event_id: normalized.event_id,
    event_name: normalized.event_name,
    occurred_at: normalized.occurred_at,
    forwarded: true
  });
};
