# The Digital Exhibit Platform (Sprint 7 — v4.0)

## Vision
ArtistsInMyCity is a premium digital museum where every artist owns their own
exhibition space. The goal of Sprint 7 is that an artist who lands on the site
immediately thinks: *"I want THIS to be my website."* Roadie is the curator, the
artist is the creator, and the visitor is the guest. This sprint adds no new
pages and changes no routes \u2014 it deepens the experience.

## Digital Exhibit philosophy
Artists do not have profiles \u2014 they have Digital Exhibits. Visitors do not
browse profiles \u2014 they walk through exhibits. Every interaction reinforces the
feeling of a curated exhibition rather than a directory or social network.

## Roadie Design philosophy
Roadie is the Creative Director. In Design Mode Roadie offers recommendation cards
(Apply, Preview, Ignore, Save For Later) and in the Exhibit Review it grades the
exhibit across eleven categories. All placeholder logic today; Claude powers the
real recommendations later \u2014 the interfaces stay the same.

## Collection philosophy
Each collection is a miniature exhibit with its own hero, description, cover,
gallery, story, and related collections. Beautiful empty states, never fake artwork.

## Theme philosophy
Six premium themes, each a complete experience: Gallery (museum), Luxury (dark
velvet + gold), Photography (edge-to-edge imagery), Music (concert + player +
timeline), Street (bold, layered), and Minimal (calm, editorial). Selecting a theme
updates the preview instantly and Roadie explains why a theme fits the work.

## Story Mode
Artists add narrative between collections \u2014 Introduction, Inspiration, Process,
Behind The Work, Final Thoughts \u2014 so visitors feel like they are walking through
a story. Persisted in `aimc.exhibit.story.v1`.

## Files & API
- `assets/js/exhibit-experience.js` \u2014 all logic + renderers (guarded IIFE, `window.__AIMC_EXPERIENCE__`).
- `assets/css/styles.css` \u2014 appended `s7-` styles (reuse dark palette + s5-/s6- tokens).
- `assets/js/integrations.js` \u2014 `SPRINT7_LOADER` injects the module site-wide (guard `data-aimc-experience`).
- Mounts: `dashboard/artist-studio.html` (My Studio), `pages/exhibit-builder.html`, `pages/artist-coming-soon.html` (public exhibit).

```
window.AIMCExhibit = {
  components,      // exhibitCard, collectionCard, suggestion, insight, themeCard, storyBlock, sharePanel, qrPanel, scoreCard
  themes, reviewCats,
  getSections(), currentTheme(),
  render,          // renderer map by mount name
  remount()        // re-render all [data-sprint7] mounts
};
```

### Mount names (`data-sprint7="<name>"`)
`designer`, `themes`, `design-mode`, `public-exhibit`, `collections`, `review`,
`story`, `visitor`, `insights`.

## Component library (Task 11)
Reusable, deduplicated render helpers: Digital Exhibit Card, Collection Card,
Roadie Suggestion, Roadie Insight, Theme Card, Exhibit Score Card (delegates to
Sprint 6), Story Block, Share Panel, QR Panel. No duplicate HTML/CSS/JS.

## Loop events (Task 12)
`exhibit_section_reordered`, `theme_previewed`, `theme_selected`,
`roadie_design_suggestion`, `roadie_suggestion_applied`, `roadie_suggestion_ignored`,
`collection_story_added`, `collection_opened`, `qr_generated`, `share_panel_opened`,
`story_mode_opened`, `exhibit_review_opened`. All routed through
`AIMCLoop.track(name, payload)` which mirrors to the GA helper. No network dependency.

## Future AI integration
Roadie Design Mode, Exhibit Review, and Creative Insights are placeholder-only
today. Claude (server-side) will generate real recommendations, review grades, and
insights behind the identical `AIMCExhibit` interfaces.

## Future Neon integration
Section order, theme, story text, suggestion state, and recently-viewed are stored
in `localStorage` (`aimc.exhibit.*`) today. Neon replaces these with per-artist and
per-visitor persistence without changing the public API.

## Acceptance tests
- Existing homepage, onboarding, My Studio, Roadie, search, command palette,
  notification center, analytics, Loop events, and themes all unchanged.
- Exhibit Designer works (show/hide/move, live preview updates, order persists).
- Theme previews + selection update immediately and persist.
- Roadie Design Mode, Exhibit Review, and Story Mode work.
- Responsive on desktop, tablet, and mobile.
- No console errors; no duplicate CSS/JS/HTML; no fake artists or events; no secrets.
- Build passes and deploy preview is green.
