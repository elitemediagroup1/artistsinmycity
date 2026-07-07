/*
 * ArtistsInMyCity - Sprint 5 (v3.0) shared experience layer
 * ---------------------------------------------------------
 * A single, reusable script loaded site-wide via the integrations loader.
 * It provides:
 *   - AIMCComponents: reusable render helpers (cards, empty states, etc.)
 *   - Command palette (Ctrl/Cmd+K and '/')
 *   - Notification center (bell in nav)
 *   - Mount points for Theme Builder, Collections, Media Intelligence,
 *     Fan Personalization, and Audience Timeline via [data-sprint5] hooks.
 * Everything uses localStorage/placeholders. No fake artists or events.
 * No API keys. Existing design language preserved.
 */
(function (window, document) {
  'use strict';
  if (window.__AIMC_SPRINT5__) { return; }
  window.__AIMC_SPRINT5__ = true;

  // ---- helpers ----
  function loop(name, payload) {
    try {
      if (window.AIMCLoop && typeof window.AIMCLoop.track === 'function') { window.AIMCLoop.track(name, payload || {}); }
    } catch (e) {}
  }
  function ga(name, payload) {
    try { if (window.AIMC && typeof window.AIMC.trackEvent === 'function') { window.AIMC.trackEvent(name, payload || {}); } } catch (e) {}
  }
  function track(name, payload) { loop(name, payload); ga(name, payload); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (html != null) { n.innerHTML = html; }
    return n;
  }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function ls(key, val) {
    try {
      if (typeof val === 'undefined') { var r = window.localStorage.getItem(key); return r ? JSON.parse(r) : null; }
      window.localStorage.setItem(key, JSON.stringify(val)); return val;
    } catch (e) { return null; }
  }

  // ---- Task 11: reusable components ----
  var Components = {
    emptyState: function (title, subtitle) {
      return '<div class="s5-empty"><div class="s5-empty-glow"></div>' +
        '<h4 class="s5-empty-title">' + esc(title) + '</h4>' +
        (subtitle ? '<p class="s5-empty-sub">' + esc(subtitle) + '</p>' : '') + '</div>';
    },
    roadiePrompt: function (message, actions) {
      var btns = (actions || []).map(function (a) {
        return '<button type="button" class="s5-roadie-btn" data-s5-action="' + esc(a.event || '') + '">' + esc(a.label) + '</button>';
      }).join('');
      return '<div class="s5-roadie-card"><span class="s5-roadie-avatar">R</span>' +
        '<div class="s5-roadie-body"><p>' + esc(message) + '</p>' +
        (btns ? '<div class="s5-roadie-actions">' + btns + '</div>' : '') + '</div></div>';
    },
    metricCard: function (label, value, hint) {
      return '<div class="s5-metric"><span class="s5-metric-label">' + esc(label) + '</span>' +
        '<span class="s5-metric-value">' + esc(value == null ? '\u2014' : value) + '</span>' +
        (hint ? '<span class="s5-metric-hint">' + esc(hint) + '</span>' : '') + '</div>';
    },
    cityCard: function (city) {
      return '<a class="s5-city-card" href="/cities/' + esc(String(city).toLowerCase().replace(/\s+/g, '-')) + '.html">' +
        '<span class="s5-city-name">' + esc(city) + '</span>' +
        '<span class="s5-city-tag">Opening with our first local artists</span></a>';
    },
    exhibitCard: function (opts) {
      opts = opts || {};
      return '<div class="s5-exhibit-card"><div class="s5-exhibit-cover"></div>' +
        '<div class="s5-exhibit-meta"><span class="s5-exhibit-title">' + esc(opts.title || 'Waiting for its first artist') + '</span>' +
        '<span class="s5-exhibit-sub">' + esc(opts.subtitle || 'Digital Exhibit') + '</span></div></div>';
    },
    recommendationCard: function (card) {
      card = card || {};
      return '<div class="s5-rec-card"><span class="s5-rec-badge">Preview</span>' +
        '<h5 class="s5-rec-title">' + esc(card.title || '') + '</h5>' +
        '<p class="s5-rec-note">' + esc(card.note || '') + '</p></div>';
    },
    notificationItem: function (n) {
      return '<li class="s5-note-item s5-note-' + esc(n.type || 'info') + '">' +
        '<span class="s5-note-dot"></span><div class="s5-note-text">' +
        '<strong>' + esc(n.title || '') + '</strong>' +
        (n.body ? '<span>' + esc(n.body) + '</span>' : '') + '</div></li>';
    }
  };
  window.AIMCComponents = Components;

  // ---- Task 10: Universal Command Palette ----
  var PALETTE_ITEMS = [
    { group: 'Explore', label: 'Cities', href: '/pages/cities.html' },
    { group: 'Explore', label: 'Categories', href: '/pages/categories.html' },
    { group: 'Explore', label: 'Events', href: '/pages/events.html' },
    { group: 'Explore', label: 'Discover', href: '/pages/discover.html' },
    { group: 'Studio', label: 'My Studio', href: '/dashboard/artist-studio.html' },
    { group: 'Studio', label: 'My Exhibit', href: '/pages/exhibit-builder.html' },
    { group: 'Studio', label: 'Gallery', href: '/dashboard/media.html' },
    { group: 'Studio', label: 'Insights', href: '/dashboard/analytics.html' },
    { group: 'Roadie', label: 'Open Roadie AI', action: 'roadie' },
    { group: 'Roadie', label: 'Start a search', action: 'search' },
    { group: 'Join', label: 'Join as Artist', href: '/pages/artist-signup.html' },
    { group: 'Join', label: 'Join as Fan', href: '/pages/fan-signup.html' },
    { group: 'Join', label: 'Artist Onboarding', href: '/pages/artist-onboarding.html' },
    { group: 'Info', label: 'About', href: '/pages/about.html' },
    { group: 'Info', label: 'Contact', href: '/pages/contact.html' }
  ];
  var paletteEl = null, paletteInput = null, paletteList = null, paletteIndex = 0, paletteFiltered = [];

  function isTyping(e) {
    var t = e.target;
    if (!t) { return false; }
    var tag = (t.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || t.isContentEditable;
  }

  function buildPalette() {
    if (paletteEl) { return; }
    paletteEl = el('div', 's5-palette', '');
    paletteEl.setAttribute('role', 'dialog');
    paletteEl.setAttribute('aria-label', 'Command palette');
    paletteEl.innerHTML =
      '<div class="s5-palette-backdrop" data-s5-close></div>' +
      '<div class="s5-palette-panel">' +
        '<input type="text" class="s5-palette-input" placeholder="Search cities, categories, studio, Roadie\u2026" aria-label="Command palette search" />' +
        '<ul class="s5-palette-list" role="listbox"></ul>' +
        '<div class="s5-palette-hint"><span>\u2191\u2193 to navigate</span><span>\u21B5 to select</span><span>esc to close</span></div>' +
      '</div>';
    document.body.appendChild(paletteEl);
    paletteInput = paletteEl.querySelector('.s5-palette-input');
    paletteList = paletteEl.querySelector('.s5-palette-list');
    paletteInput.addEventListener('input', function () { renderPalette(paletteInput.value); });
    paletteEl.addEventListener('click', function (e) {
      if (e.target && e.target.hasAttribute('data-s5-close')) { closePalette(); }
      var li = e.target.closest ? e.target.closest('[data-s5-idx]') : null;
      if (li) { selectPalette(parseInt(li.getAttribute('data-s5-idx'), 10)); }
    });
  }

  function renderPalette(query) {
    query = (query || '').toLowerCase().trim();
    paletteFiltered = PALETTE_ITEMS.filter(function (i) { return !query || i.label.toLowerCase().indexOf(query) !== -1 || i.group.toLowerCase().indexOf(query) !== -1; });
    paletteIndex = 0;
    var groups = {}, order = [];
    paletteFiltered.forEach(function (item, i) {
      item.__idx = i;
      if (!groups[item.group]) { groups[item.group] = []; order.push(item.group); }
      groups[item.group].push(item);
    });
    var html = '';
    if (!paletteFiltered.length) { html = '<li class="s5-palette-none">No matches. Try a city or category.</li>'; }
    order.forEach(function (g) {
      html += '<li class="s5-palette-group">' + esc(g) + '</li>';
      groups[g].forEach(function (item) {
        html += '<li class="s5-palette-item" role="option" data-s5-idx="' + item.__idx + '">' + esc(item.label) + '</li>';
      });
    });
    paletteList.innerHTML = html;
    highlight();
  }

  function highlight() {
    var items = paletteList.querySelectorAll('.s5-palette-item');
    items.forEach(function (n, i) { n.classList.toggle('is-active', i === paletteIndex); });
    var active = items[paletteIndex];
    if (active && active.scrollIntoView) { active.scrollIntoView({ block: 'nearest' }); }
  }

  function openPalette() {
    buildPalette();
    paletteEl.classList.add('is-open');
    document.documentElement.classList.add('s5-palette-lock');
    renderPalette('');
    setTimeout(function () { paletteInput && paletteInput.focus(); }, 20);
    track('command_palette_opened', {});
  }
  function closePalette() {
    if (!paletteEl) { return; }
    paletteEl.classList.remove('is-open');
    document.documentElement.classList.remove('s5-palette-lock');
  }
  function selectPalette(idx) {
    var item = paletteFiltered[idx];
    if (!item) { return; }
    track('command_palette_action_selected', { label: item.label });
    closePalette();
    if (item.action === 'roadie') { openRoadie(); return; }
    if (item.action === 'search') { focusSearch(); return; }
    if (item.href) { window.location.href = item.href; }
  }
  function openRoadie() {
    var b = document.querySelector('[data-roadie-toggle], .roadie-fab, #roadieFab, .ask-roadie, [data-roadie]');
    if (b) { b.click(); } else { track('roadie_open', { via: 'palette' }); }
  }
  function focusSearch() {
    var s = document.querySelector('input[type="search"], .site-search input, header input[placeholder*="Search" i]');
    if (s) { s.focus(); }
  }

  // ---- Task 9: Notification Center ----
  var NOTE_KEY = 'aimc.notifications.v1';
  function seedNotifications() {
    var existing = ls(NOTE_KEY);
    if (existing && existing.length) { return existing; }
    var seed = [
      { id: 'sys1', type: 'system', title: 'Welcome to ArtistsInMyCity', body: 'Your creative operating system is warming up.' },
      { id: 'roadie1', type: 'roadie', title: 'Roadie is here to help', body: 'Ask Roadie anytime from the bottom-right.' },
      { id: 'info1', type: 'info', title: 'First exhibits opening soon', body: 'Local artists are being onboarded now.' }
    ];
    ls(NOTE_KEY, seed);
    return seed;
  }
  function notifCount() { var n = ls(NOTE_KEY) || []; return n.length; }

  var bellEl = null, panelEl = null;
  function buildBell() {
    if (bellEl) { return; }
    var nav = document.querySelector('.site-header, header .nav, header, .studio-topbar');
    if (!nav) { return; }
    bellEl = el('button', 's5-bell', '\uD83D\uDD14');
    bellEl.type = 'button';
    bellEl.setAttribute('aria-label', 'Notifications');
    var badge = el('span', 's5-bell-badge', '');
    bellEl.appendChild(badge);
    updateBellBadge(badge);
    bellEl.addEventListener('click', function (e) { e.preventDefault(); togglePanel(); });
    // place before a join/sign-in button if present, else append
    var anchor = nav.querySelector('.btn, .sign-in, a[href*="sign-in"], a[href*="join"]');
    if (anchor && anchor.parentNode) { anchor.parentNode.insertBefore(bellEl, anchor); }
    else { nav.appendChild(bellEl); }
  }
  function updateBellBadge(badge) {
    badge = badge || (bellEl && bellEl.querySelector('.s5-bell-badge'));
    if (!badge) { return; }
    var c = notifCount();
    badge.textContent = c > 9 ? '9+' : String(c);
    badge.style.display = c ? 'flex' : 'none';
  }
  function buildPanel() {
    if (panelEl) { return; }
    panelEl = el('div', 's5-note-panel', '');
    panelEl.innerHTML =
      '<div class="s5-note-head"><strong>Notifications</strong><button type="button" class="s5-note-clear" data-s5-noteclear>Mark all read</button></div>' +
      '<ul class="s5-note-list"></ul>';
    document.body.appendChild(panelEl);
    panelEl.addEventListener('click', function (e) {
      if (e.target && e.target.hasAttribute('data-s5-noteclear')) { ls(NOTE_KEY, []); renderPanel(); updateBellBadge(); }
    });
    document.addEventListener('click', function (e) {
      if (panelEl.classList.contains('is-open') && !panelEl.contains(e.target) && e.target !== bellEl && !(bellEl && bellEl.contains(e.target))) {
        panelEl.classList.remove('is-open');
      }
    });
  }
  function renderPanel() {
    var list = panelEl.querySelector('.s5-note-list');
    var notes = ls(NOTE_KEY) || [];
    if (!notes.length) { list.innerHTML = '<li class="s5-note-empty">You\u2019re all caught up.</li>'; return; }
    list.innerHTML = notes.map(function (n) { return Components.notificationItem(n); }).join('');
  }
  function togglePanel() {
    buildPanel();
    var open = panelEl.classList.toggle('is-open');
    if (open) {
      // position under the bell
      var r = bellEl.getBoundingClientRect();
      panelEl.style.top = (r.bottom + 8) + 'px';
      panelEl.style.right = Math.max(12, (window.innerWidth - r.right)) + 'px';
      renderPanel();
      track('notification_opened', {});
    }
  }

  // ---- global keyboard wiring ----
  document.addEventListener('keydown', function (e) {
    var mod = e.ctrlKey || e.metaKey;
    if (mod && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openPalette(); return; }
    if (e.key === '/' && !isTyping(e) && !(paletteEl && paletteEl.classList.contains('is-open'))) { e.preventDefault(); openPalette(); return; }
    if (!paletteEl || !paletteEl.classList.contains('is-open')) { return; }
    if (e.key === 'Escape') { closePalette(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(paletteIndex + 1, (paletteFiltered.length - 1)); highlight(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); paletteIndex = Math.max(paletteIndex - 1, 0); highlight(); }
    else if (e.key === 'Enter') { e.preventDefault(); selectPalette(paletteIndex); }
  });

  // ---- Task 2: Exhibit Theme Builder ----
  var THEMES = [
    { id: 'gallery', name: 'Gallery', bestFor: 'Painters & mixed media', desc: 'Clean, museum-like, minimal text, large artwork.', grad: 'linear-gradient(135deg,#1a1a1f,#2a2730)' },
    { id: 'minimal', name: 'Minimal', bestFor: 'Editorial & concept work', desc: 'White-space inspired, simple, editorial.', grad: 'linear-gradient(135deg,#202024,#34343a)' },
    { id: 'music', name: 'Music', bestFor: 'Musicians & DJs', desc: 'Audio-first, stage-inspired, track and player areas.', grad: 'linear-gradient(135deg,#241040,#3a1d63)' },
    { id: 'photography', name: 'Photography', bestFor: 'Photographers & film', desc: 'Large image grids, cinematic layout.', grad: 'linear-gradient(135deg,#101a2a,#1c3a52)' },
    { id: 'street', name: 'Street', bestFor: 'Murals & street art', desc: 'Bold, mural-inspired, energetic.', grad: 'linear-gradient(135deg,#3a1233,#12060f)' },
    { id: 'luxury', name: 'Luxury', bestFor: 'Premium collections', desc: 'Dark, elegant, premium gallery feel.', grad: 'linear-gradient(135deg,#0c1230,#241a52)' }
  ];
  var THEME_KEY = 'aimc.exhibit.theme.v1';
  function renderThemeBuilder(container) {
    var current = ls(THEME_KEY) || 'gallery';
    var cards = THEMES.map(function (t) {
      return '<div class="s5-theme-card' + (t.id === current ? ' is-selected' : '') + '" data-theme="' + t.id + '">' +
        '<div class="s5-theme-preview" style="background:' + t.grad + '"></div>' +
        '<div class="s5-theme-info"><h4>' + esc(t.name) + '</h4>' +
        '<span class="s5-theme-bestfor">Best for: ' + esc(t.bestFor) + '</span>' +
        '<p>' + esc(t.desc) + '</p>' +
        '<div class="s5-theme-actions"><button type="button" class="s5-btn s5-btn-primary" data-theme-select="' + t.id + '">Select</button>' +
        '<button type="button" class="s5-btn s5-btn-ghost" data-theme-preview="' + t.id + '">Preview</button></div></div></div>';
    }).join('');
    container.innerHTML = '<div class="s5-theme-grid">' + cards + '</div><div class="s5-theme-current" aria-live="polite">Current theme: <strong>' + esc(current) + '</strong></div>';
    container.addEventListener('click', function (e) {
      var sel = e.target.getAttribute && e.target.getAttribute('data-theme-select');
      var prev = e.target.getAttribute && e.target.getAttribute('data-theme-preview');
      if (sel) {
        ls(THEME_KEY, sel);
        try { window.RoadieMemory && window.RoadieMemory.rememberTheme(sel); } catch (x) {}
        container.querySelectorAll('.s5-theme-card').forEach(function (c) { c.classList.toggle('is-selected', c.getAttribute('data-theme') === sel); });
        var cur = container.querySelector('.s5-theme-current strong'); if (cur) { cur.textContent = sel; }
        track('artist_theme_changed', { theme: sel });
      } else if (prev) {
        var pv = container.querySelector('[data-theme="' + prev + '"] .s5-theme-preview');
        if (pv) { pv.classList.add('s5-flash'); setTimeout(function () { pv.classList.remove('s5-flash'); }, 500); }
        track('artist_previewed', { theme: prev });
      }
    });
  }

  // ---- Task 4: Collections ----
  var COLL_KEY = 'aimc.collections.v1';
  function renderCollections(container) {
    function read() { return ls(COLL_KEY) || []; }
    function draw() {
      var items = read();
      var body = items.length ? '<div class="s5-coll-grid">' + items.map(function (c, i) {
        return '<div class="s5-coll-card" data-coll="' + i + '"><div class="s5-coll-cover"></div>' +
          '<div class="s5-coll-meta"><h4>' + esc(c.title) + '</h4>' +
          '<span class="s5-coll-cat">' + esc(c.category || 'Uncategorized') + '</span>' +
          '<p>' + esc(c.description || 'This collection is ready for your work.') + '</p>' +
          '<span class="s5-coll-count">' + (c.items || 0) + ' items \u00B7 ' + esc(c.visibility || 'Draft') + '</span>' +
          '<div class="s5-coll-actions"><button type="button" class="s5-btn s5-btn-ghost" data-coll-edit="' + i + '">Edit</button>' +
          '<button type="button" class="s5-btn s5-btn-ghost" data-coll-preview="' + i + '">Preview</button>' +
          (i > 0 ? '<button type="button" class="s5-btn s5-btn-ghost" data-coll-up="' + i + '">\u2191</button>' : '') + '</div></div></div>';
      }).join('') + '</div>' : Components.emptyState('Your first collection is waiting.', 'Group your work into collections instead of one flat gallery.');
      container.querySelector('.s5-coll-body').innerHTML = body;
    }
    container.innerHTML = '<div class="s5-coll-head"><button type="button" class="s5-btn s5-btn-primary" data-coll-create>Create Collection</button></div><div class="s5-coll-body"></div>';
    draw();
    container.addEventListener('click', function (e) {
      var t = e.target;
      if (t.hasAttribute && t.hasAttribute('data-coll-create')) {
        var title = window.prompt('Collection title', 'Untitled Collection');
        if (!title) { return; }
        var items = read();
        items.push({ title: title, description: '', category: '', items: 0, visibility: 'Draft' });
        ls(COLL_KEY, items); draw(); track('collection_created', {});
      } else if (t.getAttribute && t.getAttribute('data-coll-edit') != null) {
        var idx = parseInt(t.getAttribute('data-coll-edit'), 10); var items2 = read();
        var nt = window.prompt('Edit collection title', items2[idx].title); if (nt) { items2[idx].title = nt; ls(COLL_KEY, items2); draw(); track('collection_updated', {}); }
      } else if (t.getAttribute && t.getAttribute('data-coll-preview') != null) {
        track('collection_previewed', {}); pushTimeline('collection_viewed');
      } else if (t.getAttribute && t.getAttribute('data-coll-up') != null) {
        var j = parseInt(t.getAttribute('data-coll-up'), 10); var items3 = read();
        if (j > 0) { var tmp = items3[j - 1]; items3[j - 1] = items3[j]; items3[j] = tmp; ls(COLL_KEY, items3); draw(); track('collection_reordered', {}); }
      }
    });
  }

  // ---- Task 5: Media Intelligence placeholders ----
  function renderMediaIntel(container) {
    container.innerHTML =
      Components.roadiePrompt('Beautiful upload. Want me to write alt text for accessibility and SEO?', [
        { label: 'Generate Alt Text', event: 'media_alt_text_requested' },
        { label: 'Suggest Caption', event: 'media_caption_requested' },
        { label: 'Choose Cover', event: 'media_cover_suggested' },
        { label: 'Optimize Image', event: 'media_cover_suggested' },
        { label: 'Add to Collection', event: 'collection_updated' }
      ]) +
      '<ul class="s5-intel-list">' +
        '<li>Suggested cover image</li><li>Suggested image order</li><li>Suggested alt text</li>' +
        '<li>Suggested caption</li><li>Suggested compression</li><li>Suggested category</li>' +
        '<li>Suggested collection placement</li><li>Suggested SEO tags</li>' +
      '</ul>';
    container.addEventListener('click', function (e) {
      var ev = e.target.getAttribute && e.target.getAttribute('data-s5-action');
      if (ev) { track(ev, {}); e.target.classList.add('is-done'); e.target.textContent = e.target.textContent.replace(/^/, '\u2713 '); }
    });
  }

  // ---- Task 7: Audience Timeline ----
  var TL_KEY = 'aimc.timeline.v1';
  var TL_COPY = {
    exhibit_saved: 'You saved an exhibit.', artist_followed: 'You followed an artist.',
    city_viewed: 'You explored a city.', search_performed: 'You ran a search.',
    roadie_suggestion: 'Roadie made a suggestion.', event_interest: 'You showed interest in an event.',
    collection_viewed: 'You previewed a collection.'
  };
  function pushTimeline(type, label) {
    var items = ls(TL_KEY) || [];
    items.unshift({ type: type, label: label || TL_COPY[type] || 'Activity recorded.', at: Date.now() });
    if (items.length > 30) { items = items.slice(0, 30); }
    ls(TL_KEY, items); track('timeline_event_added', { type: type });
    var c = document.querySelector('[data-sprint5="timeline"]'); if (c) { renderTimeline(c); }
  }
  window.AIMCTimeline = { push: pushTimeline };
  function renderTimeline(container) {
    var items = ls(TL_KEY) || [];
    if (!items.length) { container.innerHTML = Components.emptyState('Your activity will appear here.', 'Save an exhibit or explore a city to start your timeline.'); return; }
    container.innerHTML = '<ul class="s5-timeline">' + items.map(function (i) {
      return '<li class="s5-timeline-item s5-tl-' + esc(i.type) + '"><span class="s5-timeline-dot"></span>' +
        '<span class="s5-timeline-copy">' + esc(i.label) + '</span></li>';
    }).join('') + '</ul>';
  }

  // ---- Task 6: Fan Personalization ----
  function renderFanPersonalization(container) {
    var m = null; try { m = window.RoadieMemory && window.RoadieMemory.getMemory(); } catch (x) {}
    var cities = (m && m.selectedCities) || [];
    var forms = (m && m.preferredArtForms) || [];
    var sections = [
      { label: 'Because You Followed', empty: 'Follow your first artist to personalize this space.' },
      { label: 'Saved Exhibits', empty: 'Save exhibits you love and Roadie will learn your taste.' },
      { label: 'Favorite Cities', empty: 'Explore a city to see it here.', chips: cities },
      { label: 'Recently Viewed', empty: 'Your recently viewed exhibits will appear here.' },
      { label: "Roadie's Picks", empty: 'Roadie is learning your taste.' },
      { label: 'Trending Near You', empty: 'Trending exhibits open as artists join.' },
      { label: 'Upcoming Events Near You', empty: 'Local events will appear here soon.' },
      { label: 'New Exhibits Opening Soon', empty: 'First exhibits opening soon.' }
    ];
    container.innerHTML = sections.map(function (s) {
      var inner;
      if (s.chips && s.chips.length) { inner = '<div class="s5-chips">' + s.chips.map(function (c) { return Components.cityCard(c); }).join('') + '</div>'; }
      else { inner = Components.emptyState(s.empty); }
      return '<section class="s5-fan-section"><h3 class="s5-fan-title">' + esc(s.label) + '</h3>' + inner + '</section>';
    }).join('');
    track('fan_home_personalized', { cities: cities.length, forms: forms.length });
  }

  // ---- init: mount all [data-sprint5] regions + nav widgets ----
  function init() {
    try { buildBell(); seedNotifications(); if (bellEl) { updateBellBadge(); } } catch (e) {}
    var map = {
      'theme-builder': renderThemeBuilder,
      'collections': renderCollections,
      'media-intel': renderMediaIntel,
      'timeline': renderTimeline,
      'fan-personalization': renderFanPersonalization
    };
    Object.keys(map).forEach(function (key) {
      document.querySelectorAll('[data-sprint5="' + key + '"]').forEach(function (node) {
        try { map[key](node); } catch (e) {}
      });
    });
    // Roadie personalized greeting: fill any [data-roadie-greeting] element
    try {
      if (window.RoadieMemory) {
        var g = window.RoadieMemory.getPersonalizedGreeting();
        document.querySelectorAll('[data-roadie-greeting]').forEach(function (n) { n.textContent = g; });
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }

})(window, document);
