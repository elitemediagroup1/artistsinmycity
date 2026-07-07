# EMG LOOP Events

## Purpose
A single, documented catalog of placeholder behavioral events dispatched across
the platform. These are clean hooks now; when EMG LOOP is connected they carry
real behavioral intelligence. Every event also mirrors to GA4 via the analytics
utility.

## Current placeholder behavior
- Base layer: `assets/js/loop-events.js` defines the canonical event registry
  and `window.AIMCLoop`. Sprint 5 adds `AIMCLoop.track(name, payload)` plus
  camelCase helpers, and mirrors every emit to `AIMC.trackEvent` (GA4).
- No backend required. No network dependency. No keys. Safe if GA is absent.
- Call pattern: `window.AIMCLoop.track('event_name', { any: 'payload' })`.

## Events

### Sprint 4 (existing)
artist_onboarding_started, artist_onboarding_completed, artist_uploaded_media,
artist_generated_bio, artist_generated_seo, artist_previewed, artist_published,
fan_registered, fan_followed_artist, fan_saved_exhibit, roadie_chat_started,
roadie_message_sent, event_search, city_view, gallery_view, booking_request,
merch_click, ticket_click.

### Sprint 5 (added this sprint)
roadie_memory_updated, roadie_preference_saved, artist_theme_changed,
collection_created, collection_updated, collection_previewed,
collection_reordered, media_alt_text_requested, media_caption_requested,
media_cover_suggested, fan_interest_saved, fan_home_personalized,
timeline_event_added, recommendation_viewed, notification_opened,
command_palette_opened, command_palette_action_selected.

## Future backend behavior
When EMG LOOP is live, `AIMCLoop.emit`/`track` will forward to the Loop webhook
(`netlify/functions/loop-webhook.js`) with no key exposed to the frontend.
Events drive recommendations, insights, and notifications.

## Acceptance criteria
- Events are documented (this file).
- Events fire without console errors.
- No network dependency.
