# Clerk Authentication

ArtistsInMyCity uses Clerk for authentication via the **browser / vanilla JS**
integration. This is a static HTML + JS site deployed on Netlify. There is no
Next.js. The current setup uses **TEST** Clerk keys.

---

## Current test setup

- Clerk instance: `topical-kodiak-98.clerk.accounts.dev`
- Publishable key (TEST, public/safe for frontend):
  `pk_test_dG9waWNhbC1rb2RpYWstOTguY2xlcmsuYWNjb3VudHMuZGV2JA`
- Secret key: **never** in frontend. Set `CLERK_SECRET_KEY` only in Netlify env.
- Do **not** switch to live keys until the full flow is verified end-to-end.

## Where the scripts load

Clerk is loaded once, site-wide, through the shared loader in
`assets/js/integrations.js` (block `SPRINT8_AUTH_LOADER`), which injects
`assets/js/clerk-auth.js`. That file, in turn, injects the two Clerk CDN
scripts (the `@clerk/ui` helper and `@clerk/clerk-js@6`) with duplicate guards
and the `data-clerk-publishable-key` attribute.

Pages that do not include `integrations.js` (for example
`pages/exhibit-builder.html`) include `assets/js/clerk-auth.js` directly.

Duplicate protection:
- `window.__aimcClerkAuthLoaded` guards the module.
- `script[data-aimc-clerk-auth]`, `script[data-aimc-clerk-js]`, and
  `script[data-aimc-clerk-ui]` guards prevent double script injection.

## Public API: `window.AIMCAuth`

| Method | Purpose |
| --- | --- |
| `init()` | Loads Clerk, wires nav, applies route protection. Auto-runs on load. |
| `isSignedIn()` | Boolean auth state. |
| `getUser()` | Current Clerk user object (or null). |
| `getRole()` | Role from Clerk `publicMetadata.role`, falling back to localStorage. |
| `signIn(opts)` | Opens the Clerk sign-in modal. |
| `signUp(role)` | Stores pending role, opens the Clerk sign-up modal. |
| `signOut()` | Signs out and returns to the homepage. |
| `requireAuth({role})` | Guards a page; redirects or shows a wrong-role screen. |
| `setRole(role)` | Persists role to Clerk metadata (server fn) + localStorage. |
| `redirectAfterAuth(kind)` | Redirects by role for `signup` / `signin` / `home`. |

## How nav state works

`updateNav()` finds the existing header buttons (no redesign):
- **Signed out:** shows *Sign In* (`a.btn.ghost[href*="sign-in"]`) and
  *Join* (`a.btn.hot[href*="join"]`).
- **Signed in:** hides Sign In + Join, injects a role-aware dashboard link,
  and mounts the Clerk user button (`Clerk.mountUserButton`).

Role-aware link labels: Artist -> My Studio, Fan -> Fan Space,
Creator -> Creator Space, Admin -> Admin.

## Role model

Roles live in Clerk `user.publicMetadata.role`. Allowed values:
`artist`, `fan`, `creator`, `admin`. While the session verification for the
server function is still a TODO (see below), the role is also mirrored to
`localStorage` under `aimc.role` as a fallback.

## Join flow (role choice)

1. User clicks **Join** -> role-choice modal ("How do you want to join?").
2. Choice stored in `localStorage.aimc.pendingRole` and `auth_role_selected` fires.
3. Clerk sign-up modal opens.
4. On completion, the pending role is written to Clerk metadata via
   `clerk-set-role` (with localStorage fallback).
5. Redirect by role:
   - Artist  -> `/pages/artist-onboarding.html`
   - Fan     -> `/dashboard/fan-dashboard.html`
   - Creator -> `/dashboard/creator-dashboard.html`
   - Admin   -> `/dashboard/admin.html` (if present)

## Sign-in flow

1. User clicks **Sign In** -> Clerk sign-in modal.
2. Role read from Clerk metadata. If missing, the role-choice modal appears.
3. Redirect by role:
   - Artist  -> `/dashboard/artist-studio.html`
   - Fan     -> `/dashboard/fan-dashboard.html`
   - Creator -> `/dashboard/creator-dashboard.html`
   - Admin   -> `/dashboard/admin.html`

## Protected routes

Guarded by `PROTECTED` in `clerk-auth.js`:
- `/dashboard/artist-studio.html` (artist)
- `/pages/artist-onboarding.html` (artist)
- `/pages/exhibit-builder.html` (artist)
- `/dashboard/fan-dashboard.html` (fan)
- `/dashboard/creator-dashboard.html` (creator)
- `/dashboard/admin.html` (admin, if present)

Unauthenticated visitors are sent to sign-in and returned to the intended page
via `localStorage.aimc.returnTo`. Wrong-role visitors see a polished access
message linking to their correct dashboard (no hard crash).

## Netlify environment variables

```
CLERK_PUBLISHABLE_KEY=pk_test_dG9waWNhbC1rb2RpYWstOTguY2xlcmsuYWNjb3VudHMuZGV2JA
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dG9waWNhbC1rb2RpYWstOTguY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=            # set in Netlify only; never commit
CLERK_WEBHOOK_SECRET=whsec_...
```

`CLERK_SECRET_KEY` is **required** for role persistence to Clerk. Without it the
role-update function returns a safe setup error and the app falls back to the
temporary localStorage role mirror. Keep all three publishable/secret vars in
Netlify env; the secret is never committed and never sent to the browser.

## Clerk dashboard: allowed origins & redirect URLs

Configure these in the Clerk dashboard for the active instance. If they are
missing, Clerk may refuse to return the user to the site after auth (which is
what caused the earlier post-signup redirect loop).

- **Allowed origins / domains:** add `https://artistsinmycity.com` (and any
  Netlify preview domain used for testing, plus `http://localhost:8888` for
  local Netlify dev).
- **Sign-in URL:** the Clerk-hosted sign-in (default) or `/pages/sign-in.html`.
- **Sign-up URL:** the Clerk-hosted sign-up (default) or `/pages/join.html`.
- **After sign-up URL:** must be allowed to return to `https://artistsinmycity.com`.
  The client also passes an explicit `afterSignUpUrl`/`redirectUrl` back to
  the current page with a `__clerk_cb=1` marker.
- **After sign-in URL:** must be allowed to return to `https://artistsinmycity.com`
  (same `afterSignInUrl`/`redirectUrl` handling).

On return, `clerk-auth.js` detects the callback (`__clerk` params or an
active auth-flow marker), applies the pending role, and routes the user once
per tab session (loop-guarded).


## Server-side role update (session-verified)

`netlify/functions/clerk-set-role.js`:
- POST only (405 otherwise).
- Requires `CLERK_SECRET_KEY` from `process.env`. If it is missing the
  function returns a safe setup error (`503 { ok:false, setup:true }`) and does
  nothing - the key is never exposed or returned.
- **Does not trust any client-provided user id.** The browser sends its Clerk
  session id + a fresh session token (via the `Authorization: Bearer` header
  and the JSON body). The function calls Clerk's
  `POST /v1/sessions/{id}/verify` endpoint server-side and derives the
  authenticated user id from Clerk's verified response.
- Because the user id comes from the verified session, a signed-in user can
  only ever update **their own** role. Requests without a valid, active
  session are rejected with `401`.
- Validates the role against the allow-list (`artist`, `fan`, `creator`,
  `admin`); invalid roles return `400`.
- PATCHes Clerk user `public_metadata` and returns a normalized
  `{ ok, role }`. Never leaks stack traces, provider error bodies, or secrets.

The client caller (`setRole` in `clerk-auth.js`) mirrors the role to
**localStorage as a temporary dev fallback only** so the UI keeps working before
Clerk metadata is confirmed. In production, Clerk metadata (written by this
function) is the source of truth; the localStorage copy must not be relied on.

## Analytics + Loop events

Fired via `AIMC.trackEvent`, `AIMCLoop.track`, `aimcTrack`, and `gtag`:
`user_signup`, `artist_signup`, `fan_signup`, `creator_signup`,
`user_login`, `artist_login`, `fan_login`, `creator_login`, `user_logout`,
`auth_role_selected`, `auth_required_redirect`, `auth_wrong_role`.

## Roadie auth context

When signed in, `clerk-auth.js` publishes `window.AIMCAuthContext` and
dispatches `aimc:auth-context`. `roadie.js` includes an `auth` block
(user id, first name, role, signed-in flag) in its chat payload and prefers the
Clerk role. Role-aware greetings:
- Artist: "Welcome back. Ready to improve your exhibit?"
- Fan: "Welcome back. Want to discover something new?"
- Creator: "Welcome back. Ready to spotlight local talent?"

## Switching to live Clerk keys later

1. Create/enable the production Clerk instance.
2. In Netlify env, replace the TEST publishable key with the `pk_live_...` key
   (update both `CLERK_PUBLISHABLE_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`),
   and set the live `CLERK_SECRET_KEY`.
3. Update the CDN host and `data-clerk-publishable-key` in `clerk-auth.js`
   to the live instance domain/key.
4. Configure allowed origins/redirect URLs in the Clerk dashboard.
5. (Session verification is already implemented server-side - just ensure the
   live `CLERK_SECRET_KEY` is set so verification can call Clerk.)

## Production checklist

- [ ] Live Clerk instance configured with allowed origins.
- [ ] Live keys set in Netlify (secret never committed).
- [x] `clerk-set-role` session verification implemented (server verifies session).
- [ ] Sign-in / sign-up / sign-out verified end-to-end.
- [ ] Role choice + redirects verified for all roles.
- [ ] Protected routes verified (signed-out + wrong-role).
- [ ] No secret key in any frontend source.
- [ ] GA + Loop events verified once each, no duplicates.
