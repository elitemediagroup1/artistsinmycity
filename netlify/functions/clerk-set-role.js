/*
 * ArtistsInMyCity - Netlify function: clerk-set-role
 *
 * Sets a Clerk user public_metadata.role SERVER-SIDE using the secret key
 * from process.env.CLERK_SECRET_KEY. The secret key is NEVER exposed to the
 * frontend and is never returned in any response.
 *
 * SECURITY MODEL (production-ready):
 *   - POST only.
 *   - Requires CLERK_SECRET_KEY (returns a safe setup error if missing).
 *   - Does NOT trust any client-provided user id. The caller sends its Clerk
 *     session id + session token; we verify that session against Clerk
 *     server-side and derive the authenticated user id from Clerk's response.
 *   - Because the user id comes from the verified session, a signed-in user
 *     can only ever update THEIR OWN role.
 *   - Validates role against an allow-list.
 *   - Never returns stack traces, provider error bodies, or secrets.
 */

var ALLOWED_ROLES = ["artist", "fan", "creator", "admin"];
var CLERK_API = "https://api.clerk.com/v1";

function json(statusCode, obj) {
  return {
    statusCode: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(obj)
  };
}

/* Pull the session token from the Authorization header or the JSON body. */
function readBearer(event) {
  try {
    var h = event.headers || {};
    var raw = h.authorization || h.Authorization || "";
    if (raw.indexOf("Bearer ") === 0) return raw.slice(7).trim();
  } catch (e) {}
  return null;
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  var secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    /* Safe setup error - no secret, no detail leaked. */
    return json(503, { ok: false, error: "Auth service not configured", setup: true });
  }

  var payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { ok: false, error: "Invalid JSON body" });
  }

  var role = (payload.role || "").toString().toLowerCase().trim();
  if (ALLOWED_ROLES.indexOf(role) === -1) {
    return json(400, { ok: false, error: "Invalid role" });
  }

  var sessionId = (payload.sessionId || "").toString().trim();
  var sessionToken = readBearer(event) || (payload.sessionToken || "").toString().trim();
  if (!sessionId || !sessionToken || sessionId.length > 200 || sessionToken.length > 4096) {
    return json(401, { ok: false, error: "Not authenticated" });
  }

  /* ---- 1. Verify the session with Clerk (server-side). ---- */
  var verifiedUserId = null;
  try {
    var vres = await fetch(CLERK_API + "/sessions/" + encodeURIComponent(sessionId) + "/verify", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + secret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ token: sessionToken })
    });
    if (!vres.ok) {
      return json(401, { ok: false, error: "Session verification failed" });
    }
    var session = await vres.json();
    if (!session || session.status !== "active" || !session.user_id) {
      return json(401, { ok: false, error: "Session not active" });
    }
    verifiedUserId = session.user_id;
  } catch (e) {
    return json(502, { ok: false, error: "Could not verify session" });
  }

  /* ---- 2. Update ONLY the verified user's metadata. ---- */
  try {
    var res = await fetch(CLERK_API + "/users/" + encodeURIComponent(verifiedUserId) + "/metadata", {
      method: "PATCH",
      headers: {
        "Authorization": "Bearer " + secret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ public_metadata: { role: role } })
    });
    if (!res.ok) {
      /* Do not leak provider error details to the client. */
      return json(502, { ok: false, error: "Could not update role" });
    }
    return json(200, { ok: true, role: role });
  } catch (e) {
    return json(500, { ok: false, error: "Unexpected error updating role" });
  }
};
