/*
 * ArtistsInMyCity - Experience layer (Sprint 4, Tasks 4, 5, 7)
 * - Spotify-style search dropdown (UI + keyboard nav)
 * - Homepage "Preview Activity" ticker (clearly labeled)
 * - Roadie contextual helper toasts via data-roadie-say
 * UI-only. No backend. Loop events via AIMCLoop when present.
 */
(function () {
  'use strict';
  var loop = window.AIMCLoop;

  /* ============ TASK 5: SEARCH DROPDOWN ============ */
  var searchForm = document.querySelector('form.top-search, form[data-search]');
  if (searchForm) {
    var input = searchForm.querySelector('input');
    var panel = document.createElement('div');
    panel.className = 'search-pop';
    panel.hidden = true;
    panel.innerHTML = buildPanel();
    searchForm.appendChild(panel);

    var items = [];
    function refreshItems() {
      items = Array.prototype.slice.call(panel.querySelectorAll('.sp-item'));
    }
    refreshItems();
    var active = -1;

    function open() { panel.hidden = false; searchForm.classList.add('is-open'); active = -1; }
    function close() { panel.hidden = true; searchForm.classList.remove('is-open'); active = -1; setActive(); }
    function setActive() {
      items.forEach(function (it, i) { it.classList.toggle('is-active', i === active); });
      if (active > -1 && items[active]) items[active].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('focus', open);
    input.addEventListener('click', open);
    document.addEventListener('click', function (e) {
      if (!searchForm.contains(e.target)) close();
    });
    input.addEventListener('keydown', function (e) {
      if (panel.hidden && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) open();
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(items.length - 1, active + 1); setActive(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(0, active - 1); setActive(); }
      else if (e.key === 'Enter' && active > -1) { e.preventDefault(); items[active].click(); }
      else if (e.key === 'Escape') { close(); input.blur(); }
    });
    panel.addEventListener('click', function (e) {
      var it = e.target.closest('.sp-item');
      if (it && loop) loop.eventSearch({ term: it.textContent.trim(), kind: it.getAttribute('data-kind') });
    });
  }

  function row(kind, label, href) {
    return '<a class="sp-item" data-kind="' + kind + '" href="' + href + '">' + label + '</a>';
  }
  function buildPanel() {
    var cities = ['Nashville', 'New York', 'Los Angeles', 'Austin', 'Miami'];
    var cats = ['Music', 'Painting', 'Photography', 'Murals'];
    var forms = ['Street Art', 'Dance', 'Film', 'Sculpture'];
    var picks = ['Exhibits near you', 'This week\'s featured city', 'New galleries'];
    function slug(s){return s.toLowerCase().replace(/[^a-z0-9]+/g,'-');}
    var html = '';
    html += '<div class="sp-group"><h5>Trending Cities</h5>' + cities.map(function (c) { return row('city', c, '/cities/' + slug(c) + '.html'); }).join('') + '</div>';
    html += '<div class="sp-group"><h5>Trending Categories</h5>' + cats.map(function (c) { return row('category', c, '/pages/categories.html'); }).join('') + '</div>';
    html += '<div class="sp-group"><h5>Featured Art Forms</h5>' + forms.map(function (c) { return row('form', c, '/pages/discover.html'); }).join('') + '</div>';
    html += '<div class="sp-group sp-roadie"><h5>🎸 Roadie\'s Picks</h5>' + picks.map(function (c) { return row('roadie', c, '/pages/discover.html'); }).join('') + '</div>';
    html += '<div class="sp-group sp-muted"><h5>Recent Searches</h5><p class="sp-empty">Your recent searches will show up here.</p></div>';
    html += '<div class="sp-group sp-muted"><h5>Popular Exhibits</h5><p class="sp-empty">Popular exhibits appear once artists publish.</p></div>';
    return html;
  }

  /* ============ TASK 7: PREVIEW ACTIVITY TICKER ============ */
  var ticker = document.querySelector('[data-activity]');
  if (ticker) {
    var lines = [
      'An artist just published an exhibit.',
      'Someone followed an artist.',
      'A new gallery was added.',
      'A city gained a new creative district.',
      'An exhibit was saved by a fan.'
    ];
    var i = 0;
    var label = ticker.querySelector('[data-activity-text]');
    if (label) {
      setInterval(function () {
        i = (i + 1) % lines.length;
        label.style.opacity = '0';
        setTimeout(function () { label.textContent = lines[i]; label.style.opacity = '1'; }, 250);
      }, 4000);
    }
  }

  /* ============ TASK 4: ROADIE CONTEXTUAL TOASTS ============ */
  // Elements can carry data-roadie-say="message" and data-roadie-on="click|load".
  function roadieToast(msg) {
    var t = document.createElement('div');
    t.className = 'roadie-toast';
    t.innerHTML = '<span class="rt-av" aria-hidden="true">R</span><span class="rt-msg"></span>';
    t.querySelector('.rt-msg').textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(function () { t.classList.add('is-in'); });
    setTimeout(function () { t.classList.remove('is-in'); }, 4200);
    setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 4800);
  }
  window.roadieToast = roadieToast;

  document.querySelectorAll('[data-roadie-say]').forEach(function (el) {
    var when = el.getAttribute('data-roadie-on') || 'click';
    var msg = el.getAttribute('data-roadie-say');
    if (when === 'load') { setTimeout(function () { roadieToast(msg); }, 1200); }
    else { el.addEventListener(when, function () { roadieToast(msg); }); }
  });
})();
