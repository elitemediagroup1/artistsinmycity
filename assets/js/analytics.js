/*
 * ArtistsInMyCity - Analytics utility
 * Single source of truth for Google Analytics 4 + custom event tracking.
 * Loads gtag.js exactly once, sends exactly one page_view per page load,
 * and exposes trackEvent(name, params) plus named helpers.
 *
 * Usage:
 *   AIMC.trackEvent('artist_signup', { method: 'clerk' });
 *   AIMC.events.artistSignup();
 *
 * Do NOT add raw gtag() calls elsewhere. Always route through trackEvent().
 */
(function (window, document) {
  'use strict';

  var GA_MEASUREMENT_ID = "G-HPSSBYPFLP";
  var GTAG_SRC = "https://www.googletagmanager.com/gtag/js?id=" + GA_MEASUREMENT_ID;

  // Guard: never install GA twice, even if this file is referenced more than once.
  if (window.__AIMC_GA_INSTALLED__) {
    return;
  }
  window.__AIMC_GA_INSTALLED__ = true;

  // dataLayer + gtag shim
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // Load the gtag.js library exactly once.
  (function loadGtagOnce() {
    var already = document.querySelector('script[data-aimc-gtag]');
    if (already) { return; }
    var s = document.createElement('script');
    s.async = true;
    s.src = GTAG_SRC;
    s.setAttribute('data-aimc-gtag', '1');
    var first = document.getElementsByTagName('script')[0];
    if (first && first.parentNode) {
      first.parentNode.insertBefore(s, first);
    } else {
      document.head.appendChild(s);
    }
  })();

  // Initialize GA4. send_page_view stays default (true) so exactly one
  // page_view fires on config for this page load. We do NOT call config twice.
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,
    transport_type: 'beacon'
  });

  /**
   * trackEvent - the single entry point for custom analytics.
   * Sends the event to GA4, and mirrors it to the EMG Loop pipeline if present.
   * @param {string} name   snake_case event name
   * @param {object} params optional event parameters
   */
  function trackEvent(name, params) {
    if (!name) { return; }
    params = params || {};
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, params);
      }
    } catch (e) { /* analytics must never break the UI */ }

    // Mirror to EMG Loop placeholder pipeline when available (non-fatal).
    try {
      if (typeof window.aimcTrack === 'function') {
        window.aimcTrack(name, params);
      }
    } catch (e) {}
  }

  // Named helpers so future developers avoid magic strings.
  var events = {
    // ARTIST
    artistSignup:            function (p) { trackEvent('artist_signup', p); },
    artistLogin:             function (p) { trackEvent('artist_login', p); },
    artistLogout:            function (p) { trackEvent('artist_logout', p); },
    artistOnboardingStarted: function (p) { trackEvent('artist_onboarding_started', p); },
    artistOnboardingCompleted:function (p){ trackEvent('artist_onboarding_completed', p); },
    artistUploadImage:       function (p) { trackEvent('artist_upload_image', p); },
    artistUploadVideo:       function (p) { trackEvent('artist_upload_video', p); },
    artistUploadMusic:       function (p) { trackEvent('artist_upload_music', p); },
    artistUploadArtwork:     function (p) { trackEvent('artist_upload_artwork', p); },
    artistPublish:           function (p) { trackEvent('artist_publish', p); },
    artistPreview:           function (p) { trackEvent('artist_preview', p); },
    artistFollowReceived:    function (p) { trackEvent('artist_follow_received', p); },
    artistBookingReceived:   function (p) { trackEvent('artist_booking_received', p); },
    artistTicketCreated:     function (p) { trackEvent('artist_ticket_created', p); },
    artistMerchCreated:      function (p) { trackEvent('artist_merch_created', p); },
    artistPageView:          function (p) { trackEvent('artist_page_view', p); },
    artistThemeChanged:      function (p) { trackEvent('artist_theme_changed', p); },
    artistProfileUpdated:    function (p) { trackEvent('artist_profile_updated', p); },
    artistGalleryUpdated:    function (p) { trackEvent('artist_gallery_updated', p); },
    artistAiBioGenerated:    function (p) { trackEvent('artist_ai_bio_generated', p); },
    artistAiSeoGenerated:    function (p) { trackEvent('artist_ai_seo_generated', p); },
    artistAiAeoGenerated:    function (p) { trackEvent('artist_ai_aeo_generated', p); },

    // FAN
    fanSignup:        function (p) { trackEvent('fan_signup', p); },
    fanLogin:         function (p) { trackEvent('fan_login', p); },
    fanFollowArtist:  function (p) { trackEvent('fan_follow_artist', p); },
    fanSaveArtist:    function (p) { trackEvent('fan_save_artist', p); },
    fanShareArtist:   function (p) { trackEvent('fan_share_artist', p); },
    fanTicketClick:   function (p) { trackEvent('fan_ticket_click', p); },
    fanMerchClick:    function (p) { trackEvent('fan_merch_click', p); },
    fanMessageArtist: function (p) { trackEvent('fan_message_artist', p); },
    fanViewArtist:    function (p) { trackEvent('fan_view_artist', p); },
    fanViewCity:      function (p) { trackEvent('fan_view_city', p); },
    fanSearch:        function (p) { trackEvent('fan_search', p); },
    fanEventSearch:   function (p) { trackEvent('fan_event_search', p); },

    // ROADIE
    roadieOpen:         function (p) { trackEvent('roadie_open', p); },
    roadieMessage:      function (p) { trackEvent('roadie_message', p); },
    roadieQuickAction:  function (p) { trackEvent('roadie_quick_action', p); },
    roadieGenerateBio:  function (p) { trackEvent('roadie_generate_bio', p); },
    roadieGenerateSeo:  function (p) { trackEvent('roadie_generate_seo', p); },
    roadieGenerateAeo:  function (p) { trackEvent('roadie_generate_aeo', p); },

    // DISCOVERY
    cityView:        function (p) { trackEvent('city_view', p); },
    categoryView:    function (p) { trackEvent('category_view', p); },
    eventView:       function (p) { trackEvent('event_view', p); },
    galleryView:     function (p) { trackEvent('gallery_view', p); },
    discoverScroll:  function (p) { trackEvent('discover_scroll', p); },
    searchPerformed: function (p) { trackEvent('search_performed', p); }
  };

  // Public API
  window.AIMC = window.AIMC || {};
  window.AIMC.GA_MEASUREMENT_ID = GA_MEASUREMENT_ID;
  window.AIMC.trackEvent = trackEvent;
  window.AIMC.events = events;
  // Back-compat convenience global.
  window.trackEvent = window.trackEvent || trackEvent;

})(window, document);
