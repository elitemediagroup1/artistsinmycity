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
