// netlify/functions/loop-event.js
//
// ArtistsInMyCity -> EMG Loop Event Gateway (producer side).
//
// This server-side Netlify Function is the ONLY place the Loop webhook secret
// is read. The browser posts a lightweight event to this function; the function
// normalizes it into the EMG Loop event envelope and forwards it to Loop with
// the shared-secret header. The secret is never sent to or exposed in the browser.
//
// Contract (EMG Loop Event Gateway):
//   POST https://app.emgloop.com/api/v1/events
//   header: x-emg-loop-secret: <EMG_LOOP_WEBHOOK_SECRET>
//   body:   { eventId, platform, site, eventType, occurredAt, anonymousId,
//             userId, sessionId, pageUrl, referrer, payload, metadata }
//
// Fail-safe: if env vars are missing we warn and no-op (HTTP 200) so the site
// never breaks. All Loop calls are timed out and errors are swallowed.

"use strict";

const PLATFORM = "artistsinmycity";
const SITE = "artistsinmycity.com";
const DEFAULT_TIMEOUT_MS = 4000;

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  };
}

function safeParse(raw) {
  if (!raw) return {};
  try { return JSON.parse(raw); } catch (_e) { return {}; }
}

// RFC4122-ish v4 id without extra deps.
function uuid() {
  try {
    const c = require("crypto");
    if (typeof c.randomUUID === "function") return c.randomUUID();
  } catch (_e) {}
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (ch) {
    const r = (Math.random() * 16) | 0;
    const v = ch === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function firstDefined() {
  for (let i = 0; i < arguments.length; i++) {
    const v = arguments[i];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

exports.handler = async function (event) {
  // Only accept POSTs from our own client layer.
  if (event.httpMethod === "OPTIONS") {
    return jsonResponse(204, {});
  }
  if (event.httpMethod !== "POST") {
    return jsonResponse(405, { ok: false, error: "method_not_allowed" });
  }

  const WEBHOOK_URL = process.env.EMG_LOOP_WEBHOOK_URL;
  const WEBHOOK_SECRET = process.env.EMG_LOOP_WEBHOOK_SECRET;

  // Fail-safe: without configuration, warn and no-op. Never break the caller.
  if (!WEBHOOK_URL || !WEBHOOK_SECRET) {
    console.warn(
      "[loop-event] EMG_LOOP_WEBHOOK_URL or EMG_LOOP_WEBHOOK_SECRET missing; skipping Loop dispatch."
    );
    return jsonResponse(200, { ok: true, skipped: true, reason: "not_configured" });
  }

  const body = safeParse(event.body);

  // Accept either the new field names or the older snake_case names the client
  // may still send, and normalize to the EMG Loop Event Gateway envelope.
  const eventType = firstDefined(body.eventType, body.event_name, body.event, body.name);
  if (!eventType) {
    return jsonResponse(400, { ok: false, error: "missing_event_type" });
  }

  const nowIso = new Date().toISOString();
  const envelope = {
    eventId: firstDefined(body.eventId, body.event_id, uuid()),
    platform: PLATFORM,
    site: SITE,
    eventType: eventType,
    occurredAt: firstDefined(body.occurredAt, body.occurred_at, nowIso),
    anonymousId: firstDefined(body.anonymousId, body.anonymous_id),
    userId: firstDefined(body.userId, body.clerk_user_id, body.user_id),
    sessionId: firstDefined(body.sessionId, body.session_id),
    pageUrl: firstDefined(body.pageUrl, body.page_url),
    referrer: firstDefined(body.referrer),
    payload: body.payload && typeof body.payload === "object" ? body.payload : {},
    metadata: Object.assign(
      {
        source: "web",
        environment: process.env.CONTEXT || process.env.NODE_ENV || "production",
        receivedAt: nowIso,
      },
      body.metadata && typeof body.metadata === "object" ? body.metadata : {}
    ),
  };

  const controller = new AbortController();
  const timer = setTimeout(function () { controller.abort(); }, DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-emg-loop-secret": WEBHOOK_SECRET,
      },
      body: JSON.stringify(envelope),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.warn("[loop-event] Loop responded with status " + res.status);
      return jsonResponse(202, { ok: true, forwarded: false, status: res.status });
    }

    return jsonResponse(200, { ok: true, forwarded: true, eventId: envelope.eventId });
  } catch (err) {
    const reason = err && err.name === "AbortError" ? "timeout" : "network_error";
    console.warn("[loop-event] Loop dispatch failed: " + reason);
    return jsonResponse(202, { ok: true, forwarded: false, reason: reason });
  } finally {
    clearTimeout(timer);
  }
};
