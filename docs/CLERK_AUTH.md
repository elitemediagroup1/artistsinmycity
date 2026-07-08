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

## Server-side role update

`netlify/functions/clerk-set-role.js`:
- POST only (405 otherwise).
- Reads `CLERK_SECRET_KEY` from `process.env` (never returned to client).
- Validates the role against the allow-list.
- PATCHes Clerk user `public_metadata`.
- Returns a normalized `{ ok, role }` and never leaks provider errors.

**SECURITY TODO (before production):** the function currently trusts the
`userId` in the body. Add Clerk session verification (validate the Clerk
session JWT / `__session` cookie) before mutating metadata.

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
5. Complete the session-verification TODO in `clerk-set-role.js`.

## Production checklist

- [ ] Live Clerk instance configured with allowed origins.
- [ ] Live keys set in Netlify (secret never committed).
- [ ] `clerk-set-role` session verification implemented.
- [ ] Sign-in / sign-up / sign-out verified end-to-end.
- [ ] Role choice + redirects verified for all roles.
- [ ] Protected routes verified (signed-out + wrong-role).
- [ ] No secret key in any frontend source.
- [ ] GA + Loop events verified once each, no duplicates.
