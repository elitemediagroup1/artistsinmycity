/*
 * Shared analytics loader.
 * integrations.js is loaded on every page, so this guarantees the GA4 /
 * analytics utility loads exactly once site-wide without hardcoding the
 * snippet into every page. analytics.js has its own install guard, so it is
 * safe even if a page also references it directly.
 */
(function loadAnalyticsOnce(){
  try {
    if (document.querySelector('script[data-aimc-analytics]')) { return; }
    var s = document.createElement('script');
    s.src = '/assets/js/analytics.js';
    s.setAttribute('data-aimc-analytics', '1');
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();

/* SPRINT5_LOADER */
(function loadSprint5Once(){
  try {
    if (document.querySelector('script[data-aimc-sprint5]')) { return; }
    var files = [
      '/assets/js/roadie-memory.js',
      '/assets/js/recommendations.js',
      '/assets/js/sprint5.js'
    ];
    files.forEach(function(src){
      var s = document.createElement('script');
      s.src = src;
      s.defer = true;
      s.setAttribute('data-aimc-sprint5','1');
      (document.head || document.documentElement).appendChild(s);
    });
  } catch (e) {}
})();



(function(){
  window.AIMC_CONFIG = window.AIMC_CONFIG || {
    ga4: 'G-PLACEHOLDER',
    gtm: 'GTM-PLACEHOLDER',
    clarity: 'PLACEHOLDER',
    metaPixel: 'PLACEHOLDER',
    tiktokPixel: 'PLACEHOLDER'
  };
  window.aimcTrack = function(eventName, payload){
    console.log('[AIMC analytics placeholder]', eventName, payload || {});
    if (window.gtag) window.gtag('event', eventName, payload || {});
    if (window.fbq) window.fbq('trackCustom', eventName, payload || {});
    if (window.ttq) window.ttq.track(eventName, payload || {});
  };
})();

/* SPRINT6_LOADER — Artist Success System (v3.5) */
(function () {
  if (window.__aimcSprint6Loading) return;
  window.__aimcSprint6Loading = true;
  function inject(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src;
    s.defer = true;
    s.setAttribute(attr, '1');
    (document.body || document.head).appendChild(s);
  }
  function start() {
    /* artist-success depends on sprint5 components; load after a tick so
       AIMCComponents / AIMCLoop / RoadieMemory are available. */
    setTimeout(function () {
      inject('/assets/js/artist-success.js', 'data-aimc-success');
    }, 0);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();

/* SPRINT7_LOADER — Digital Exhibit Experience (v4.0) */
(function () {
  if (window.__aimcSprint7Loading) return;
  window.__aimcSprint7Loading = true;
  function inject(src, attr) {
    if (document.querySelector('script[' + attr + ']')) return;
    var s = document.createElement('script');
    s.src = src; s.defer = true; s.setAttribute(attr, '1');
    (document.body || document.head).appendChild(s);
  }
  function start() {
    /* load after a tick so sprint5 components + artist-success are available */
    setTimeout(function () {
      inject('/assets/js/exhibit-experience.js', 'data-aimc-experience');
    }, 0);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

/* SPRINT8_AUTH_LOADER - Clerk authentication (loads once site-wide) */
(function loadClerkAuthOnce(){
  try {
    if (document.querySelector("script[data-aimc-clerk-auth]")) { return; }
    var s = document.createElement("script");
    s.src = "/assets/js/clerk-auth.js";
    s.defer = true;
    s.setAttribute("data-aimc-clerk-auth", "1");
    (document.head || document.documentElement).appendChild(s);
  } catch (e) {}
})();
