# ArtistsInMyCity - Build Status

**Current Version:** v4.3 (Sprint 8.3 - Clerk security finalization + redirect-loop fix)
**Last Updated:** 2026-07-08
**Date:** 2026-07-08

This file is mandatory after every sprint. It records what is done, what
remains, and the technical state of the platform.

---

## Completed Features

### Sprint 8.3 (Clerk Security Finalization + Redirect-Loop Fix)
- **Post-signup redirect loop FIXED** (`assets/js/clerk-auth.js`):
  - Hosted sign-in/up now returns to the site via explicit `redirectUrl` /
    `afterSignUpUrl` / `afterSignInUrl` (with a `__clerk_cb` marker),
    instead of looping back to Clerk's own signup page.
  - Post-auth routing runs once per tab (`aimc.authHandled` guard); an
    already-signed-in visitor is no longer force-redirected. `onPath()` prevents
    redirecting to a page the user is already on.
  - Missing role -> role-choice modal (no bounce to signup). Debug logs gated
    behind `window.AIMC_AUTH_DEBUG` / `?aimc_auth_debug`.
- **clerk-set-role hardened to production security** (`netlify/functions/clerk-set-role.js`):
  - Verifies the Clerk **session server-side** (`/v1/sessions/{id}/verify`) and
    derives the user id from Clerk - no longer trusts a client-provided user id.
  - A signed-in user can only update **their own** role; unauthenticated /
    invalid-session requests return `401`; invalid roles return `400`.
  - Missing `CLERK_SECRET_KEY` -> safe setup error (`503`); secret never
    exposed or returned; no stack traces / provider errors leaked.
  - Client `setRole` sends the Clerk session id + token; localStorage role is
    now a clearly-documented **temporary dev fallback only**.
- **Docs**: `docs/CLERK_AUTH.md` updated (session-verified model, Netlify env
  vars, Clerk dashboard allowed-origin/redirect checklist, test->live switch).
- Still on TEST keys pending end-to-end verification.


### Sprint 8.2 (Clerk Authentication + Hero Roadie Fix)
- **Clerk browser auth** (`assets/js/clerk-auth.js`, loaded via `integrations.js`)
  - `window.AIMCAuth` helper: init, isSignedIn, getUser, getRole, signIn,
    signUp, signOut, requireAuth, setRole, redirectAfterAuth.
  - Loads Clerk once (guarded); TEST publishable key; no secret in frontend.
  - Nav auth state: hides Sign In/Join when signed in, injects role-aware link
    (My Studio / Fan Space / Creator Space / Admin) + Clerk user button.
  - Join role-choice modal (Artist / Fan / Creator, Admin if enabled).
  - Sign-in + sign-up flows with role-based redirects and returnTo handling.
  - Protected routes: artist-studio, artist-onboarding, exhibit-builder,
    fan-dashboard, creator-dashboard, admin (graceful wrong-role screen).
  - GA + Loop events: user/artist/fan/creator signup & login, logout,
    auth_role_selected, auth_required_redirect, auth_wrong_role.
- **Server function** `netlify/functions/clerk-set-role.js` (POST-only, reads
  `CLERK_SECRET_KEY` from env, validates role, PATCHes Clerk public_metadata,
  never leaks secrets/provider errors).
- **Roadie auth context**: `roadie.js` sends `auth` (user id, first name, role,
  signed-in) in chat payload and prefers the Clerk role.
- **Hero Roadie slide fix**: `.hero-slide--roadie` scoped CSS shows the full
  cinematic composition (contain + object-position + reduced scale, no Ken Burns);
  new image `hero-roadie-spotlight-v2.jpg`. Other slides unchanged, no CLS.
- **Env**: `.env.example` set to TEST Clerk publishable key +
  `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`; `CLERK_SECRET_KEY` blank for Netlify.
- **Docs**: `docs/CLERK_AUTH.md` (setup, roles, routes, redirects, prod checklist).


### Sprint 4 (Product Maturity)
- **Artist Onboarding Wizard** (`/pages/artist-onboarding.html`, `assets/js/onboarding.js`)
  - 8 steps: Welcome, Art Form, City, Upload, Bio (AI), SEO (AI), Preview, Publish
  - Progress indicator + bar, per-step animation, localStorage persistence
  - Roadie-guided greetings, multi-select art forms, device preview tabs (Desktop/Tablet/Mobile)
  - Confetti celebration, publish placeholders (GitHub / Netlify / Loop / IndexNow / Google)
- **My Studio terminology** across `/dashboard/artist-studio.html`
  - Left nav: My Studio, My Exhibit, Gallery, Music, Videos, Events, Bookings, Store, Audience, Insights, Roadie AI, Settings, Publish
  - No remaining "Dashboard" wording
- **Exhibit Builder** (`/pages/exhibit-builder.html`, `assets/js/exhibit-builder.js`)
  - Drag-and-drop reorder, move up/down, hide/show, restore tray
  - 12 sections, all with "This section is ready for your work." empty state
  - Order + hidden state persisted to localStorage
- **Fan Space** (`/dashboard/fan-dashboard.html`)
  - 10 sections: Following, Saved Exhibits, Favorite Cities, Upcoming Events, Tickets (placeholder), Orders (placeholder), Notifications, Messages, Settings, Profile
  - Beautiful empty states, avatar upload placeholder (Cloudinary)
- **Insights** (`/dashboard/analytics.html`) - Spotify-Wrapped inspired
  - 11 metric cards + "Your Year, Wrapped" panel, all beautiful empty states
- **Search Experience** (`assets/js/experience.js`)
  - Spotify-style dropdown: Trending Cities, Trending Categories, Featured Art Forms, Roadie's Picks, Recent Searches (placeholder), Popular Exhibits (placeholder)
  - Keyboard navigation (arrows / enter / escape)
- **Roadie as platform layer** (`assets/js/experience.js`)
  - Contextual toasts via `data-roadie-say`, natural voice, never robotic
  - Existing contextual widget greetings retained (public / city / events / dashboard / discover)
- **Live Platform Feel** - homepage "Preview Activity" ticker (clearly labeled Demo, no fabricated people)
- **City Experience** - all 18 city pages gained: Roadie's Picks, Creative Neighborhoods, Public Art Map (placeholder), Gallery Map (placeholder), and a Local Creative Guide (Music Venues, Art Supply Stores, Studios, Photography Rentals, Coworking, Coffee Shops, Frame Shops). Each labeled "Opening with our first local artists." Real categories, no fabricated listings.
- **EMG LOOP Event Layer** (`assets/js/loop-events.js`)
  - Documented hooks for all 18 events (see below), wraps existing `window.aimcTrack`
  - `data-loop` auto-wiring; `window.AIMCLoop` API

### Loop events wired (placeholders)
artist_onboarding_started, artist_onboarding_completed, artist_uploaded_media,
artist_generated_bio, artist_generated_seo, artist_previewed, artist_published,
fan_registered, fan_followed_artist, fan_saved_exhibit, roadie_chat_started,
roadie_message_sent, event_search, city_view, gallery_view, booking_request,
merch_click, ticket_click

### Carried from earlier sprints
- Cinematic homepage hero + 6-slide carousel
- 18 tourism-board city pages
- Discover masonry, premium Events, emotional About, premium blank Artist Exhibit
- Roadie personality (contextual greetings, idle nudge), footer "Built with love in the USA"

---

## Sprint 5 (Analytics + IndexNow) - 2026-07-07

Infrastructure sprint. No UI changes, no layout changes, no redesign.

- [x] Google Analytics Installed (GA4 measurement ID G-HPSSBYPFLP)
- [x] Custom Events Created (trackEvent utility + named helpers)
- [x] IndexNow Service Added (services/indexnow.ts + Netlify function)
- [x] Verification File Added (root key .txt returns the key)
- [x] Robots Verified (allow all + sitemap reference)
- [x] Sitemap Verified (added onboarding + exhibit builder; 68 URLs)

Implementation notes:
- GA4 loads once site-wide via the shared assets/js/analytics.js utility.
  It self-guards against duplicate installs and duplicate gtag.js requests.
- analytics.js is loaded on every page through the shared integrations.js
  loader; the two pages without integrations.js reference it directly.
- All raw gtag() calls are centralized behind AIMC.trackEvent(name, params).
- IndexNow key is read from environment variables only and never shipped to
  the browser. Publish hooks are stubbed (disabled) until the backend is live.

## Sprint 5 (v3.0 - Artist Intelligence + Personalization) - 2026-07-07

Intelligence + personalization foundation. No redesign, no route changes.

Completed:
- [x] Roadie Memory system (assets/js/roadie-memory.js, localStorage)
- [x] Exhibit Theme Builder (6 curated themes, persists, previews)
- [x] Digital Exhibit language pass (Exhibit / My Studio terminology)
- [x] Collections UI (create/edit/preview/reorder, localStorage)
- [x] Media Intelligence placeholders (Roadie suggestions + action buttons)
- [x] Fan Personalization foundation (8 personalized sections, empty states)
- [x] Audience Timeline component (reusable, local events)
- [x] Recommendation engine placeholder (assets/js/recommendations.js)
- [x] Notification Center (nav bell, panel, localStorage, empty state)
- [x] Universal Command Palette (Ctrl/Cmd+K and '/', keyboard nav)
- [x] Component consolidation (window.AIMCComponents render helpers)
- [x] Loop event expansion (17 new events + AIMCLoop.track alias)
- [x] Docs: ROADIE_MEMORY, DIGITAL_EXHIBIT_THEMES, RECOMMENDATION_ENGINE,
      COMMAND_PALETTE, LOOP_EVENTS

Also (cleanup this cycle):
- [x] Removed placeholder-indexnow-key.txt (unreferenced)
- [x] Removed redundant direct GA tags; GA now loads once via shared loader

Architecture notes:
- New shared script assets/js/sprint5.js loads site-wide through the
  integrations.js loader (with roadie-memory.js + recommendations.js), same
  pattern as analytics.js. The two pages without integrations.js reference them
  directly. sprint5.js self-guards against double init.
- Everything uses localStorage/placeholders; interfaces are shaped so Neon,
  Clerk, Claude, and EMG LOOP can replace placeholders without API changes.

## Sprint 6 (v3.5 - Artist Success System) - 2026-07-07

Artist Success System complete. Turns the platform into a creative operating
system focused on Digital Exhibit success. All placeholders + localStorage today;
clean interfaces for Neon + EMG LOOP later. See `docs/ARTIST_SUCCESS_SYSTEM.md`.

- **Digital Exhibit Score** (Task 1): weighted score (Needs Work / Good Start /
  Almost Ready / Roadie Approved) with per-section breakdown + Roadie recommendation.
- **Artist Success Checklist** (Task 2): 11-step launch checklist, launch %, Roadie encouragement.
- **Founding Artist Program** (Task 3): ribbon + badge + certificate placeholder.
- **Artist Badge System** (Task 4): reusable badge chips (Founding, Verified, Featured,
  Roadie's Pick, Community Favorite, Emerging, Exhibit of the Week).
- **Roadie Weekly Report** (Task 5): placeholder metric cards + empty state + advice.
- **Artist Goals** (Task 6): 8 goals; Roadie coaching adapts; persisted.
- **Exhibit Sharing** (Task 7): Copy/Share/QR/Download QR/OG preview (placeholders).
- **Link Hub** (Task 8): Listen/Watch/Visit/Book/Support/Donate/Website/Social + empty states.
- **Media Organizer** (Task 9): suggested buckets + placeholder Roadie suggestions (no real AI).
- **Visitor Journey** (Task 10): placeholder Loop events, mirrored to GA helper.
- **Artist Success Dashboard** (Task 11): unified overview card.
- **Docs** (Tasks 12-13): `ARTIST_SUCCESS_SYSTEM.md` added; this file bumped to v3.5.

New files: `assets/js/artist-success.js`, `docs/ARTIST_SUCCESS_SYSTEM.md`.
Modified: `assets/css/styles.css` (s6- styles), `assets/js/integrations.js`
(SPRINT6_LOADER), `dashboard/artist-studio.html` + `pages/exhibit-builder.html` (mounts).
Guard: `window.__AIMC_SUCCESS__`; loader guard `data-aimc-success`. No duplicate CSS/JS.

## Sprint 7 (v4.0 - The Digital Exhibit Experience) - 2026-07-07

The Digital Exhibit Experience complete. Makes the platform feel like a premium
digital museum \u2014 no redesign, no new routes. See `docs/DIGITAL_EXHIBIT_PLATFORM.md`.
All placeholders + localStorage today; clean interfaces for Claude + Neon + EMG LOOP.

- **Digital Exhibit Designer** (Task 1): section show/hide/move/duplicate + live
  preview panel (desktop/tablet/mobile); order persists locally.
- **Premium Exhibit Themes** (Task 2): six complete theme experiences with instant
  preview + Roadie recommendation.
- **Roadie Design Mode** (Task 3): recommendation cards (Apply/Preview/Ignore/Save).
- **Public Digital Exhibit Experience** (Task 4): gallery-like presentation, breathing layout.
- **Collection Experience** (Task 5): collections as miniature exhibits + empty states.
- **Roadie Exhibit Review** (Task 6): 11-category placeholder review.
- **Exhibit Story Mode** (Task 7): Introduction / Inspiration / Process / Behind The Work / Final Thoughts.
- **Visitor Experience** (Task 8): Continue Exploring, Related, Nearby, Picks, Recently Viewed, Save/Follow/Share/QR.
- **Roadie Creative Insights** (Task 9): clearly-marked preview cards, no fabricated analytics.
- **Micro-interactions** (Task 10): elegant transitions using existing tokens; respects reduced-motion.
- **Component library** (Task 11): shared exhibit/collection/suggestion/insight/theme/story/share/QR helpers.
- **Loop events** (Task 12): 12 new placeholder events mirrored to GA.
- **Docs** (Task 13): `DIGITAL_EXHIBIT_PLATFORM.md` added; this file bumped to v4.0.

New files: `assets/js/exhibit-experience.js`, `docs/DIGITAL_EXHIBIT_PLATFORM.md`.
Modified: `assets/css/styles.css` (s7- styles), `assets/js/integrations.js`
(SPRINT7_LOADER), `dashboard/artist-studio.html`, `pages/exhibit-builder.html`,
`pages/artist-coming-soon.html` (mounts). Guard: `window.__AIMC_EXPERIENCE__`;
loader guard `data-aimc-experience`. No duplicate CSS/JS/HTML.

## Outstanding Features
- Wire real Roadie character art (2 approved PNGs) into avatar; currently gradient "R" + TODO
- Extend `experience.js` search + Roadie toasts to remaining secondary pages (categories, cities index, legal, creators)
- Google Places autocomplete for onboarding City step (placeholder field ready)
- Cloudinary upload wiring (upload zones present, no API)
- Claude bio + SEO generation (buttons present, placeholder only)

## Known Issues
- CDN (Netlify) cache can lag a few minutes after a CSS/HTML commit before new styles appear.
- Studio/fan/insights pages sit behind auth; verify final render when authenticated.

## Technical Debt
- Repeated boilerplate (header/footer) across static pages; consider a build-time include/partial system.
- Loop events are client-only; server dispatch to be added with EMG LOOP webhook.
- `app.js` / `roadie.js` are large; consider modularizing.

## Next Sprint (do NOT build yet)
Deferred by explicit instruction until artists can create complete exhibits:
Marketplace, Commissions, Print Sales, Physical Shop, Auction System, Subscriptions.

---

## Integrations status (placeholders, no keys committed)
| Service   | Purpose            | Status      |
|-----------|--------------------|-------------|
| Neon      | Database           | Placeholder |
| Clerk     | Auth               | Placeholder |
| Claude    | AI (bio/SEO)       | Placeholder (server-side only) |
| Stripe    | Payments           | Placeholder |
| Cloudinary| Media uploads      | Placeholder |
| EMG LOOP  | Event network      | Placeholder (hooks wired) |
| Netlify   | Hosting / deploy   | Live        |
| GitHub    | Source / commits   | Live        |

## Guardrails respected
- No fake artists, no fake events.
- No exposed API keys; CLAUDE_API_KEY stays server-side.
- No Supabase.
- All placeholders clearly marked.
- Existing dark premium design language (Spotify x Apple x MoMA) preserved.
- Terminology: Exhibit / Studio / Gallery / Collection - not "Profile".

## Sprint 8: Live Roadie + Google Maps (COMPLETE)

- Roadie now answers real questions through Anthropic via `netlify/functions/roadie-chat.js`.
- Google Places autocomplete via `netlify/functions/maps-autocomplete.js`.
- Google Places local creative search via `netlify/functions/maps-creative-search.js`.
- Roadie widget (`assets/js/roadie.js`) wired to the live endpoint with typing state, fallback, and analytics events.
- `assets/js/app.js` exposes `window.MapsLive`, mounts the city creative guide, the events venue finder, and city/ZIP search autocomplete.
- Keys are server-side only (`ANTHROPIC_API_KEY`, `GOOGLE_MAPS_API_KEY`); nothing exposed in the browser.
- Docs: `ROADIE_LIVE_API.md`, `GOOGLE_MAPS_INTEGRATION.md`, `API_INTEGRATIONS.md`.

### Known limitations

- Live results require the Netlify env vars to be set; without them, functions return friendly preview responses.
- No client-side map rendering yet (results link out to Google Maps).
- Rate limiting is light (validation + size caps); a per-IP throttle can be added later.

### Future integrations

- Ticketmaster / Eventbrite / Bandsintown for live event listings.
- Optional embedded map view and place details.

