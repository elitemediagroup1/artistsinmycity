# Artist Success System (Sprint 6 — v3.5)

## Purpose
The Artist Success System turns ArtistsInMyCity from a directory into a creative
operating system. Its single job is to help every artist build an incredible
Digital Exhibit and *feel* successful using the platform. Every feature answers
one question: **"Does this help an artist succeed?"**

## Philosophy
- Measure progress, give direction, celebrate milestones, reward completion.
- Roadie acts as a creative coach, not just a chatbot.
- Everything works today with `localStorage` + placeholders.
- Clean interfaces so **Neon** (database) and **EMG LOOP** (intelligence) can
  replace local implementations later **without breaking the public API**.
- No commerce, marketplace, auctions, or subscriptions in this sprint.

## Files
- `assets/js/artist-success.js` — all logic + renderers (guarded IIFE, `window.__AIMC_SUCCESS__`).
- `assets/css/styles.css` — appended `s6-` styles (reuses the existing dark palette + `s5-` tokens).
- `assets/js/integrations.js` — `SPRINT6_LOADER` injects `artist-success.js` site-wide (guard `data-aimc-success`).
- Mount points: `dashboard/artist-studio.html` (My Studio) and `pages/exhibit-builder.html` (public preview).

## Public API
```
window.AIMCSuccess = {
  ExhibitScore,        // { compute(), sections }
  badges,              // badge definitions
  checklist,           // checklist item definitions
  goals,               // goal definitions
  visitorJourney,      // { track(key, payload), events }
  render,              // map of renderer functions by mount name
  remount()            // re-render all [data-sprint6] mounts
};
window.ExhibitScore.compute();   // -> { score, band, breakdown }
window.AIMCBadges.chip(key);     // -> badge HTML
window.AIMCVisitorJourney.track('gallery');
```

### Mount points
Add an element with `data-sprint6="<name>"` and the module renders into it on load.
Names: `dashboard`, `score`, `checklist`, `founding`, `badges`, `weekly`, `goals`,
`sharing`, `linkhub`, `media-organizer`.

## Digital Exhibit Score (Task 1)
A weighted, reusable score computed from currently-available signals.

| Range | Status |
| ----- | ------ |
| 0–39   | Needs Work |
| 40–69  | Good Start |
| 70–89  | Almost Ready |
| 90–100 | Roadie Approved |

Sections scored: Hero Image, Artist Statement, Gallery, Videos, Music, Collections,
SEO, AEO, Accessibility, Bookings, Events, Store, Social Links. Each is reported as
**Complete**, **Needs Attention**, or **Missing**. Roadie surfaces the next best
action (e.g. *"Adding a booking section could improve discoverability."*).

**Placeholder today:** signals read from `RoadieMemory` + local checklist/collections.
**Future:** `ExhibitScore.compute()` is replaced by EMG LOOP scoring returning the same shape.

## Artist Success Checklist (Task 2)
An 11-step launch checklist persisted in `aimc.success.checklist.v1`: Upload Cover,
Upload Profile Photo, Write Artist Statement, Create First Collection, Upload First
Artwork, Connect Social Links, Choose Exhibit Theme, Generate SEO, Generate AEO,
Preview Exhibit, Publish Exhibit. Shows launch % + Roadie encouragement (e.g.
*"You're only one step away from publishing."*).

## Founding Artist Program (Task 3)
Placeholder ribbon + badge + certificate placeholder + Roadie congratulation for
early artists. Future: gated by join date in Neon.

## Artist Badge System (Task 4)
Reusable badge chips with icon, color, tooltip, and description:
Founding Artist, Verified Artist, Featured Artist, Roadie's Pick, Community Favorite,
Emerging Artist, Exhibit of the Week. Rendered via `AIMCBadges.chip(key)`.

## Roadie Weekly Report (Task 5)
Placeholder metric cards (Visitors, Followers, Views, Collections, Searches, Cities
Reached, Exhibit Score Change) with Roadie advice and a premium empty state when
there is no activity yet.

## Artist Goals (Task 6)
Artists select goals (Get More Bookings, Sell Artwork, Grow Audience, Land Gallery
Shows, Build Brand, Teach Classes, Find Collaborators, Get Brand Deals). Roadie's
recommendation adapts to the selection. Persisted in `aimc.success.goals.v1`;
fires `artist_goal_selected`.

## Roadie Coaching
Roadie appears throughout (score recommendation, checklist encouragement, weekly
advice, goal-based tips, media suggestions) using the existing `AIMCComponents.roadiePrompt`.

## Sharing, Link Hub, Media Organizer, Visitor Journey (Tasks 7–10)
- **Exhibit Sharing:** Copy Link, Share, QR Code, Download QR, Open Graph Preview (placeholders).
- **Link Hub:** Listen, Watch, Visit, Book, Support, Donate, Website, Social with empty states.
- **Media Organizer:** suggested buckets (Featured, Behind the Scenes, Studio, Collections,
  Events, Videos, Favorites) with placeholder Roadie suggestions (no real AI).
- **Visitor Journey:** placeholder Loop events — visited, scrolled 100%, viewed gallery,
  played music, watched video, clicked booking, saved, shared, QR scanned. Mirrored to GA
  via `AIMCLoop.track`.

## Artist Success Dashboard (Task 11)
One unified card (`data-sprint6="dashboard"`) composing Score, Launch Progress,
Roadie Recommendation, Weekly Summary, Goals, and Recent Activity.

## Loop / GA events
`exhibit_score_viewed`, `success_checklist_updated`, `artist_goal_selected`,
`exhibit_share_action`, `link_hub_updated`, `media_organizer_viewed`,
`roadie_weekly_report_viewed`, `artist_success_dashboard_viewed`, plus the
`visitor_*` journey events. All routed through `AIMCLoop.track(name, payload)`,
which mirrors to the GA helper. No network dependency; safe if a dependency is absent.

## Future EMG LOOP + Neon Integration
- Replace `readSignals()` / `ExhibitScore.compute()` with real completeness + LOOP scoring.
- Replace `localStorage` keys (`aimc.success.*`) with Neon-backed reads/writes.
- Weekly report metrics come from real analytics instead of placeholders.
- Founding Artist status gated by verified join date.

## Acceptance Tests
- No console errors; renders on desktop, tablet, mobile.
- Existing Roadie, onboarding, My Studio, command palette, notification center,
  analytics, and Loop events continue to work.
- No duplicate components or CSS; existing design language preserved.
- No fake artists, no fake events, no exposed secrets, no Supabase.
- Checklist + goals persist across refresh.
- Build passes and the deploy preview is green.
