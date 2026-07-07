/*!
 * ArtistsInMyCity — Sprint 6 (v3.5) — Artist Success System
 * Extends the existing platform. Placeholders + localStorage today;
 * clean interfaces so Neon + EMG LOOP can replace local impls later.
 * Depends (soft) on: window.AIMCComponents, window.AIMCLoop, window.RoadieMemory,
 *   window.AIMCTimeline. All calls are guarded so this file never throws if a
 *   dependency is absent.
 */
(function () {
  'use strict';
  if (window.__AIMC_SUCCESS__) return;
  window.__AIMC_SUCCESS__ = true;

  /* ---------- soft dependency shims (never throw) ---------- */
  var C = window.AIMCComponents || {};
  function track(name, payload) {
    try {
      if (window.AIMCLoop && typeof window.AIMCLoop.track === 'function') {
        window.AIMCLoop.track(name, payload || {});
      } else if (typeof window.aimcTrack === 'function') {
        window.aimcTrack(name, payload || {});
      }
    } catch (e) {}
  }
  function timelinePush(type, label) {
    try { if (window.AIMCTimeline && window.AIMCTimeline.push) window.AIMCTimeline.push(type, label); } catch (e) {}
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
  function emptyState(t, s) { return C.emptyState ? C.emptyState(t, s) : ('<div class="s5-empty"><h4 class="s5-empty-title">' + esc(t) + '</h4><p class="s5-empty-sub">' + esc(s || '') + '</p></div>'); }
  function roadie(msg, actions) { return C.roadiePrompt ? C.roadiePrompt(msg, actions) : ('<div class="s5-roadie-card"><span class="s5-roadie-avatar">R</span><div class="s5-roadie-body"><p>' + esc(msg) + '</p></div></div>'); }
  function metric(label, value, hint) { return C.metricCard ? C.metricCard(label, value, hint) : ('<div class="s5-metric"><span class="s5-metric-label">' + esc(label) + '</span><span class="s5-metric-value">' + esc(value) + '</span></div>'); }

  /* ---------- storage (localStorage today; Neon later) ---------- */
  function read(key, fallback) {
    try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch (e) { return fallback; }
  }
  function write(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  var K = {
    checklist: 'aimc.success.checklist.v1',
    goals:     'aimc.success.goals.v1',
    founding:  'aimc.success.founding.v1',
    links:     'aimc.success.links.v1',
    journey:   'aimc.success.journey.v1'
  };

  /* ============================================================
     TASK 1 — DIGITAL EXHIBIT SCORE
     Placeholder scoring. Real scoring can later come from EMG LOOP
     via ExhibitScore.compute() returning the same shape.
     ============================================================ */
  var SCORE_SECTIONS = [
    { key: 'hero',        label: 'Hero Image',        weight: 10 },
    { key: 'statement',   label: 'Artist Statement',  weight: 10 },
    { key: 'gallery',     label: 'Gallery',           weight: 10 },
    { key: 'videos',      label: 'Videos',            weight: 6  },
    { key: 'music',       label: 'Music',             weight: 6  },
    { key: 'collections', label: 'Collections',       weight: 10 },
    { key: 'seo',         label: 'SEO',               weight: 8  },
    { key: 'aeo',         label: 'AEO',               weight: 8  },
    { key: 'access',      label: 'Accessibility',     weight: 8  },
    { key: 'bookings',    label: 'Bookings',          weight: 6  },
    { key: 'events',      label: 'Events',            weight: 4  },
    { key: 'store',       label: 'Store',             weight: 4  },
    { key: 'social',      label: 'Social Links',      weight: 10 }
  ];

  function scoreBand(n) {
    if (n >= 90) return { label: 'Roadie Approved', cls: 's6-band-approved' };
    if (n >= 70) return { label: 'Almost Ready',    cls: 's6-band-almost' };
    if (n >= 40) return { label: 'Good Start',      cls: 's6-band-good' };
    return { label: 'Needs Work', cls: 's6-band-needs' };
  }

  /* Placeholder signal reader. Returns 'complete' | 'attention' | 'missing'.
     Reads only from RoadieMemory / localStorage placeholders that exist today.
     Later: EMG LOOP + Neon provide real exhibit completeness signals. */
  function readSignals() {
    var mem = {};
    try { if (window.RoadieMemory && window.RoadieMemory.getMemory) mem = window.RoadieMemory.getMemory() || {}; } catch (e) {}
    var checklist = read(K.checklist, {});
    var collections = read('aimc.collections.v1', []);
    var theme = read('aimc.exhibit.theme.v1', null);
    var links = read(K.links, {});
    function state(done, partial) { return done ? 'complete' : (partial ? 'attention' : 'missing'); }
    return {
      hero:        state(!!checklist.cover, false),
      statement:   state(!!checklist.statement, false),
      gallery:     state(!!checklist.artwork, false),
      videos:      'missing',
      music:       'missing',
      collections: state((collections || []).length > 0, false),
      seo:         state(!!checklist.seo, false),
      aeo:         state(!!checklist.aeo, false),
      access:      state(false, !!checklist.artwork),
      bookings:    'missing',
      events:      'missing',
      store:       'missing',
      social:      state(Object.keys(links || {}).length > 0, !!checklist.social)
    };
  }

  function computeScore() {
    var sig = readSignals();
    var total = 0, earned = 0, breakdown = [];
    SCORE_SECTIONS.forEach(function (s) {
      total += s.weight;
      var st = sig[s.key] || 'missing';
      var pct = st === 'complete' ? 1 : (st === 'attention' ? 0.5 : 0);
      earned += s.weight * pct;
      breakdown.push({ key: s.key, label: s.label, status: st });
    });
    var score = Math.round((earned / total) * 100);
    return { score: score, band: scoreBand(score), breakdown: breakdown };
  }

  function scoreRecommendation(breakdown) {
    var COPY = {
      hero: 'Add a hero image so visitors instantly feel your work.',
      statement: 'Write an Artist Statement to tell your story.',
      gallery: 'Upload artwork to bring your Gallery to life.',
      collections: 'Group your work into a Collection to guide visitors.',
      seo: 'Generate SEO so search engines can find your exhibit.',
      aeo: 'Generate AEO so AI assistants can recommend you.',
      access: 'Add alt text to make your exhibit accessible to everyone.',
      bookings: 'Adding a booking section could improve discoverability.',
      social: 'Connect your social links so fans can follow you.',
      store: 'A store link lets supporters buy your work.',
      events: 'List an event so fans can meet you in person.',
      videos: 'A short video helps visitors connect with your process.',
      music: 'Add music to set the mood of your exhibit.'
    };
    var next = breakdown.filter(function (b) { return b.status !== 'complete'; })[0];
    if (!next) return 'Your exhibit looks great. Roadie approves!';
    return COPY[next.key] || 'Keep improving your exhibit to raise your score.';
  }

  var ExhibitScore = {
    compute: computeScore,
    sections: SCORE_SECTIONS
  };
  window.ExhibitScore = ExhibitScore;

  /* ============================================================
     TASK 4 — ARTIST BADGE SYSTEM (reusable component)
     ============================================================ */
  var BADGES = {
    founding:   { icon: '\u2605', label: 'Founding Artist',    color: '#f5c451', desc: 'One of the first artists shaping ArtistsInMyCity.' },
    verified:   { icon: '\u2714', label: 'Verified Artist',    color: '#4ea1ff', desc: 'Identity confirmed by ArtistsInMyCity.' },
    featured:   { icon: '\u2726', label: 'Featured Artist',    color: '#b980ff', desc: 'Highlighted across the platform this cycle.' },
    roadiepick: { icon: '\u266b', label: "Roadie's Pick",      color: '#ff7ab6', desc: 'Hand-picked by Roadie for its quality.' },
    community:  { icon: '\u2665', label: 'Community Favorite', color: '#ff6b6b', desc: 'Loved by the ArtistsInMyCity community.' },
    emerging:   { icon: '\u25B2', label: 'Emerging Artist',    color: '#3ddc97', desc: 'A rising talent to watch.' },
    weekly:     { icon: '\u2691', label: 'Exhibit of the Week', color: '#ffb454', desc: 'Standout exhibit this week.' }
  };
  function badgeChip(key) {
    var b = BADGES[key]; if (!b) return '';
    return '<span class="s6-badge" style="--badge:' + b.color + '" title="' + esc(b.desc) + '" tabindex="0" aria-label="' + esc(b.label + ': ' + b.desc) + '">' +
      '<span class="s6-badge-ic" aria-hidden="true">' + b.icon + '</span>' +
      '<span class="s6-badge-lbl">' + esc(b.label) + '</span>' +
      '<span class="s6-badge-tip">' + esc(b.desc) + '</span>' +
    '</span>';
  }
  window.AIMCBadges = { data: BADGES, chip: badgeChip };

  /* ============================================================
     TASK 2 — ARTIST SUCCESS CHECKLIST (data)
     ============================================================ */
  var CHECKLIST_ITEMS = [
    { key: 'cover',     label: 'Upload Cover Image' },
    { key: 'photo',     label: 'Upload Profile Photo' },
    { key: 'statement', label: 'Write Artist Statement' },
    { key: 'collection',label: 'Create First Collection' },
    { key: 'artwork',   label: 'Upload First Artwork' },
    { key: 'social',    label: 'Connect Social Links' },
    { key: 'theme',     label: 'Choose Exhibit Theme' },
    { key: 'seo',       label: 'Generate SEO' },
    { key: 'aeo',       label: 'Generate AEO' },
    { key: 'preview',   label: 'Preview Exhibit' },
    { key: 'publish',   label: 'Publish Exhibit' }
  ];
  function checklistState() { return read(K.checklist, {}); }
  function checklistProgress(state) {
    var done = CHECKLIST_ITEMS.filter(function (i) { return !!state[i.key]; }).length;
    return { done: done, total: CHECKLIST_ITEMS.length, pct: Math.round((done / CHECKLIST_ITEMS.length) * 100) };
  }
  function checklistEncouragement(p) {
    if (p.done === 0) return "Let's build your exhibit. Start with a cover image.";
    if (p.done === p.total) return 'Your exhibit is complete. Incredible work!';
    if (p.total - p.done === 1) return "You're only one step away from publishing.";
    if (p.pct >= 70) return "Almost there \u2014 your exhibit is looking strong.";
    if (p.pct >= 40) return 'Great momentum. Keep going!';
    return "Nice start \u2014 every step makes your exhibit stronger.";
  }

  /* ============================================================
     TASK 6 — ARTIST GOALS (data)
     ============================================================ */
  var GOALS = [
    { key: 'bookings',      label: 'Get More Bookings',  icon: '\uD83D\uDCC5' },
    { key: 'sell',          label: 'Sell Artwork',       icon: '\uD83D\uDDBC' },
    { key: 'audience',      label: 'Grow Audience',      icon: '\uD83D\uDCC8' },
    { key: 'gallery',       label: 'Land Gallery Shows', icon: '\uD83C\uDFDB' },
    { key: 'brand',         label: 'Build Brand',        icon: '\u2728' },
    { key: 'teach',         label: 'Teach Classes',      icon: '\uD83C\uDF93' },
    { key: 'collab',        label: 'Find Collaborators', icon: '\uD83E\uDD1D' },
    { key: 'deals',         label: 'Get Brand Deals',    icon: '\uD83E\uDD1D' }
  ];
  var GOAL_ADVICE = {
    bookings: 'Add a booking section and clear availability so venues can reach you.',
    sell:     'Create a Collection and connect a store link so collectors can buy.',
    audience: 'Share your exhibit QR code and post new work to grow your following.',
    gallery:  'Polish your Artist Statement and hero image \u2014 curators notice first impressions.',
    brand:    'Choose a consistent Exhibit Theme and connect your social links.',
    teach:    'Add an events section describing the classes you offer.',
    collab:   'List your art forms and cities so collaborators can find you.',
    deals:    'Grow your audience and keep your exhibit polished to attract brand deals.'
  };
  function selectedGoals() { return read(K.goals, []); }

  /* ============================================================
     RENDERERS (reuse s5- design tokens; add s6- only where new)
     ============================================================ */

  /* TASK 1 render */
  function renderScore(el) {
    var r = computeScore();
    var rec = scoreRecommendation(r.breakdown);
    var rows = r.breakdown.map(function (b) {
      var stLabel = b.status === 'complete' ? 'Complete' : (b.status === 'attention' ? 'Needs Attention' : 'Missing');
      return '<li class="s6-score-row s6-st-' + b.status + '"><span class="s6-score-dot" aria-hidden="true"></span>' +
        '<span class="s6-score-name">' + esc(b.label) + '</span>' +
        '<span class="s6-score-state">' + stLabel + '</span></li>';
    }).join('');
    el.innerHTML =
      '<div class="s6-score-card">' +
        '<div class="s6-score-head">' +
          '<div class="s6-score-ring ' + r.band.cls + '"><span class="s6-score-num">' + r.score + '</span><span class="s6-score-of">/100</span></div>' +
          '<div class="s6-score-meta">' +
            '<span class="s6-score-status ' + r.band.cls + '">' + esc(r.band.label) + '</span>' +
            '<div class="s6-bar"><div class="s6-bar-fill" style="width:' + r.score + '%"></div></div>' +
          '</div>' +
        '</div>' +
        roadie('Roadie says: ' + rec) +
        '<ul class="s6-score-list">' + rows + '</ul>' +
      '</div>';
    track('exhibit_score_viewed', { score: r.score, band: r.band.label });
  }

  /* TASK 2 render */
  function renderChecklist(el) {
    function paint() {
      var state = checklistState();
      var p = checklistProgress(state);
      var items = CHECKLIST_ITEMS.map(function (i) {
        var on = !!state[i.key];
        return '<li class="s6-check-item' + (on ? ' is-done' : '') + '">' +
          '<button type="button" class="s6-check-box" data-check="' + i.key + '" role="checkbox" aria-checked="' + on + '" aria-label="' + esc(i.label) + '">' + (on ? '\u2713' : '') + '</button>' +
          '<span class="s6-check-lbl">' + esc(i.label) + '</span></li>';
      }).join('');
      el.innerHTML =
        '<div class="s6-check-card">' +
          '<div class="s6-check-head"><h3>Artist Success Checklist</h3>' +
            '<span class="s6-check-pct">' + p.pct + '% launched</span></div>' +
          '<div class="s6-bar"><div class="s6-bar-fill" style="width:' + p.pct + '%"></div></div>' +
          roadie(checklistEncouragement(p)) +
          '<ul class="s6-check-list">' + items + '</ul>' +
        '</div>';
      el.querySelectorAll('[data-check]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var st = checklistState(); var key = btn.getAttribute('data-check');
          st[key] = !st[key]; write(K.checklist, st);
          track('success_checklist_updated', { item: key, done: !!st[key] });
          timelinePush('roadie_suggestion', 'Checklist: ' + key + (st[key] ? ' done' : ' cleared'));
          paint();
        });
      });
    }
    paint();
  }

  /* TASK 3 render */
  function renderFounding(el) {
    el.innerHTML =
      '<div class="s6-founding">' +
        '<div class="s6-founding-ribbon">FOUNDING ARTIST</div>' +
        '<div class="s6-founding-body">' +
          badgeChip('founding') +
          '<p class="s6-founding-msg">Congratulations. You\u2019re one of the first artists helping shape ArtistsInMyCity.</p>' +
          '<div class="s6-founding-cert"><span class="s6-cert-seal" aria-hidden="true">\u2605</span>' +
            '<span>Founding Artist Certificate <em>(placeholder \u2014 issued from your account later)</em></span></div>' +
        '</div>' +
      '</div>';
  }

  /* TASK 4 render (badge showcase) */
  function renderBadges(el) {
    el.innerHTML = '<div class="s6-badge-grid">' + Object.keys(BADGES).map(function (k) { return badgeChip(k); }).join('') + '</div>';
  }

  /* TASK 5 render — Roadie Weekly Report (placeholder data) */
  function renderWeeklyReport(el) {
    var checklist = checklistState();
    var hasActivity = Object.keys(checklist).some(function (k) { return checklist[k]; }) ||
      (read('aimc.collections.v1', []) || []).length > 0;
    if (!hasActivity) {
      el.innerHTML = '<div class="s6-week-card"><h3>Roadie Weekly Report</h3>' +
        emptyState('No activity yet this week.', 'Publish your exhibit and Roadie will start tracking your progress here.') + '</div>';
      return;
    }
    var cards = [
      metric('Visitors', '\u2014', 'Live once published'),
      metric('Followers', '\u2014', 'Coming with Neon'),
      metric('Views', '\u2014', 'Coming with EMG LOOP'),
      metric('Collections', String((read('aimc.collections.v1', []) || []).length)),
      metric('Searches', '\u2014'),
      metric('Cities Reached', '\u2014'),
      metric('Exhibit Score', String(computeScore().score) + '/100', 'This week')
    ].join('');
    el.innerHTML =
      '<div class="s6-week-card"><h3>Roadie Weekly Report</h3>' +
        '<div class="s6-metric-grid">' + cards + '</div>' +
        roadie('Your exhibit gained more attention this week than last week. Keep publishing new work to build momentum.') +
      '</div>';
    track('roadie_weekly_report_viewed', {});
  }

  /* TASK 6 render — Artist Goals */
  function renderGoals(el) {
    function paint() {
      var sel = selectedGoals();
      var cards = GOALS.map(function (g) {
        var on = sel.indexOf(g.key) > -1;
        return '<button type="button" class="s6-goal-card' + (on ? ' is-on' : '') + '" data-goal="' + g.key + '" aria-pressed="' + on + '">' +
          '<span class="s6-goal-ic" aria-hidden="true">' + g.icon + '</span>' +
          '<span class="s6-goal-lbl">' + esc(g.label) + '</span></button>';
      }).join('');
      var advice = sel.length
        ? sel.map(function (k) { return GOAL_ADVICE[k]; }).filter(Boolean)[0]
        : 'Choose a goal and Roadie will tailor its coaching to help you get there.';
      el.innerHTML =
        '<div class="s6-goals-card"><h3>Your Goals</h3>' +
          '<p class="s6-goals-sub">Tell Roadie what success looks like for you.</p>' +
          '<div class="s6-goal-grid">' + cards + '</div>' +
          roadie('Roadie says: ' + advice) +
        '</div>';
      el.querySelectorAll('[data-goal]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var s = selectedGoals(); var key = btn.getAttribute('data-goal');
          var i = s.indexOf(key); if (i > -1) s.splice(i, 1); else s.push(key);
          write(K.goals, s);
          track('artist_goal_selected', { goal: key, active: s.indexOf(key) > -1, goals: s });
          paint();
        });
      });
    }
    paint();
  }

  /* TASK 7 render — Exhibit Sharing (placeholder) */
  function renderSharing(el) {
    var url = (location && location.origin ? location.origin : '') + '/pages/exhibit-builder.html';
    el.innerHTML =
      '<div class="s6-share-card"><h3>Share Your Exhibit</h3>' +
        '<div class="s6-share-btns">' +
          '<button type="button" class="s5-btn s5-btn-primary" data-share="copy">Copy Link</button>' +
          '<button type="button" class="s5-btn" data-share="share">Share</button>' +
          '<button type="button" class="s5-btn" data-share="qr">QR Code</button>' +
          '<button type="button" class="s5-btn" data-share="qrdl">Download QR</button>' +
          '<button type="button" class="s5-btn s5-btn-ghost" data-share="og">Open Graph Preview</button>' +
        '</div>' +
        '<div class="s6-qr" data-qr hidden><div class="s6-qr-box" aria-hidden="true">\u2317</div>' +
          '<span class="s6-qr-cap">QR preview (placeholder)</span></div>' +
        roadie('Print your QR code and display it beside your work.') +
      '</div>';
    el.querySelectorAll('[data-share]').forEach(function (b) {
      b.addEventListener('click', function () {
        var kind = b.getAttribute('data-share');
        if (kind === 'copy') { try { navigator.clipboard && navigator.clipboard.writeText(url); } catch (e) {} }
        if (kind === 'qr' || kind === 'qrdl') { var q = el.querySelector('[data-qr]'); if (q) q.hidden = false; }
        track('exhibit_share_action', { kind: kind });
        timelinePush('exhibit_saved', 'Shared exhibit (' + kind + ')');
      });
    });
  }

  /* TASK 8 render — Link Hub */
  var LINK_SLOTS = [
    { key: 'listen',  label: 'Listen',  icon: '\u266b' },
    { key: 'watch',   label: 'Watch',   icon: '\u25B6' },
    { key: 'visit',   label: 'Visit',   icon: '\uD83D\uDCCD' },
    { key: 'book',    label: 'Book',    icon: '\uD83D\uDCC5' },
    { key: 'support', label: 'Support', icon: '\u2665' },
    { key: 'donate',  label: 'Donate',  icon: '\uD83C\uDF81' },
    { key: 'website', label: 'Website', icon: '\uD83C\uDF10' },
    { key: 'social',  label: 'Social',  icon: '\u25CE' }
  ];
  function renderLinkHub(el) {
    function paint() {
      var links = read(K.links, {});
      var cards = LINK_SLOTS.map(function (s) {
        var v = links[s.key];
        var body = v
          ? '<span class="s6-link-val">' + esc(v) + '</span>'
          : '<span class="s6-link-empty">Connect your first destination.</span>';
        return '<div class="s6-link-card' + (v ? ' is-set' : '') + '">' +
          '<span class="s6-link-ic" aria-hidden="true">' + s.icon + '</span>' +
          '<span class="s6-link-name">' + esc(s.label) + '</span>' + body +
          '<button type="button" class="s6-link-edit" data-link="' + s.key + '">' + (v ? 'Edit' : 'Add') + '</button>' +
        '</div>';
      }).join('');
      el.innerHTML = '<div class="s6-linkhub-card"><h3>Link Hub</h3>' +
        '<p class="s6-goals-sub">One home for everywhere fans can find you.</p>' +
        '<div class="s6-link-grid">' + cards + '</div></div>';
      el.querySelectorAll('[data-link]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-link');
          var cur = read(K.links, {});
          var val = window.prompt('Add a ' + key + ' destination (URL or handle):', cur[key] || '');
          if (val === null) return;
          if (val) cur[key] = val; else delete cur[key];
          write(K.links, cur);
          track('link_hub_updated', { slot: key, set: !!val });
          paint();
        });
      });
    }
    paint();
  }

  /* TASK 9 render — Media Organizer (placeholder suggestions, no real AI) */
  var MEDIA_BUCKETS = ['Featured', 'Behind the Scenes', 'Studio', 'Collections', 'Events', 'Videos', 'Favorites'];
  function renderMediaOrganizer(el) {
    var chips = MEDIA_BUCKETS.map(function (b) { return '<span class="s6-media-bucket">' + esc(b) + '</span>'; }).join('');
    el.innerHTML =
      '<div class="s6-media-card"><h3>Media Organizer</h3>' +
        '<p class="s6-goals-sub">Roadie helps sort your uploads (suggestions are placeholders for now).</p>' +
        '<div class="s6-media-buckets">' + chips + '</div>' +
        '<ul class="s6-media-suggestions">' +
          '<li>' + roadie('This would make a great cover image.') + '</li>' +
          '<li>' + roadie('Move this into your Photography Collection.') + '</li>' +
        '</ul>' +
      '</div>';
    track('media_organizer_viewed', {});
  }

  /* ============================================================
     TASK 10 — VISITOR JOURNEY PLACEHOLDERS
     Fire placeholder Loop events (mirrored to GA via AIMCLoop.track).
     ============================================================ */
  var JOURNEY = {
    visited:  'visitor_visited_exhibit',
    scrolled: 'visitor_scrolled_100',
    gallery:  'visitor_viewed_gallery',
    music:    'visitor_played_music',
    video:    'visitor_watched_video',
    booking:  'visitor_clicked_booking',
    saved:    'visitor_saved_exhibit',
    shared:   'visitor_shared_exhibit',
    qr:       'visitor_qr_scanned'
  };
  var VisitorJourney = {
    track: function (key, payload) {
      var name = JOURNEY[key]; if (!name) return;
      var store = read(K.journey, {}); store[key] = (store[key] || 0) + 1; write(K.journey, store);
      track(name, payload || {});
    },
    events: JOURNEY
  };
  window.AIMCVisitorJourney = VisitorJourney;

  /* Auto placeholder: fire 'visited' + a one-time 'scrolled 100%' on exhibit pages. */
  function bindVisitorJourney() {
    var isExhibit = /exhibit|artist-|discover/i.test(location.pathname || '');
    if (!isExhibit) return;
    VisitorJourney.track('visited');
    var fired = false;
    window.addEventListener('scroll', function () {
      if (fired) return;
      var h = document.documentElement;
      if ((window.scrollY + window.innerHeight) >= (h.scrollHeight - 4)) { fired = true; VisitorJourney.track('scrolled'); }
    }, { passive: true });
  }

  /* ============================================================
     TASK 11 — ARTIST SUCCESS DASHBOARD (one unified overview)
     Composes the other renderers into a single card grid.
     ============================================================ */
  function renderDashboard(el) {
    el.innerHTML =
      '<div class="s6-dash">' +
        '<div class="s6-dash-head"><h2>Artist Success</h2>' +
          '<p class="s6-goals-sub">Everything Roadie is watching to help you succeed.</p></div>' +
        '<div class="s6-dash-grid">' +
          '<div class="s6-dash-cell s6-dash-score" data-cell="score"></div>' +
          '<div class="s6-dash-cell" data-cell="checklist"></div>' +
          '<div class="s6-dash-cell" data-cell="weekly"></div>' +
          '<div class="s6-dash-cell" data-cell="goals"></div>' +
          '<div class="s6-dash-cell" data-cell="recommend"></div>' +
          '<div class="s6-dash-cell" data-cell="activity"></div>' +
        '</div>' +
      '</div>';
    var q = function (sel) { return el.querySelector(sel); };
    renderScore(q('[data-cell="score"]'));
    renderChecklist(q('[data-cell="checklist"]'));
    renderWeeklyReport(q('[data-cell="weekly"]'));
    renderGoals(q('[data-cell="goals"]'));
    var recEl = q('[data-cell="recommend"]');
    var rec = scoreRecommendation(computeScore().breakdown);
    recEl.innerHTML = '<div class="s6-week-card"><h3>Roadie Recommendation</h3>' + roadie(rec) + '</div>';
    var actEl = q('[data-cell="activity"]');
    actEl.innerHTML = '<div class="s6-week-card"><h3>Recent Activity</h3>' +
      emptyState('No recent activity yet.', 'Your latest exhibit updates will appear here.') + '</div>';
    track('artist_success_dashboard_viewed', {});
  }

  /* ============================================================
     MOUNT SYSTEM  \u2014  [data-sprint6="..."]
     ============================================================ */
  var RENDERERS = {
    'score':      renderScore,
    'checklist':  renderChecklist,
    'founding':   renderFounding,
    'badges':     renderBadges,
    'weekly':     renderWeeklyReport,
    'goals':      renderGoals,
    'sharing':    renderSharing,
    'linkhub':    renderLinkHub,
    'media-organizer': renderMediaOrganizer,
    'dashboard':  renderDashboard
  };

  function mountAll() {
    var nodes = document.querySelectorAll('[data-sprint6]');
    nodes.forEach(function (el) {
      if (el.getAttribute('data-s6-mounted') === '1') return;
      var kind = el.getAttribute('data-sprint6');
      var fn = RENDERERS[kind];
      if (!fn) return;
      try { fn(el); el.setAttribute('data-s6-mounted', '1'); }
      catch (e) { if (window.console) console.warn('[AIMC success] mount failed:', kind, e); }
    });
  }

  function init() {
    try { mountAll(); } catch (e) {}
    try { bindVisitorJourney(); } catch (e) {}
  }

  /* Public API so Neon/EMG LOOP can drive re-renders later. */
  window.AIMCSuccess = {
    ExhibitScore: ExhibitScore,
    badges: BADGES,
    checklist: CHECKLIST_ITEMS,
    goals: GOALS,
    visitorJourney: VisitorJourney,
    render: RENDERERS,
    remount: function () { document.querySelectorAll('[data-sprint6]').forEach(function (n) { n.removeAttribute('data-s6-mounted'); }); mountAll(); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
