/*
 * ArtistsInMyCity - Netlify function: clerk-set-role
 * Updates a Clerk user public_metadata.role server-side using the secret
 * key from process.env. The secret key is NEVER exposed to the frontend.
 * POST only. Validates role. Returns a normalized response.
 *
 * SECURITY TODO (before production launch):
 *   This endpoint currently trusts the userId in the request body and does
 *   not verify the Clerk session token. For production, verify the caller is
 *   the authenticated user (e.g. validate a Clerk session JWT / __session
 *   cookie against CLERK_JWT_KEY) before mutating metadata. See docs.
 */

var ALLOWED_ROLES = ["artist", "fan", "creator", "admin"];
var CLERK_API_USER_BASE = "https://api.clerk.com/v1/users/";

function json(statusCode, obj) {
  return {
    statusCode: statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(obj)
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  var secret = process.env.CLERK_SECRET_KEY;
  if (!secret) {
    return json(500, { ok: false, error: "Auth service not configured" });
  }

  var payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return json(400, { ok: false, error: "Invalid JSON body" });
  }

  var userId = (payload.userId || "").toString().trim();
  var role = (payload.role || "").toString().toLowerCase().trim();

  if (!userId || userId.length > 120) {
    return json(400, { ok: false, error: "Missing or invalid userId" });
  }
  if (ALLOWED_ROLES.indexOf(role) === -1) {
    return json(400, { ok: false, error: "Invalid role" });
  }

  try {
    var res = await fetch(CLERK_API_USER_BASE + encodeURIComponent(userId) + "/metadata", {
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
