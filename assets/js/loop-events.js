/*
 * ArtistsInMyCity - EMG LOOP Event Layer (placeholder)
 * --------------------------------------------------------------
 * Central, documented list of Loop events dispatched across the
 * platform. This wraps the existing window.aimcTrack() placeholder.
 * NO backend implementation - these are clean hooks only.
 * When EMG LOOP is connected, aimcTrack() will forward to the
 * Loop webhook (netlify/functions/loop-webhook). No keys here.
 */
(function (w) {
  'use strict';

  // Canonical list of Loop events (Sprint 4, Task 10).
  var LOOP_EVENTS = {
    ARTIST_ONBOARDING_STARTED:   'artist_onboarding_started',
    ARTIST_ONBOARDING_COMPLETED: 'artist_onboarding_completed',
    ARTIST_UPLOADED_MEDIA:       'artist_uploaded_media',
    ARTIST_GENERATED_BIO:        'artist_generated_bio',
    ARTIST_GENERATED_SEO:        'artist_generated_seo',
    ARTIST_PREVIEWED:            'artist_previewed',
    ARTIST_PUBLISHED:            'artist_published',
    FAN_REGISTERED:              'fan_registered',
    FAN_FOLLOWED_ARTIST:         'fan_followed_artist',
    FAN_SAVED_EXHIBIT:           'fan_saved_exhibit',
    ROADIE_CHAT_STARTED:         'roadie_chat_started',
    ROADIE_MESSAGE_SENT:         'roadie_message_sent',
    EVENT_SEARCH:                'event_search',
    CITY_VIEW:                   'city_view',
    GALLERY_VIEW:                'gallery_view',
    BOOKING_REQUEST:             'booking_request',
    MERCH_CLICK:                 'merch_click',
    TICKET_CLICK:                'ticket_click'
  };

  /**
   * Dispatch a Loop event. Safe no-op until Loop is connected.
   * @param {string} eventName - one of LOOP_EVENTS values
   * @param {object} [payload] - structured, non-sensitive data
   */
  function loopEvent(eventName, payload) {
    payload = payload || {};
    var envelope = {
      source: 'aimc-web',
      event: eventName,
      ts: new Date().toISOString(),
      path: (w.location && w.location.pathname) || '',
      data: payload
    };
    // Forward to the existing analytics placeholder if present.
    if (typeof w.aimcTrack === 'function') {
      try { w.aimcTrack(eventName, envelope); } catch (e) {}
    } else {
      console.log('[LOOP placeholder]', eventName, envelope);
    }
    // Local trace buffer for debugging / future flush to Loop.
    (w.__aimcLoopQueue = w.__aimcLoopQueue || []).push(envelope);
    return envelope;
  }

  // Convenience helpers for the most common actions.
  var Loop = {
    events: LOOP_EVENTS,
    emit: loopEvent,
    onboardingStarted:   function (d) { return loopEvent(LOOP_EVENTS.ARTIST_ONBOARDING_STARTED, d); },
    onboardingCompleted: function (d) { return loopEvent(LOOP_EVENTS.ARTIST_ONBOARDING_COMPLETED, d); },
    uploadedMedia:       function (d) { return loopEvent(LOOP_EVENTS.ARTIST_UPLOADED_MEDIA, d); },
    generatedBio:        function (d) { return loopEvent(LOOP_EVENTS.ARTIST_GENERATED_BIO, d); },
    generatedSeo:        function (d) { return loopEvent(LOOP_EVENTS.ARTIST_GENERATED_SEO, d); },
    previewed:           function (d) { return loopEvent(LOOP_EVENTS.ARTIST_PREVIEWED, d); },
    published:           function (d) { return loopEvent(LOOP_EVENTS.ARTIST_PUBLISHED, d); },
    fanRegistered:       function (d) { return loopEvent(LOOP_EVENTS.FAN_REGISTERED, d); },
    fanFollowed:         function (d) { return loopEvent(LOOP_EVENTS.FAN_FOLLOWED_ARTIST, d); },
    fanSaved:            function (d) { return loopEvent(LOOP_EVENTS.FAN_SAVED_EXHIBIT, d); },
    roadieChatStarted:   function (d) { return loopEvent(LOOP_EVENTS.ROADIE_CHAT_STARTED, d); },
    roadieMessageSent:   function (d) { return loopEvent(LOOP_EVENTS.ROADIE_MESSAGE_SENT, d); },
    eventSearch:         function (d) { return loopEvent(LOOP_EVENTS.EVENT_SEARCH, d); },
    cityView:            function (d) { return loopEvent(LOOP_EVENTS.CITY_VIEW, d); },
    galleryView:         function (d) { return loopEvent(LOOP_EVENTS.GALLERY_VIEW, d); },
    bookingRequest:      function (d) { return loopEvent(LOOP_EVENTS.BOOKING_REQUEST, d); },
    merchClick:          function (d) { return loopEvent(LOOP_EVENTS.MERCH_CLICK, d); },
    ticketClick:         function (d) { return loopEvent(LOOP_EVENTS.TICKET_CLICK, d); }
  };

  w.AIMCLoop = Loop;

  // Auto-wire generic hooks via data attributes: data-loop="event_name"
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-loop]').forEach(function (el) {
      el.addEventListener('click', function () {
        loopEvent(el.getAttribute('data-loop'), { label: el.getAttribute('data-loop-label') || el.textContent.trim().slice(0, 60) });
      });
    });
    // City pages auto-emit a city_view event.
    var cityMeta = document.querySelector('[data-city]');
    if (cityMeta) { Loop.cityView({ city: cityMeta.getAttribute('data-city') }); }
  });
})(window);


/* SPRINT5_LOOP_EXTENSION */
/*
 * Sprint 5 (v3.0) Loop event expansion.
 * Additive only: registers new placeholder event names, exposes a track()
 * alias, adds named helpers, and mirrors every Loop emit to GA4 via
 * AIMC.trackEvent when the analytics utility is present. No backend needed.
 */
(function (window) {
  'use strict';
  var Loop = window.AIMCLoop = window.AIMCLoop || {};

  var NEW_EVENTS = [
    'roadie_memory_updated',
    'roadie_preference_saved',
    'artist_theme_changed',
    'collection_created',
    'collection_updated',
    'collection_previewed',
    'collection_reordered',
    'media_alt_text_requested',
    'media_caption_requested',
    'media_cover_suggested',
    'fan_interest_saved',
    'fan_home_personalized',
    'timeline_event_added',
    'recommendation_viewed',
    'notification_opened',
    'command_palette_opened',
    'command_palette_action_selected'
  ];

  // Register new event names on the events registry, if present.
  try {
    Loop.events = Loop.events || {};
    NEW_EVENTS.forEach(function (n) {
      if (typeof Loop.events[n] === 'undefined') { Loop.events[n] = n; }
    });
  } catch (e) {}

  // Core emit that never throws. Prefer the existing emit; otherwise fall back
  // to aimcTrack. Always mirror to GA4 through the analytics utility.
  function loopTrack(name, payload) {
    if (!name) { return; }
    payload = payload || {};
    try {
      if (typeof Loop.emit === 'function') { Loop.emit(name, payload); }
      else if (typeof window.aimcTrack === 'function') { window.aimcTrack(name, payload); }
    } catch (e) {}
    // Mirror to GA (analytics.js has its own guard; safe if absent).
    try {
      if (window.AIMC && typeof window.AIMC.trackEvent === 'function') {
        window.AIMC.trackEvent(name, payload);
      }
    } catch (e) {}
  }

  // Public track() alias required by the Sprint 5 spec.
  if (typeof Loop.track !== 'function') { Loop.track = loopTrack; }

  // Named helpers (camelCase) for the new events.
  var helpers = {
    roadieMemoryUpdated:        function (p) { loopTrack('roadie_memory_updated', p); },
    roadiePreferenceSaved:      function (p) { loopTrack('roadie_preference_saved', p); },
    artistThemeChanged:         function (p) { loopTrack('artist_theme_changed', p); },
    collectionCreated:          function (p) { loopTrack('collection_created', p); },
    collectionUpdated:          function (p) { loopTrack('collection_updated', p); },
    collectionPreviewed:        function (p) { loopTrack('collection_previewed', p); },
    collectionReordered:        function (p) { loopTrack('collection_reordered', p); },
    mediaAltTextRequested:      function (p) { loopTrack('media_alt_text_requested', p); },
    mediaCaptionRequested:      function (p) { loopTrack('media_caption_requested', p); },
    mediaCoverSuggested:        function (p) { loopTrack('media_cover_suggested', p); },
    fanInterestSaved:           function (p) { loopTrack('fan_interest_saved', p); },
    fanHomePersonalized:        function (p) { loopTrack('fan_home_personalized', p); },
    timelineEventAdded:         function (p) { loopTrack('timeline_event_added', p); },
    recommendationViewed:       function (p) { loopTrack('recommendation_viewed', p); },
    notificationOpened:         function (p) { loopTrack('notification_opened', p); },
    commandPaletteOpened:       function (p) { loopTrack('command_palette_opened', p); },
    commandPaletteActionSelected: function (p) { loopTrack('command_palette_action_selected', p); }
  };
  Object.keys(helpers).forEach(function (k) {
    if (typeof Loop[k] !== 'function') { Loop[k] = helpers[k]; }
  });

})(window);
