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

/* SPRINT10_LOOP_WEBHOOK_PIPELINE */
/*
 * Sprint 10: send Loop events server-side to the EMG LOOP webhook via
 * the Netlify function loop-event. LOOP stores events in Neon. No Neon
 * credentials or webhook secrets ever touch the browser. Additive only:
 * wraps the existing track()/emit() so GA and local behavior are kept,
 * and adds a localStorage queue with retry-on-load for failed sends.
 */
(function (window) {
  "use strict";
  if (!window.AIMCLoop) { return; }
  if (window.__AIMC_LOOP_PIPELINE__) { return; }
  window.__AIMC_LOOP_PIPELINE__ = true;

  var Loop = window.AIMCLoop;
  var ENDPOINT = ["/.netlify", "/functions", "/loop-event"].join("");
  var QUEUE_KEY = "aimc.loop.queue";
  var ANON_KEY = "aimc.anon_id";
  var MAX_QUEUE = 200;

  // ---- storage helpers ----
  function lsGet(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { window.localStorage.setItem(k, v); } catch (e) {} }

  function anonId() {
    var id = lsGet(ANON_KEY);
    if (id) { return id; }
    try {
      id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID()
        : ("anon_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10));
    } catch (e) { id = "anon_" + Date.now(); }
    lsSet(ANON_KEY, id);
    return id;
  }

  function newEventId() {
    try {
      if (window.crypto && window.crypto.randomUUID) { return window.crypto.randomUUID(); }
    } catch (e) {}
    return "evt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10);
  }

  // ---- auth / session context (read-only, never sends secrets) ----
  function ctx() {
    var out = { clerk_user_id: null, role: null, session_id: null };
    try {
      var C = window.Clerk;
      if (C && C.user && C.user.id) { out.clerk_user_id = C.user.id; }
      if (C && C.session && C.session.id) { out.session_id = C.session.id; }
    } catch (e) {}
    try {
      var A = window.AIMCAuth;
      if (A && typeof A.getRole === "function") { out.role = A.getRole() || null; }
    } catch (e) {}
    return out;
  }

  // ---- build a normalized event for the function ----
  function normalize(eventName, payload) {
    var c = ctx();
    var loc = window.location || {};
    return {
      event_id: newEventId(),
      event_name: eventName,
      occurred_at: new Date().toISOString(),
      anonymous_id: anonId(),
      clerk_user_id: c.clerk_user_id,
      role: c.role,
      session_id: c.session_id,
      page_url: (loc.href || null),
      referrer: (document.referrer || null),
      source: "web",
      payload: (payload && typeof payload === "object") ? payload : {}
    };
  }

  // ---- localStorage queue ----
  function readQueue() {
    try { var raw = lsGet(QUEUE_KEY); var arr = raw ? JSON.parse(raw) : []; return Array.isArray(arr) ? arr : []; }
    catch (e) { return []; }
  }
  function writeQueue(arr) {
    try {
      if (arr.length > MAX_QUEUE) { arr = arr.slice(arr.length - MAX_QUEUE); }
      lsSet(QUEUE_KEY, JSON.stringify(arr));
    } catch (e) {}
  }
  function enqueue(evt) {
    var arr = readQueue();
    arr.push(evt);
    writeQueue(arr);
  }

  // ---- network send (returns a Promise<boolean>) ----
  function send(evt) {
    try {
      return window.fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(evt),
        keepalive: true
      }).then(function (res) { return res && res.ok; })
        .catch(function () { return false; });
    } catch (e) {
      return Promise.resolve(false);
    }
  }

  // ---- retry queued events (called on load) ----
  var flushing = false;
  function flushQueue() {
    if (flushing) { return; }
    var arr = readQueue();
    if (!arr.length) { return; }
    flushing = true;
    var remaining = [];
    var i = 0;
    function step() {
      if (i >= arr.length) {
        writeQueue(remaining);
        flushing = false;
        return;
      }
      var evt = arr[i++];
      send(evt).then(function (ok) {
        if (!ok) { remaining.push(evt); }
        step();
      });
    }
    step();
  }

  // ---- pipeline entry: normalize, send, queue on fail ----
  function pipeline(eventName, payload) {
    if (!eventName) { return; }
    var evt = normalize(eventName, payload);
    send(evt).then(function (ok) { if (!ok) { enqueue(evt); } });
    return evt;
  }

  // Suppress the emit-triggered pipeline while inside track(), so a single
  // track() call (which internally calls emit()) forwards exactly once.
  var suppressEmitPipeline = false;

  // ---- wrap existing track() so all existing callers forward server-side ----
  var prevTrack = (typeof Loop.track === "function") ? Loop.track : null;
  Loop.track = function (eventName, payload) {
    // Preserve existing local emit + GA mirror behavior (do not double-forward).
    suppressEmitPipeline = true;
    try { if (prevTrack) { prevTrack.call(Loop, eventName, payload); } } catch (e) {}
    suppressEmitPipeline = false;
    // Forward to EMG LOOP via the Netlify function exactly once.
    try { pipeline(eventName, payload); } catch (e) {}
  };

  // Also wrap emit() so DIRECT emit callers are forwarded.
  var prevEmit = (typeof Loop.emit === "function") ? Loop.emit : null;
  if (prevEmit) {
    Loop.emit = function (eventName, payload) {
      var r;
      try { r = prevEmit.call(Loop, eventName, payload); } catch (e) {}
      if (!suppressEmitPipeline) {
        try { pipeline(eventName, payload); } catch (e) {}
      }
      return r;
    };
  }

  // Expose queue helpers for debugging / manual flush.
  Loop.__pipeline = { flush: flushQueue, queueKey: QUEUE_KEY, endpoint: ENDPOINT };

  // Retry any queued events from a previous session on load.
  try {
    if (document.readyState === "complete" || document.readyState === "interactive") { flushQueue(); }
    else { window.addEventListener("DOMContentLoaded", flushQueue); }
    window.addEventListener("online", flushQueue);
  } catch (e) {}
})(window);

/* ==============================================================
 * EMG Loop Event Gateway - standardized producer events
 * --------------------------------------------------------------
 * Adds the canonical dot-namespaced events required by the EMG
 * Loop Event Gateway contract. These are thin wrappers over the
 * existing AIMCLoop.track(eventName, payload) dispatcher, so they
 * flow through the same internal Netlify function (loop-event) and
 * never touch the webhook secret in the browser.
 *
 * eventType values sent to Loop:
 *   artist.profile_viewed
 *   artist.claimed_profile
 *   artist.submitted_music
 *   fan.signup_started
 *   contact.form_submitted
 * ============================================================== */
(function (w) {
  var Loop = w.AIMCLoop;
  if (!Loop || typeof Loop.track !== "function") return;

  // Safe emit: track() is already fail-safe, but guard here too so a
  // tracking call can never throw into page/UX code.
  function emit(eventType, payload) {
    try {
      return Loop.track(eventType, payload || {});
    } catch (_e) {
      if (w.console && console.warn) {
        console.warn("[AIMCLoop] event emit failed:", eventType);
      }
    }
  }

  Loop.events = Loop.events || {};

  // artist.profile_viewed - a visitor viewed an artist profile.
  Loop.events.artistProfileViewed = function (payload) {
    return emit("artist.profile_viewed", payload);
  };

  // artist.claimed_profile - an artist claimed their profile.
  Loop.events.artistClaimedProfile = function (payload) {
    return emit("artist.claimed_profile", payload);
  };

  // artist.submitted_music - an artist submitted music.
  Loop.events.artistSubmittedMusic = function (payload) {
    return emit("artist.submitted_music", payload);
  };

  // fan.signup_started - a fan began the signup flow.
  Loop.events.fanSignupStarted = function (payload) {
    return emit("fan.signup_started", payload);
  };

  // contact.form_submitted - a contact form was submitted.
  Loop.events.contactFormSubmitted = function (payload) {
    return emit("contact.form_submitted", payload);
  };

  // Also expose the raw event names for direct Loop.track(...) use.
  Loop.EVENTS = Object.assign(Loop.EVENTS || {}, {
    ARTIST_PROFILE_VIEWED: "artist.profile_viewed",
    ARTIST_CLAIMED_PROFILE: "artist.claimed_profile",
    ARTIST_SUBMITTED_MUSIC: "artist.submitted_music",
    FAN_SIGNUP_STARTED: "fan.signup_started",
    CONTACT_FORM_SUBMITTED: "contact.form_submitted"
  });
})(typeof window !== "undefined" ? window : this);
