/*
 * ArtistsInMyCity - Exhibit Builder (Sprint 4, Task 3)
 * UI-only drag-and-drop section reordering + hide/show.
 * Order persists to localStorage. No backend.
 */
(function () {
  'use strict';
  var list = document.querySelector('[data-builder]');
  if (!list) return;
  var tray = document.querySelector('[data-hidden-tray]');
  var trayItems = document.querySelector('[data-hidden-items]');
  var STORE = 'aimc_exhibit_order_v1';
  var HIDDEN = 'aimc_exhibit_hidden_v1';

  function saveOrder() {
    var order = Array.prototype.map.call(list.children, function (li) {
      return li.getAttribute('data-section');
    });
    try { localStorage.setItem(STORE, JSON.stringify(order)); } catch (e) {}
  }
  function saveHidden(arr) {
    try { localStorage.setItem(HIDDEN, JSON.stringify(arr)); } catch (e) {}
  }
  function getHidden() {
    try { return JSON.parse(localStorage.getItem(HIDDEN)) || []; } catch (e) { return []; }
  }

  // ---- Restore saved order ----
  try {
    var saved = JSON.parse(localStorage.getItem(STORE));
    if (saved && saved.length) {
      saved.forEach(function (name) {
        var el = list.querySelector('[data-section="' + name + '"]');
        if (el) list.appendChild(el);
      });
    }
  } catch (e) {}

  // ---- Drag & drop ----
  var dragEl = null;
  list.addEventListener('dragstart', function (e) {
    var li = e.target.closest('.xb-section');
    if (!li) return;
    dragEl = li;
    li.classList.add('is-dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  list.addEventListener('dragend', function () {
    if (dragEl) dragEl.classList.remove('is-dragging');
    dragEl = null;
    saveOrder();
  });
  list.addEventListener('dragover', function (e) {
    e.preventDefault();
    var after = getAfter(list, e.clientY);
    if (!dragEl) return;
    if (after == null) list.appendChild(dragEl);
    else list.insertBefore(dragEl, after);
  });
  function getAfter(container, y) {
    var els = Array.prototype.slice.call(container.querySelectorAll('.xb-section:not(.is-dragging)'));
    var closest = { offset: -Infinity, el: null };
    els.forEach(function (child) {
      var box = child.getBoundingClientRect();
      var offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) closest = { offset: offset, el: child };
    });
    return closest.el;
  }

  // ---- Tool buttons: up / down / hide / preview ----
  list.addEventListener('click', function (e) {
    var btn = e.target.closest('.xb-tool');
    if (!btn) return;
    var li = btn.closest('.xb-section');
    var act = btn.getAttribute('data-act');
    if (act === 'up' && li.previousElementSibling) {
      list.insertBefore(li, li.previousElementSibling);
      saveOrder();
    } else if (act === 'down' && li.nextElementSibling) {
      list.insertBefore(li.nextElementSibling, li);
      saveOrder();
    } else if (act === 'hide') {
      hideSection(li);
    } else if (act === 'preview' && window.AIMCLoop) {
      window.AIMCLoop.previewed({ section: li.getAttribute('data-section') });
    }
  });

  function hideSection(li) {
    var name = li.getAttribute('data-section');
    li.hidden = true;
    var hidden = getHidden();
    if (hidden.indexOf(name) < 0) hidden.push(name);
    saveHidden(hidden);
    renderTray();
  }
  function showSection(name) {
    var li = list.querySelector('[data-section="' + name + '"]');
    if (li) li.hidden = false;
    var hidden = getHidden().filter(function (n) { return n !== name; });
    saveHidden(hidden);
    renderTray();
  }
  function renderTray() {
    var hidden = getHidden();
    // apply hidden state
    Array.prototype.forEach.call(list.children, function (li) {
      li.hidden = hidden.indexOf(li.getAttribute('data-section')) > -1;
    });
    if (!tray || !trayItems) return;
    trayItems.innerHTML = '';
    if (!hidden.length) { tray.hidden = true; return; }
    tray.hidden = false;
    hidden.forEach(function (name) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'xb-restore';
      chip.textContent = '+ ' + name;
      chip.addEventListener('click', function () { showSection(name); });
      trayItems.appendChild(chip);
    });
  }

  renderTray();
})();
