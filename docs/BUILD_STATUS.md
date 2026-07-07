# ArtistsInMyCity - Build Status

**Current Version:** v2.0 (Sprint 4 - Product Maturity)
**Last Updated:2026-07-07
**Date:** 2026-07-07

This file is mandatory after every sprint. It records what is done, what
remains, and the technical state of the platform.

---

## Completed Features

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
