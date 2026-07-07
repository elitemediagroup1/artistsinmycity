/* Roadie(TM) - AI Artist Guide & City Concierge
   Floating assistant widget. Frontend placeholder only.
   TODO: Wire sendRoadieMessage() to /.netlify/functions/claude-assistant
   CLAUDE_API_KEY must remain server-side only. Never expose in frontend. */
(function () {
  "use strict";
  if (window.__roadieLoaded) return;
  window.__roadieLoaded = true;

  var script = document.currentScript;
  var context = (script && script.getAttribute("data-roadie-context")) || "public";

  var CONTEXT_INTRO = {
    "public": "🎸 Hey! I'm Roadie. Ready to discover something incredible today?",
    "city": "🎸 Hey! I'm Roadie, your city arts concierge. Want to explore this city's creative scene?",
    "events": "🎸 Hey! I'm Roadie. Looking for live music, gallery openings, or art walks near you?",
    "dashboard": "🎸 Hey! I'm Roadie, your profile coach. Want help making your artist profile shine?"
  };

  var CONTEXT_QUICK = {
    "public": ["Find Artists", "Find Events", "Explore Cities", "Art Venues", "Improve My Profile", "SEO Help"],
    "city": ["Find Artists", "Find Events", "Art Venues", "City Guide", "Improve My Profile", "SEO Help"],
    "events": ["Find Events", "Gallery Openings", "Live Music", "Art Walks", "Find Artists", "Explore Cities"],
    "dashboard": ["Improve My Profile", "SEO Help", "Grow My Audience", "Media Tips", "Find Events", "Explore Cities"]
  };

  var QUICK_ROUTES = {
    "Find Artists": "/pages/discover.html",
    "Find Events": "/pages/events.html",
    "Explore Cities": "/pages/cities.html",
    "Art Venues": "/pages/discover.html",
    "Gallery Openings": "/pages/events.html",
    "Live Music": "/pages/events.html",
    "Art Walks": "/pages/events.html"
  };

  var intro = CONTEXT_INTRO[context] || CONTEXT_INTRO.public;
  var quick = CONTEXT_QUICK[context] || CONTEXT_QUICK.public;

  // TODO replace with approved Roadie character asset:
  // /assets/characters/roadie/roadie-default.png (or .webp)
  var AVATAR = "<span class=\"roadie-avatar-initial\">R</span>";

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  var fab = el("button", "roadie-fab");
  fab.setAttribute("aria-label", "Ask Roadie");
  fab.innerHTML =
    '<span class="roadie-avatar">' + AVATAR + '<span class="roadie-dot"></span></span>' +
    '<span class="roadie-fab-label">Ask Roadie</span>';

  var panel = el("div", "roadie-panel");
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Roadie AI Artist Guide");
  panel.innerHTML =
    '<div class="roadie-header">' +
      '<span class="roadie-avatar">' + AVATAR + '<span class="roadie-dot"></span></span>' +
      '<span class="roadie-title"><b>Roadie</b><small>AI Artist Guide</small></span>' +
      '<span class="roadie-header-status"><i></i>Online</span>' +
      '<button class="roadie-close" aria-label="Close Roadie">\u00d7</button>' +
    '</div>' +
    '<div class="roadie-log" data-roadie-log></div>' +
    '<div class="roadie-quick" data-roadie-quick></div>' +
    '<form class="roadie-input" data-roadie-form>' +
      '<input type="text" placeholder="Ask Roadie anything..." data-roadie-input autocomplete="off">' +
      '<button type="submit">Send</button>' +
    '</form>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  var log = panel.querySelector("[data-roadie-log]");
  var quickWrap = panel.querySelector("[data-roadie-quick]");
  var form = panel.querySelector("[data-roadie-form]");
  var input = panel.querySelector("[data-roadie-input]");
  var closeBtn = panel.querySelector(".roadie-close");

  function addMsg(text, who) {
    var m = el("div", "roadie-msg " + (who === "user" ? "user" : "bot"));
    m.textContent = text;
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }

  // Placeholder AI responder. Replace with real Claude backend call.
  function sendRoadieMessage(message) {
    addMsg(message, "user");
    if (QUICK_ROUTES[message]) {
      addMsg("Taking you to " + message + "...", "bot");
      setTimeout(function () { window.location.href = QUICK_ROUTES[message]; }, 500);
      return;
    }
    // TODO: real backend
    // fetch("/.netlify/functions/claude-assistant", {method:"POST",
    //   body: JSON.stringify({ message: message, context: context })})
    //   .then(r => r.json()).then(d => addMsg(d.reply, "bot"));
    setTimeout(function () {
      addMsg("Thanks! Roadie's live AI is opening soon. In the meantime, explore artists, events, and cities from the menu above.", "bot");
    }, 400);
  }
  window.sendRoadieMessage = sendRoadieMessage;

  quick.forEach(function (label) {
    var b = el("button", null, label);
    b.type = "button";
    b.addEventListener("click", function () { sendRoadieMessage(label); });
    quickWrap.appendChild(b);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    sendRoadieMessage(v);
  });

  function open() { panel.classList.add("open"); fab.style.display = "none"; if (!log.childNodes.length) addMsg(intro, "bot"); input.focus(); }
  function close() { panel.classList.remove("open"); fab.style.display = "flex"; }
  fab.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
})();
