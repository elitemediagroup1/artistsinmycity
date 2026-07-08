/* Roadie(TM) - Creative Guide & City Concierge
   Floating widget for ArtistsInMyCity. No real Claude call yet.
   TODO: wire sendRoadieMessage() to server-side Claude endpoint.
   IMPORTANT: CLAUDE_API_KEY must remain server-side only. Never expose in frontend. */
(function(){
  "use strict";
  if (window.__roadieLoaded) return; window.__roadieLoaded = true;

  var CONTEXT = (document.currentScript && document.currentScript.getAttribute("data-roadie-context")) || "public";
  // Fallback: read from any roadie script tag
  if (!CONTEXT || CONTEXT === "public") {
    var tag = document.querySelector('script[data-roadie-context]');
    if (tag) CONTEXT = tag.getAttribute("data-roadie-context") || "public";
  }

  var GREETINGS = {
    "public":    "\uD83C\uDFB8 Hey! I'm Roadie. Need help finding artists?",
    "city":      "\uD83C\uDFB8 Looking for local artists? I can help you explore this city.",
    "events":    "\uD83C\uDFB8 Looking for live music tonight? Let's find something.",
    "dashboard": "\uD83C\uDFB8 Need help publishing today? I'm your studio assistant.",
    "discover":  "\uD83C\uDFB8 Hey! Want me to surface something incredible?",
    "about":     "\uD83C\uDFB8 Hey! Curious about ArtistsInMyCity? Ask me anything."
  };
  var QUICK = {
    "public":    ["Find Artists","Find Events","Explore Cities","Art Venues"],
    "city":      ["Find Venues","Find Galleries","Upcoming Events","Local Artists"],
    "events":    ["Live Music Tonight","This Weekend","Near Me","Free Events"],
    "dashboard": ["Improve My Profile","Help More People Find Me","Write Bio","Generate Gallery","Prepare For Launch"],
    "discover":  ["Trending","Near Me","New Exhibits","Surprise Me"],
    "about":     ["Find Artists","Explore Cities","Join","Help More People Find Me"]
  };

  function el(tag, cls, html){ var e=document.createElement(tag); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; }

  // ---- Build UI ----
  var root = el("div","roadie-root");
  var launcher = el("button","roadie-launcher","<span class='roadie-ava'><img class='roadie-ava-img' src='/assets/characters/roadie/roadie-default.png' alt='Roadie' onerror='this.remove()'>R</span><span class='roadie-launch-text'>Roadie</span><span class='roadie-dot'></span>");
  launcher.setAttribute("aria-label","Ask Roadie");

  var panel = el("div","roadie-panel");
  panel.innerHTML =
    "<div class='roadie-head'>"+
      "<span class='roadie-ava sm'><img class='roadie-ava-img' src='/assets/characters/roadie/roadie-default.png' alt='Roadie' onerror='this.remove()'>R</span>"+
      "<div class='roadie-head-txt'><strong>Roadie</strong><small>Creative Guide</small></div>"+
      "<span class='roadie-dot online' title='Online'></span>"+
      "<button class='roadie-close' aria-label='Close'>&times;</button>"+
    "</div>"+
    "<div class='roadie-body' id='roadieBody'></div>"+
    "<div class='roadie-quick' id='roadieQuick'></div>"+
    "<form class='roadie-input' id='roadieForm'>"+
      "<input type='text' id='roadieInput' placeholder='Ask Roadie anything...' autocomplete='off'>"+
      "<button type='submit' aria-label='Send'>&#10148;</button>"+
    "</form>";

  root.appendChild(panel); root.appendChild(launcher);
  document.body.appendChild(root);

  var body = panel.querySelector("#roadieBody");
  var quick = panel.querySelector("#roadieQuick");
  var form = panel.querySelector("#roadieForm");
  var input = panel.querySelector("#roadieInput");

  function addMsg(text, who){
    var m = el("div","roadie-msg "+(who||"bot"));
    m.textContent = text;
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
  }

    // Live Roadie: server-side Anthropic via Netlify Function. API key stays server-side only.
  var ROADIE_ENDPOINT = '/.netlify/functions/roadie-chat';
  var chatStarted = false;

  function roadieTrack(name, params){
    try { if (window.aimcTrack) window.aimcTrack(name, params || {}); } catch(e){}
    try { if (window.gtag) window.gtag('event', name, params || {}); } catch(e){}
  }

  function currentRole(){
    try { if (window.AIMCAuth && window.AIMCAuth.getRole && window.AIMCAuth.getRole()) return window.AIMCAuth.getRole(); } catch(e){}
    try {
      var mem = (window.RoadieMemory && window.RoadieMemory.getMemory) ? window.RoadieMemory.getMemory() : null;
      if (mem && mem.role && mem.role !== 'public') return mem.role;
    } catch(e){}
    if (CONTEXT === 'dashboard') return 'artist';
    if (CONTEXT === 'events' || CONTEXT === 'city') return 'fan';
    return 'public';
  }


  // Auth context supplied by clerk-auth.js (window.AIMCAuth / AIMCAuthContext).
  function authContext(){
    var a = { signedIn: false };
    try {
      if (window.AIMCAuth) {
        a.signedIn = !!(window.AIMCAuth.isSignedIn && window.AIMCAuth.isSignedIn());
        if (a.signedIn) {
          var u = window.AIMCAuth.getUser && window.AIMCAuth.getUser();
          if (u) { a.userId = u.id || null; a.firstName = u.firstName || (u.fullName ? u.fullName.split(" ")[0] : null) || null; }
          a.role = window.AIMCAuth.getRole && window.AIMCAuth.getRole();
        }
      } else if (window.AIMCAuthContext) {
        a = window.AIMCAuthContext;
      }
    } catch(e){}
    return a;
  }

  function pageContext(){
    var ctx = {};
    try {
      if (window.RoadieMemory && window.RoadieMemory.getMemory){
        var m = window.RoadieMemory.getMemory();
        if (m){
          if (m.selectedCities && m.selectedCities.length) ctx.recentCity = m.selectedCities[m.selectedCities.length-1];
          if (m.preferredArtForms && m.preferredArtForms.length) ctx.artForms = m.preferredArtForms.slice(0,5);
        }
      }
    } catch(e){}
    try { if (typeof window.RoadieStudioContext === 'function') ctx.studio = window.RoadieStudioContext(); } catch(e){}
    try { var h1 = document.querySelector('h1'); if (h1) ctx.pageTitle = (h1.textContent||'').trim().slice(0,120); } catch(e){}
    return ctx;
  }

  function showTyping(){
    var t = el('div','roadie-msg bot roadie-typing');
    t.setAttribute('data-typing','1');
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t); body.scrollTop = body.scrollHeight;
    return t;
  }
  function clearTyping(){ var t = body.querySelector('[data-typing]'); if (t && t.parentNode) t.parentNode.removeChild(t); }

  function renderSuggestions(list){
    if (!list || !list.length) return;
    quick.innerHTML = '';
    list.forEach(function(s){
      var b = el('button','roadie-chip',s);
      b.addEventListener('click', function(){ sendRoadieMessage(s); });
      quick.appendChild(b);
    });
  }

  // Sends a message to the live Roadie endpoint and renders the reply.
  function sendRoadieMessage(text){
    text = (text || '').trim();
    if (!text) return;
    addMsg(text,'user');
    try { if (window.RoadieMemory && window.RoadieMemory.rememberRoadieMessage) window.RoadieMemory.rememberRoadieMessage(text); } catch(e){}
    roadieTrack('roadie_message_sent', { page: location.pathname });
    showTyping();
    var payload = {
      message: text,
      role: currentRole(),
      page: location.pathname,
      context: pageContext(),
      memory: (window.RoadieMemory && window.RoadieMemory.getMemory) ? window.RoadieMemory.getMemory() : {},
      auth: authContext()
    };
    fetch(ROADIE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function(r){ return r.json(); })
      .then(function(data){
        clearTyping();
        if (data && data.reply){
          addMsg(data.reply,'bot');
          renderSuggestions(data.suggestions);
          roadieTrack('roadie_response_received', { mode: (data.mode || 'concierge') });
        } else {
          addMsg('Roadie is tuning up backstage. Try again in a moment.','bot');
          roadieTrack('roadie_error', { reason: 'empty' });
        }
      })
      .catch(function(){
        clearTyping();
        addMsg('Roadie is tuning up backstage. Try again in a moment.','bot');
        roadieTrack('roadie_error', { reason: 'network' });
      });
  }
  window.sendRoadieMessage = sendRoadieMessage;

  var opened = false, idleTimer=null;
  function open(){ opened=true; root.classList.add("open"); launcher.classList.remove("nudge"); if(body.childElementCount===0) greet(); input.focus(); if(!chatStarted){ chatStarted=true; roadieTrack('roadie_chat_started',{ page: location.pathname }); } }
  function close(){ opened=false; root.classList.remove("open"); }
  function greet(){
    addMsg(GREETINGS[CONTEXT]||GREETINGS.public,"bot");
    (QUICK[CONTEXT]||QUICK.public).forEach(function(q){
      var b=el("button","roadie-chip",q);
      b.addEventListener("click",function(){ sendRoadieMessage(q); });
      quick.appendChild(b);
    });
  }

  launcher.addEventListener("click", function(){ opened?close():open(); });
  panel.querySelector(".roadie-close").addEventListener("click", close);
  form.addEventListener("submit", function(e){ e.preventDefault(); var v=input.value.trim(); if(!v)return; input.value=""; sendRoadieMessage(v); });

  // Idle nudge: if ignored ~20s, tiny bounce (once). No spam.
  idleTimer = setTimeout(function(){ if(!opened) launcher.classList.add("nudge"); }, 20000);
})();
