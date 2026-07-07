/*!
 * ArtistsInMyCity — Sprint 7 (v4.0) — The Digital Exhibit Experience
 * Extends the existing platform. Placeholders + localStorage today;
 * clean interfaces so Neon + Claude + EMG LOOP can replace placeholders later.
 * Soft-depends on: AIMCComponents, AIMCLoop, RoadieMemory, AIMCTimeline, AIMCSuccess.
 * Never throws if a dependency is absent.
 */
(function () {
  'use strict';
  if (window.__AIMC_EXPERIENCE__) return;
  window.__AIMC_EXPERIENCE__ = true;

  /* ---------- soft dependency shims ---------- */
  var C = window.AIMCComponents || {};
  function track(name, payload) {
    try {
      if (window.AIMCLoop && typeof window.AIMCLoop.track === 'function') window.AIMCLoop.track(name, payload || {});
      else if (typeof window.aimcTrack === 'function') window.aimcTrack(name, payload || {});
    } catch (e) {}
  }
  function timelinePush(type, label) { try { if (window.AIMCTimeline && window.AIMCTimeline.push) window.AIMCTimeline.push(type, label); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]; }); }
  function emptyState(t, s) { return C.emptyState ? C.emptyState(t, s) : ('<div class="s5-empty"><h4 class="s5-empty-title">' + esc(t) + '</h4><p class="s5-empty-sub">' + esc(s || '') + '</p></div>'); }
  function roadie(msg, actions) { return C.roadiePrompt ? C.roadiePrompt(msg, actions) : ('<div class="s5-roadie-card"><span class="s5-roadie-avatar">R</span><div class="s5-roadie-body"><p>' + esc(msg) + '</p></div></div>'); }

  /* ---------- storage ---------- */
  function read(key, fallback) { try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (e) { return fallback; } }
  function write(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  var K = {
    sections: 'aimc.exhibit.sections.v1',
    theme:    'aimc.exhibit.theme.v1',       /* shared with Sprint 5 */
    device:   'aimc.exhibit.previewDevice.v1',
    suggestions: 'aimc.roadie.designSuggestions.v1',
    story:    'aimc.exhibit.story.v1',
    viewed:   'aimc.exhibit.recentlyViewed.v1'
  };

  /* ============================================================
     DATA MODELS
     ============================================================ */
  /* TASK 1 — exhibit sections */
  var DEFAULT_SECTIONS = [
    { key: 'hero',        label: 'Hero',            show: true },
    { key: 'statement',   label: 'Artist Statement',show: true },
    { key: 'featured',    label: 'Featured Work',   show: true },
    { key: 'gallery',     label: 'Gallery',         show: true },
    { key: 'collections', label: 'Collections',     show: true },
    { key: 'music',       label: 'Music',           show: false },
    { key: 'videos',      label: 'Videos',          show: false },
    { key: 'events',      label: 'Events',          show: true },
    { key: 'press',       label: 'Press',           show: false },
    { key: 'awards',      label: 'Awards',          show: false },
    { key: 'booking',     label: 'Booking',         show: true },
    { key: 'store',       label: 'Store',           show: false },
    { key: 'social',      label: 'Social Links',    show: true },
    { key: 'contact',     label: 'Contact',         show: true },
    { key: 'roadienotes', label: 'Roadie Notes',    show: true }
  ];
  function getSections() {
    var saved = read(K.sections, null);
    if (!saved || !Array.isArray(saved) || !saved.length) return DEFAULT_SECTIONS.map(function (s) { return { key: s.key, label: s.label, show: s.show }; });
    /* merge in any new default sections not yet stored */
    var have = {}; saved.forEach(function (s) { have[s.key] = true; });
    DEFAULT_SECTIONS.forEach(function (d) { if (!have[d.key]) saved.push({ key: d.key, label: d.label, show: d.show }); });
    return saved;
  }
  function saveSections(list) { write(K.sections, list); }

  /* TASK 2 — premium themes */
  var THEMES = [
    { key: 'gallery',     name: 'Gallery',     bestFor: 'Painters & mixed media', desc: 'Museum aesthetic. Large white space. Editorial typography.', grad: 'linear-gradient(135deg,#f5f5f2,#dcdcd6)', rec: 'Gallery suits work that deserves room to breathe on a clean canvas.' },
    { key: 'luxury',      name: 'Luxury',      bestFor: 'Premium collections',   desc: 'Dark velvet. Gold accents. Large hero.', grad: 'linear-gradient(135deg,#1a1206,#3a2a0a)', rec: 'Luxury frames high-value collections with a rich, gold-accented hero.' },
    { key: 'photography', name: 'Photography', bestFor: 'Photographers & film',   desc: 'Huge edge-to-edge imagery. Minimal interface.', grad: 'linear-gradient(135deg,#0b0b0f,#2a2a33)', rec: 'Photography works well because your exhibit contains mostly visual work.' },
    { key: 'music',       name: 'Music',       bestFor: 'Musicians & DJs',        desc: 'Concert inspired. Featured player. Timeline.', grad: 'linear-gradient(135deg,#150a2a,#3a1a5a)', rec: 'Music puts a featured player and timeline front and centre.' },
    { key: 'street',      name: 'Street',      bestFor: 'Murals & street art',    desc: 'Graffiti. Bold cards. Layered sections.', grad: 'linear-gradient(135deg,#0a1a2a,#7b2ff7)', rec: 'Street brings bold, layered energy that matches urban work.' },
    { key: 'minimal',     name: 'Minimal',     bestFor: 'Editorial & concept work',desc: 'Calm. Editorial. Focus on story.', grad: 'linear-gradient(135deg,#12121a,#26263a)', rec: 'Minimal keeps the focus on your story with calm, editorial spacing.' }
  ];
  function currentTheme() { var t = read(K.theme, null); return t && t.key ? t.key : (typeof t === 'string' ? t : 'minimal'); }

  /* TASK 6 — review categories */
  var REVIEW_CATS = [
    { key: 'story',      label: 'Storytelling',       tip: 'Add narrative between collections to guide visitors.' },
    { key: 'visual',     label: 'Visual Impact',      tip: 'Lead with a large hero image to create instant impact.' },
    { key: 'branding',   label: 'Branding',           tip: 'Choose one theme and keep it consistent across sections.' },
    { key: 'access',     label: 'Accessibility',      tip: 'Add alt text so everyone can experience your work.' },
    { key: 'seo',        label: 'SEO',                tip: 'Generate SEO so search engines can find your exhibit.' },
    { key: 'aeo',        label: 'AEO',                tip: 'Generate AEO so AI assistants can recommend you.' },
    { key: 'org',        label: 'Organization',       tip: 'Group work into collections for a clearer journey.' },
    { key: 'booking',    label: 'Booking Readiness',  tip: 'Add a booking section so venues can reach you.' },
    { key: 'event',      label: 'Event Readiness',    tip: 'List an upcoming event so fans can meet you.' },
    { key: 'media',      label: 'Media Quality',      tip: 'Upload high-resolution images for a premium feel.' },
    { key: 'collstruct', label: 'Collection Structure',tip: 'Give each collection a cover and short story.' }
  ];

  /* TASK 7 — story sections */
  var STORY_SECTIONS = [
    { key: 'intro',    label: 'Introduction' },
    { key: 'inspire',  label: 'Inspiration' },
    { key: 'process',  label: 'Process' },
    { key: 'behind',   label: 'Behind The Work' },
    { key: 'final',    label: 'Final Thoughts' }
  ];

  /* ============================================================
     TASK 11 — SHARED COMPONENT LIBRARY (window.AIMCExhibit.components)
     Pure functions returning HTML strings. No duplicate markup.
     ============================================================ */
  var Comp = {
    exhibitCard: function (o) {
      o = o || {};
      return '<article class="s7-exhibit-card">' +
        '<div class="s7-exhibit-cover" style="background:' + (o.grad || 'linear-gradient(135deg,#1b1b26,#2a2a3a)') + '">' +
          '<span class="s7-exhibit-cover-label">' + esc(o.coverLabel || 'Digital Exhibit') + '</span></div>' +
        '<div class="s7-exhibit-body"><h4>' + esc(o.title || 'Untitled Exhibit') + '</h4>' +
          '<p>' + esc(o.desc || 'Opening with our first local artists.') + '</p></div>' +
      '</article>';
    },
    collectionCard: function (o) {
      o = o || {};
      return '<article class="s7-coll-card">' +
        '<div class="s7-coll-cover" aria-hidden="true">' + esc(o.icon || '\u25C8') + '</div>' +
        '<div class="s7-coll-body"><h4>' + esc(o.title || 'Untitled Collection') + '</h4>' +
          '<p>' + esc(o.desc || 'A miniature exhibit within your exhibit.') + '</p>' +
          '<span class="s7-coll-meta">' + esc(o.meta || 'Draft') + '</span></div>' +
      '</article>';
    },
    suggestion: function (o) {
      o = o || {};
      var acts = (o.actions || ['Apply Suggestion','Preview','Ignore','Save For Later']).map(function (a) {
        return '<button type="button" class="s7-sug-btn" data-sug-action="' + esc(a) + '">' + esc(a) + '</button>';
      }).join('');
      return '<div class="s7-sug-card" data-sug="' + esc(o.id || '') + '">' +
        '<span class="s7-sug-avatar" aria-hidden="true">R</span>' +
        '<div class="s7-sug-body"><p class="s7-sug-text">' + esc(o.text || '') + '</p>' +
          '<div class="s7-sug-actions">' + acts + '</div></div>' +
      '</div>';
    },
    insight: function (o) {
      o = o || {};
      return '<div class="s7-insight-card">' +
        '<span class="s7-insight-tag">Preview</span>' +
        '<p class="s7-insight-text">' + esc(o.text || '') + '</p>' +
      '</div>';
    },
    themeCard: function (t, active) {
      return '<div class="s7-theme-card' + (active ? ' is-active' : '') + '" data-theme="' + esc(t.key) + '">' +
        '<div class="s7-theme-preview" style="background:' + t.grad + '"></div>' +
        '<div class="s7-theme-info"><h4>' + esc(t.name) + '</h4>' +
          '<span class="s7-theme-bestfor">Best for: ' + esc(t.bestFor) + '</span>' +
          '<p class="s7-theme-desc">' + esc(t.desc) + '</p></div>' +
        '<div class="s7-theme-actions">' +
          '<button type="button" class="s5-btn s5-btn-primary" data-theme-select="' + esc(t.key) + '">' + (active ? 'Selected' : 'Select') + '</button>' +
          '<button type="button" class="s5-btn" data-theme-preview="' + esc(t.key) + '">Preview</button>' +
        '</div></div>';
    },
    storyBlock: function (o) {
      o = o || {};
      var body = o.text ? ('<p class="s7-story-text">' + esc(o.text) + '</p>') : ('<p class="s7-story-empty">' + esc(o.placeholder || 'Add your words here \u2014 tell visitors this part of the story.') + '</p>');
      return '<section class="s7-story-block"><h3 class="s7-story-h">' + esc(o.label) + '</h3>' + body +
        '<button type="button" class="s7-story-edit" data-story="' + esc(o.key) + '">' + (o.text ? 'Edit' : 'Add') + '</button></section>';
    },
    sharePanel: function (o) {
      o = o || {};
      return '<div class="s7-share-panel"><h4>Share this Exhibit</h4>' +
        '<div class="s7-share-row">' +
          '<button type="button" class="s5-btn s5-btn-primary" data-x7-share="copy">Copy Link</button>' +
          '<button type="button" class="s5-btn" data-x7-share="native">Share</button>' +
          '<button type="button" class="s5-btn" data-x7-share="qr">Generate QR</button>' +
        '</div></div>';
    },
    qrPanel: function () {
      return '<div class="s7-qr-panel"><div class="s7-qr-box" aria-hidden="true">\u2317</div>' +
        '<p class="s7-qr-cap">QR preview (placeholder). Print it and display it beside your work.</p></div>';
    },
    scoreCard: function () {
      try { if (window.AIMCSuccess && window.AIMCSuccess.render && window.AIMCSuccess.render.score) { var d = document.createElement('div'); window.AIMCSuccess.render.score(d); return d.innerHTML; } } catch (e) {}
      return roadie('Your Exhibit Score will appear here.');
    }
  };

  /* ============================================================
     RENDERERS
     ============================================================ */

  /* TASK 1 — Digital Exhibit Designer */
  function renderDesigner(el) {
    function paint() {
      var sections = getSections();
      var device = read(K.device, 'desktop');
      var rows = sections.map(function (s, i) {
        return '<li class="s7-sec-row' + (s.show ? '' : ' is-hidden') + '" data-idx="' + i + '">' +
          '<span class="s7-sec-handle" aria-hidden="true">\u2261</span>' +
          '<span class="s7-sec-name">' + esc(s.label) + '</span>' +
          '<span class="s7-sec-tools">' +
            '<button type="button" class="s7-sec-btn" data-sec="show" title="Show / Hide" aria-label="Show or hide ' + esc(s.label) + '">' + (s.show ? '\uD83D\uDC41' : '\u2298') + '</button>' +
            '<button type="button" class="s7-sec-btn" data-sec="up" title="Move up" aria-label="Move up">\u2191</button>' +
            '<button type="button" class="s7-sec-btn" data-sec="down" title="Move down" aria-label="Move down">\u2193</button>' +
            '<button type="button" class="s7-sec-btn" data-sec="dup" title="Duplicate (soon)" aria-label="Duplicate">\u2398</button>' +
          '</span></li>';
      }).join('');
      var previewInner = sections.filter(function (s) { return s.show; }).map(function (s) {
        return '<div class="s7-pv-block s7-pv-' + s.key + '"><span class="s7-pv-label">' + esc(s.label) + '</span>' +
          '<span class="s7-pv-hint">This section is ready for your work.</span></div>';
      }).join('');
      el.innerHTML =
        '<div class="s7-designer">' +
          '<div class="s7-designer-head"><h2>Design My Exhibit</h2>' +
            '<p class="s7-sub">You\u2019re designing an exhibition, not editing a profile. Arrange your sections and watch the preview update.</p></div>' +
          '<div class="s7-designer-grid">' +
            '<div class="s7-designer-left"><h3 class="s7-panel-h">Exhibit Sections</h3>' +
              '<ul class="s7-sec-list" data-drag-future="1">' + rows + '</ul>' +
              '<p class="s7-tinynote">Drag &amp; drop coming soon. Use the arrows to reorder for now.</p></div>' +
            '<div class="s7-designer-right"><div class="s7-pv-head"><h3 class="s7-panel-h">Live Preview</h3>' +
              '<div class="s7-pv-devices" role="tablist">' +
                ['desktop','tablet','mobile'].map(function (d) { return '<button type="button" class="s7-pv-device' + (device === d ? ' is-active' : '') + '" data-device="' + d + '">' + d.charAt(0).toUpperCase() + d.slice(1) + '</button>'; }).join('') +
              '</div></div>' +
              '<div class="s7-pv-frame s7-pv-' + device + '"><div class="s7-pv-scroll">' + previewInner + '</div></div>' +
            '</div>' +
          '</div>' +
        '</div>';
      /* wire section tools */
      el.querySelectorAll('.s7-sec-row').forEach(function (row) {
        var idx = parseInt(row.getAttribute('data-idx'), 10);
        row.querySelectorAll('[data-sec]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var act = btn.getAttribute('data-sec'); var list = getSections();
            if (act === 'show') { list[idx].show = !list[idx].show; }
            else if (act === 'up' && idx > 0) { var t = list[idx - 1]; list[idx - 1] = list[idx]; list[idx] = t; track('exhibit_section_reordered', { key: list[idx - 1].key, dir: 'up' }); }
            else if (act === 'down' && idx < list.length - 1) { var t2 = list[idx + 1]; list[idx + 1] = list[idx]; list[idx] = t2; track('exhibit_section_reordered', { key: list[idx + 1].key, dir: 'down' }); }
            else if (act === 'dup') { timelinePush('roadie_suggestion', 'Duplicate section coming soon: ' + list[idx].label); }
            saveSections(list); paint();
          });
        });
      });
      /* wire device toggles */
      el.querySelectorAll('[data-device]').forEach(function (b) {
        b.addEventListener('click', function () { write(K.device, b.getAttribute('data-device')); paint(); });
      });
    }
    paint();
  }

  /* TASK 2 — Premium Exhibit Themes */
  function renderThemes(el) {
    function paint() {
      var active = currentTheme();
      var cards = THEMES.map(function (t) { return Comp.themeCard(t, t.key === active); }).join('');
      var activeTheme = THEMES.filter(function (t) { return t.key === active; })[0] || THEMES[THEMES.length - 1];
      el.innerHTML =
        '<div class="s7-themes"><div class="s7-designer-head"><h2>Premium Exhibit Themes</h2>' +
          '<p class="s7-sub">Each theme is a complete experience. Selecting one updates your preview instantly.</p></div>' +
          '<div class="s7-theme-preview-bar" style="background:' + activeTheme.grad + '"><span>' + esc(activeTheme.name) + ' theme preview</span></div>' +
          roadie('Roadie recommends: ' + activeTheme.rec) +
          '<div class="s7-theme-grid">' + cards + '</div>' +
        '</div>';
      el.querySelectorAll('[data-theme-select]').forEach(function (b) {
        b.addEventListener('click', function () {
          var key = b.getAttribute('data-theme-select');
          write(K.theme, { key: key });
          try { if (window.RoadieMemory && window.RoadieMemory.rememberTheme) window.RoadieMemory.rememberTheme(key); } catch (e) {}
          track('theme_selected', { theme: key });
          timelinePush('roadie_suggestion', 'Theme selected: ' + key);
          paint();
        });
      });
      el.querySelectorAll('[data-theme-preview]').forEach(function (b) {
        b.addEventListener('click', function () {
          var key = b.getAttribute('data-theme-preview');
          var t = THEMES.filter(function (x) { return x.key === key; })[0];
          var bar = el.querySelector('.s7-theme-preview-bar');
          if (bar && t) { bar.style.background = t.grad; bar.querySelector('span').textContent = t.name + ' theme preview'; }
          track('theme_previewed', { theme: key });
        });
      });
    }
    paint();
  }

  /* TASK 3 — Roadie Design Mode */
  var DESIGN_SUGGESTIONS = [
    { id: 'gallery-top',   text: 'Move your gallery above your biography \u2014 visitors respond to visuals first.' },
    { id: 'hero-larger',   text: 'Your hero image should be larger to create instant impact.' },
    { id: 'theme-fit',     text: 'This theme better fits your work. Try the Photography theme for a visual exhibit.' },
    { id: 'statement-top', text: 'Visitors usually respond well to artist statements near the top.' }
  ];
  function renderDesignMode(el) {
    function paint() {
      var state = read(K.suggestions, {});
      var open = DESIGN_SUGGESTIONS.filter(function (s) { return state[s.id] !== 'ignored' && state[s.id] !== 'applied'; });
      var cards = open.length
        ? open.map(function (s) { return Comp.suggestion(s); }).join('')
        : emptyState('Roadie has no new suggestions right now.', 'Keep designing \u2014 Roadie will surface ideas as your exhibit grows.');
      el.innerHTML = '<div class="s7-designmode"><div class="s7-designer-head"><h2>Roadie Design Mode</h2>' +
        '<p class="s7-sub">Roadie is your Creative Director. Apply, preview, ignore, or save suggestions for later.</p></div>' + cards + '</div>';
      el.querySelectorAll('.s7-sug-card').forEach(function (card) {
        var id = card.getAttribute('data-sug');
        card.querySelectorAll('[data-sug-action]').forEach(function (btn) {
          btn.addEventListener('click', function () {
            var a = btn.getAttribute('data-sug-action'); var st = read(K.suggestions, {});
            if (a === 'Apply Suggestion') { st[id] = 'applied'; track('roadie_suggestion_applied', { id: id }); }
            else if (a === 'Ignore') { st[id] = 'ignored'; track('roadie_suggestion_ignored', { id: id }); }
            else if (a === 'Save For Later') { st[id] = 'saved'; track('roadie_design_suggestion', { id: id, action: 'saved' }); }
            else { track('roadie_design_suggestion', { id: id, action: 'preview' }); return; }
            write(K.suggestions, st); paint();
          });
        });
      });
    }
    track('roadie_design_suggestion', { shown: true });
    paint();
  }

  /* TASK 4 — Public Digital Exhibit Experience (presentation only) */
  var PUBLIC_ORDER = [
    { key: 'hero',     label: 'Hero' },
    { key: 'name',     label: 'Artist Name' },
    { key: 'statement',label: 'Artist Statement' },
    { key: 'featured', label: 'Featured Collection' },
    { key: 'gallery',  label: 'Gallery' },
    { key: 'videos',   label: 'Videos' },
    { key: 'music',    label: 'Music' },
    { key: 'events',   label: 'Upcoming Events' },
    { key: 'press',    label: 'Press' },
    { key: 'awards',   label: 'Awards' },
    { key: 'booking',  label: 'Booking' },
    { key: 'store',    label: 'Store' },
    { key: 'share',    label: 'Share' },
    { key: 'qr',       label: 'QR Code' },
    { key: 'roadierec',label: 'Roadie Recommended' }
  ];
  function renderPublicExhibit(el) {
    var theme = currentTheme();
    var blocks = PUBLIC_ORDER.map(function (s) {
      if (s.key === 'hero') return '<section class="s7-x-hero"><span class="s7-x-kicker">Digital Exhibit</span>' +
        '<h1 class="s7-x-title">Your Exhibit Opens Here</h1>' +
        '<p class="s7-x-lead">A premium space for your work. Opening with our first local artists.</p></section>';
      if (s.key === 'share') return '<section class="s7-x-block">' + Comp.sharePanel({}) + '</section>';
      if (s.key === 'qr') return '<section class="s7-x-block">' + Comp.qrPanel() + '</section>';
      if (s.key === 'roadierec') return '<section class="s7-x-block">' + roadie('Roadie recommends featuring your strongest collection near the top.') + '</section>';
      return '<section class="s7-x-block s7-x-' + s.key + '"><h2 class="s7-x-h">' + esc(s.label) + '</h2>' +
        emptyState(s.label + ' will appear here.', 'This is how visitors will walk through your exhibit.') + '</section>';
    }).join('');
    el.innerHTML = '<div class="s7-exhibit s7-theme-' + theme + '">' + blocks + '</div>';
    track('exhibit_review_opened', { context: 'public_preview' });
  }

  /* TASK 5 — Collection Experience (mini exhibits) */
  function renderCollectionExperience(el) {
    var collections = read('aimc.collections.v1', []);
    if (!collections || !collections.length) {
      el.innerHTML = '<div class="s7-coll-exp"><div class="s7-designer-head"><h2>Collections</h2>' +
        '<p class="s7-sub">Each collection is a miniature exhibit \u2014 a hero, a story, and a gallery of its own.</p></div>' +
        emptyState('Your first collection is waiting.', 'Create a collection in My Studio and it becomes a mini exhibit here.') +
        roadie('Roadie tip: give each collection a cover and a one-line story so it feels like its own room.') + '</div>';
      return;
    }
    var cards = collections.map(function (c) { return Comp.collectionCard({ title: c.title || 'Untitled Collection', desc: c.description || '', meta: c.visibility || 'Draft', icon: '\u25C8' }); }).join('');
    el.innerHTML = '<div class="s7-coll-exp"><div class="s7-designer-head"><h2>Collections</h2>' +
      '<p class="s7-sub">Each collection is a miniature exhibit.</p></div>' +
      '<div class="s7-coll-grid7">' + cards + '</div>' +
      roadie('Roadie tip: link related collections so visitors keep exploring.') + '</div>';
    el.querySelectorAll('.s7-coll-card').forEach(function (card) {
      card.addEventListener('click', function () { track('collection_opened', {}); timelinePush('collection_viewed', 'Opened a collection'); });
    });
  }

  /* TASK 6 — Roadie Exhibit Review (placeholder logic) */
  function reviewStatus(cat) {
    /* derive a friendly placeholder status from existing local signals */
    var checklist = read('aimc.success.checklist.v1', {});
    var collections = read('aimc.collections.v1', []);
    var map = {
      story:      (read(K.story, {}).intro ? 'Good' : 'Needs Attention'),
      visual:     (checklist.cover ? 'Good' : 'Needs Attention'),
      branding:   (read(K.theme, null) ? 'Good' : 'Needs Attention'),
      access:     'Needs Attention',
      seo:        (checklist.seo ? 'Good' : 'Missing'),
      aeo:        (checklist.aeo ? 'Good' : 'Missing'),
      org:        ((collections || []).length ? 'Good' : 'Needs Attention'),
      booking:    'Needs Attention',
      event:      'Needs Attention',
      media:      (checklist.artwork ? 'Good' : 'Missing'),
      collstruct: ((collections || []).length ? 'Good' : 'Missing')
    };
    return map[cat] || 'Needs Attention';
  }
  function renderReview(el) {
    var rows = REVIEW_CATS.map(function (c) {
      var st = reviewStatus(c.key);
      var cls = st === 'Excellent' ? 's7-rv-exc' : (st === 'Good' ? 's7-rv-good' : (st === 'Needs Attention' ? 's7-rv-att' : 's7-rv-miss'));
      return '<li class="s7-rv-row ' + cls + '"><span class="s7-rv-dot" aria-hidden="true"></span>' +
        '<div class="s7-rv-main"><span class="s7-rv-name">' + esc(c.label) + '</span>' +
        '<span class="s7-rv-tip">' + esc(c.tip) + '</span></div>' +
        '<span class="s7-rv-state">' + st + '</span></li>';
    }).join('');
    el.innerHTML = '<div class="s7-review"><div class="s7-designer-head"><h2>Roadie\u2019s Exhibit Review</h2>' +
      '<p class="s7-sub">One recommendation per category. A preview of the deeper review coming with Claude.</p></div>' +
      '<ul class="s7-rv-list">' + rows + '</ul></div>';
    track('exhibit_review_opened', { context: 'studio' });
  }

  /* TASK 7 — Exhibit Story Mode */
  function renderStoryMode(el) {
    function paint() {
      var story = read(K.story, {});
      var blocks = STORY_SECTIONS.map(function (s) { return Comp.storyBlock({ key: s.key, label: s.label, text: story[s.key] }); }).join('');
      el.innerHTML = '<div class="s7-story"><div class="s7-designer-head"><h2>Exhibit Story Mode</h2>' +
        '<p class="s7-sub">Add narrative between your collections so visitors feel like they are walking through a story.</p></div>' +
        blocks + roadie('Roadie recommendation: a short Introduction sets the tone before the first collection.') + '</div>';
      el.querySelectorAll('[data-story]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var key = btn.getAttribute('data-story'); var st = read(K.story, {});
          var val = window.prompt('Write your ' + key + ' text:', st[key] || '');
          if (val === null) return;
          if (val) st[key] = val; else delete st[key];
          write(K.story, st); track('collection_story_added', { section: key });
          timelinePush('roadie_suggestion', 'Story added: ' + key); paint();
        });
      });
    }
    track('story_mode_opened', {}); paint();
  }

  /* TASK 8 — Visitor Experience */
  function renderVisitor(el) {
    var blocks = [
      { h: 'Continue Exploring', s: 'Pick up where you left off. Your journey saves as you go.' },
      { h: 'Related Exhibits',   s: 'Opening with our first local artists.' },
      { h: 'Nearby Artists',     s: 'We\u2019ll surface artists near you as they join.' },
      { h: "Roadie's Picks",     s: 'Roadie is learning your taste.' },
      { h: 'Recently Viewed',    s: 'Exhibits you visit will appear here.' }
    ].map(function (b) { return '<div class="s7-visitor-card"><h4>' + esc(b.h) + '</h4>' + emptyState(b.s, '') + '</div>'; }).join('');
    el.innerHTML = '<div class="s7-visitor"><div class="s7-designer-head"><h2>For Visitors</h2>' +
      '<p class="s7-sub">The guest experience \u2014 save, follow, share, and keep exploring.</p></div>' +
      '<div class="s7-visitor-grid">' + blocks + '</div>' +
      '<div class="s7-visitor-actions">' +
        '<button type="button" class="s5-btn s5-btn-primary" data-x7-visitor="save">Save Exhibit</button>' +
        '<button type="button" class="s5-btn" data-x7-visitor="follow">Follow Artist</button>' +
        '<button type="button" class="s5-btn" data-x7-visitor="share">Share</button>' +
        '<button type="button" class="s5-btn" data-x7-visitor="qr">Generate QR</button>' +
      '</div>' + Comp.qrPanel().replace('s7-qr-panel','s7-qr-panel s7-qr-hidden') + '</div>';
    el.querySelectorAll('[data-x7-visitor]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.getAttribute('data-x7-visitor');
        if (k === 'qr') { var q = el.querySelector('.s7-qr-panel'); if (q) q.classList.remove('s7-qr-hidden'); track('qr_generated', {}); }
        else if (k === 'share') { track('share_panel_opened', {}); }
        else if (k === 'save') { timelinePush('exhibit_saved', 'Saved an exhibit'); track('exhibit_saved', {}); }
        else if (k === 'follow') { timelinePush('artist_followed', 'Followed an artist'); track('artist_followed', {}); }
      });
    });
  }

  /* TASK 9 — Roadie Creative Insights */
  function renderInsights(el) {
    var insights = [
      'Visitors tend to spend the most time in your gallery.',
      'Your artist statement is short \u2014 a few more lines helps visitors connect.',
      'You haven\u2019t highlighted your strongest collection yet.',
      'Consider featuring one standout piece near the top of your exhibit.'
    ].map(function (t) { return Comp.insight({ text: t }); }).join('');
    el.innerHTML = '<div class="s7-insights"><div class="s7-designer-head"><h2>Roadie Creative Insights</h2>' +
      '<p class="s7-sub">Clearly-marked previews. Real insights arrive with EMG LOOP \u2014 no fabricated analytics.</p></div>' +
      '<div class="s7-insight-grid">' + insights + '</div></div>';
  }

  /* ============================================================
     MOUNT SYSTEM  \u2014  [data-sprint7="..."]
     ============================================================ */
  var RENDERERS = {
    'designer':    renderDesigner,
    'themes':      renderThemes,
    'design-mode': renderDesignMode,
    'public-exhibit': renderPublicExhibit,
    'collections': renderCollectionExperience,
    'review':      renderReview,
    'story':       renderStoryMode,
    'visitor':     renderVisitor,
    'insights':    renderInsights
  };

  function mountAll() {
    document.querySelectorAll('[data-sprint7]').forEach(function (el) {
      if (el.getAttribute('data-s7-mounted') === '1') return;
      var kind = el.getAttribute('data-sprint7');
      var fn = RENDERERS[kind]; if (!fn) return;
      try { fn(el); el.setAttribute('data-s7-mounted', '1'); }
      catch (e) { if (window.console) console.warn('[AIMC experience] mount failed:', kind, e); }
    });
  }

  /* record a recently-viewed placeholder entry on public exhibit pages */
  function noteVisit() {
    try {
      if (!document.querySelector('[data-sprint7="public-exhibit"]')) return;
      var v = read(K.viewed, []); v.unshift({ t: Date.now() }); write(K.viewed, v.slice(0, 10));
    } catch (e) {}
  }

  function init() { try { mountAll(); } catch (e) {} try { noteVisit(); } catch (e) {} }

  window.AIMCExhibit = {
    components: Comp,
    themes: THEMES,
    reviewCats: REVIEW_CATS,
    getSections: getSections,
    currentTheme: currentTheme,
    render: RENDERERS,
    remount: function () { document.querySelectorAll('[data-sprint7]').forEach(function (n) { n.removeAttribute('data-s7-mounted'); }); mountAll(); }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
