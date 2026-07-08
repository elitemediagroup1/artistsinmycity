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
    "dashboard": ["Write Bio","Improve SEO","Generate Gallery","Publish"],
    "discover":  ["Trending","Near Me","New Exhibits","Surprise Me"],
    "about":     ["Find Artists","Explore Cities","Join","SEO Help"]
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

  // Placeholder responder. Replace with server-side Claude call later.
  function sendRoadieMessage(text){
    addMsg(text,"user");
    setTimeout(function(){
      addMsg("Thanks! Roadie's live AI is opening soon \u2014 for now, explore Artists, Cities and Events from the menu.","bot");
    }, 500);
  }
  window.sendRoadieMessage = sendRoadieMessage;

  var opened = false, idleTimer=null;
  function open(){ opened=true; root.classList.add("open"); launcher.classList.remove("nudge"); if(body.childElementCount===0) greet(); input.focus(); }
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
