/*
 * ArtistsInMyCity - Artist Onboarding Wizard controller (Sprint 4, Task 1)
 * UI-only. Progress persists to localStorage. Loop events via AIMCLoop.
 * No backend, no API keys. Cloudinary/Claude/Places are placeholders.
 */
(function () {
  'use strict';
  var root = document.querySelector('[data-onboarding]');
  if (!root) return;

  var STORE = 'aimc_onboarding_v1';
  var TOTAL = 8;
  var steps = Array.prototype.slice.call(root.querySelectorAll('.ob-step'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.ob-steps li'));
  var bar = root.querySelector('.ob-bar > i');
  var loop = window.AIMCLoop;

  var state = load();
  var current = state.step || 1;

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
    catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {}
  }

  function show(n) {
    n = Math.max(1, Math.min(TOTAL, n));
    current = n;
    state.step = n;
    save();
    steps.forEach(function (s) {
      s.classList.toggle('is-active', +s.getAttribute('data-step') === n);
    });
    dots.forEach(function (d) {
      var dn = +d.getAttribute('data-dot');
      d.classList.toggle('is-active', dn === n);
      d.classList.toggle('is-done', dn < n);
    });
    if (bar) bar.style.width = (n / TOTAL * 100) + '%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (n === TOTAL) celebrate();
  }

  // ---- Navigation ----
  root.addEventListener('click', function (e) {
    if (e.target.closest('.ob-next')) { show(current + 1); }
    else if (e.target.closest('.ob-back')) { show(current - 1); }
  });

  // ---- Step 2: art form multi-select ----
  state.artForms = state.artForms || [];
  var afGrid = root.querySelector('[data-artforms]');
  if (afGrid) {
    afGrid.querySelectorAll('.artform-card').forEach(function (c) {
      var name = c.getAttribute('data-artform');
      if (state.artForms.indexOf(name) > -1) c.classList.add('is-selected');
      c.addEventListener('click', function () {
        c.classList.toggle('is-selected');
        var i = state.artForms.indexOf(name);
        if (i > -1) state.artForms.splice(i, 1); else state.artForms.push(name);
        save();
      });
    });
  }

  // ---- Step 3: city fields persist ----
  root.querySelectorAll('.ob-field input, .ob-field select').forEach(function (el) {
    var key = 'loc_' + el.name;
    if (state[key]) el.value = state[key];
    el.addEventListener('input', function () { state[key] = el.value; save(); });
    el.addEventListener('change', function () { state[key] = el.value; save(); });
  });

  // ---- Step 5: bio AI placeholder ----
  var bioBtn = root.querySelector('[data-ai="bio"]');
  if (bioBtn) {
    bioBtn.addEventListener('click', function () {
      var note = root.querySelector('[data-bio-note]');
      if (note) note.hidden = false;
      if (loop) loop.generatedBio({ source: 'onboarding' });
    });
  }

  // ---- Step 7: device preview tabs ----
  var frame = root.querySelector('[data-preview-frame]');
  root.querySelectorAll('.dev-tab').forEach(function (t) {
    t.addEventListener('click', function () {
      root.querySelectorAll('.dev-tab').forEach(function (x) { x.classList.remove('is-active'); });
      t.classList.add('is-active');
      if (frame) frame.className = 'device-frame ' + t.getAttribute('data-device');
    });
  });

  // ---- Step 8: publish ----
  var pubBtn = root.querySelector('[data-publish]');
  if (pubBtn) {
    pubBtn.addEventListener('click', function () {
      var note = root.querySelector('[data-publish-note]');
      if (note) note.hidden = false;
      pubBtn.disabled = true;
      pubBtn.textContent = 'Published ✓';
      state.published = true; save();
      if (loop) loop.published({ artForms: state.artForms });
      burst();
    });
  }

  // ---- Confetti (lightweight, no deps) ----
  function celebrate() {
    if (loop) loop.previewed({ step: 'publish_screen' });
    burst();
  }
  function burst() {
    var host = root.querySelector('[data-confetti]');
    if (!host) return;
    host.innerHTML = '';
    var colors = ['#ff2d78', '#7b5cff', '#22d3ee', '#ffd166', '#3ddc97'];
    for (var i = 0; i < 60; i++) {
      var p = document.createElement('i');
      p.className = 'confetti-bit';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = (Math.random() * 0.6) + 's';
      p.style.transform = 'rotate(' + (Math.random() * 360) + 'deg)';
      host.appendChild(p);
    }
    setTimeout(function () { host.innerHTML = ''; }, 3500);
  }

  // ---- Fire onboarding_started once ----
  if (!state.started) {
    state.started = true; save();
    if (loop) loop.onboardingStarted({});
  }
  // ---- Completed fires when reaching publish first time ----
  var origShow = show;
  // wrap to emit completed
  var completedEmitted = state.completed || false;
  root.addEventListener('click', function () {
    if (current >= TOTAL && !completedEmitted) {
      completedEmitted = true; state.completed = true; save();
      if (loop) loop.onboardingCompleted({ artForms: state.artForms });
    }
  });

  // restore step on load
  show(current);
})();
