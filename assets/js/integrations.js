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
