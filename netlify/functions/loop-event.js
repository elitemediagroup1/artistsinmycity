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

// ---------------------------------------------------------------------------
// Event taxonomy normalization (transition shim).
//
// The client is being migrated to canonical dot-namespaced event names
// (e.g. "session.login", "fan.followed_artist"). To avoid breaking older
// page bundles that may still emit legacy snake_case names, we translate any
// legacy name to its canonical form HERE, server-side, so Loop only ever
// stores ONE canonical event per action. No duplicate old+new events are
// emitted. Names already in canonical form pass through unchanged.
//
// Some legacy names also imply a payload role (fan_login / user_login ->
// session.login with { role }). Roles are merged into the payload, not the
// event name.
// ---------------------------------------------------------------------------
var CANONICAL_EVENTS = {
  "artist.profile_viewed": true,
  "artist.claimed_profile": true,
  "artist.submitted_music": true,
  "artist.theme_changed": true,
  "fan.signup_started": true,
  "fan.registered": true,
  "fan.followed_artist": true,
  "fan.saved_artist": true,
  "fan.interest_saved": true,
  "fan.home_personalized": true,
  "visitor.exhibit_viewed": true,
  "contact.form_submitted": true,
  "notification.opened": true,
  "session.login": true
};

var LEGACY_EVENT_MAP = {
  "fan_login":               { type: "session.login", add: { role: "fan" } },
  "user_login":              { type: "session.login" },
  "fan_registered":          { type: "fan.registered" },
  "fan_followed_artist":     { type: "fan.followed_artist" },
  "fan_saved_exhibit":       { type: "fan.saved_artist" },
  "fan_saved_artist":        { type: "fan.saved_artist" },
  "fan_interest_saved":      { type: "fan.interest_saved" },
  "fan_home_personalized":   { type: "fan.home_personalized" },
  "artist_theme_changed":    { type: "artist.theme_changed" },
  "visitor_visited_exhibit": { type: "visitor.exhibit_viewed" },
  "notification_opened":     { type: "notification.opened" }
};

var DROPPED_EVENTS = {
  "roadie_memory_updated": true
};

function canonicalizeEvent(rawType, payload) {
  var p = payload && typeof payload === "object" ? payload : {};
  if (DROPPED_EVENTS[rawType]) {
    return { drop: true };
  }
  if (CANONICAL_EVENTS[rawType]) {
    return { type: rawType, payload: p };
  }
  var mapped = LEGACY_EVENT_MAP[rawType];
  if (mapped) {
    var merged = Object.assign({}, mapped.add || {}, p);
    return { type: mapped.type, payload: merged };
  }
  return { type: rawType, payload: p };
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
  let eventType = firstDefined(body.eventType, body.event_name, body.event, body.name);
  if (!eventType) {
    return jsonResponse(400, { ok: false, error: "missing_event_type" });
  }

  // Normalize/translate legacy names to a single canonical event.
  var canon = canonicalizeEvent(eventType, (body.payload && typeof body.payload === "object") ? body.payload : {});
  if (canon.drop) {
    return jsonResponse(200, { ok: true, skipped: true, reason: "dropped_event", eventType: eventType });
  }
  eventType = canon.type;

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
    payload: canon.payload || {},
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
