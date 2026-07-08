(function(){
  const $=(s,p=document)=>p.querySelector(s);
  const $$=(s,p=document)=>[...p.querySelectorAll(s)];
  $('[data-menu]')?.addEventListener('click',()=>$('.site-header').classList.toggle('menu-open'));
  $$('[data-search]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const q=new FormData(f).get('q')||'';location.href='/pages/search.html?q='+encodeURIComponent(q)}));
  $('[data-demo-search]')?.addEventListener('click',()=>location.href='/pages/search.html?q=preview');
  const params=new URLSearchParams(location.search);
  if($('[data-search-results]')) $('[data-search-results]').textContent=`Search preview for â${params.get('q')||'all artists'}â. Live artists will appear here after profiles are added.`;
  if($('[data-city-title]')) $('[data-city-title]').textContent=(params.get('city')||'City')+' Artists';
  if($('[data-category-title]')) $('[data-category-title]').textContent=(params.get('type')||'Category')+' Artists';
  const log=$('[data-chat-log]');
  $('[data-ai-form]')?.addEventListener('submit',e=>{e.preventDefault();const input=e.target.prompt;const text=input.value.trim();if(!text)return;log.insertAdjacentHTML('beforeend',`<div class="me">${text.replace(/[<>]/g,'')}</div>`);const reply='Preview AI response: I can turn that into structured profile updates, SEO title, AEO answers, captions, and layout changes. Real Claude connection will run through a secure Netlify function.';log.insertAdjacentHTML('beforeend',`<div class="ai">${reply}</div>`);$('[data-bio-preview]').textContent=text;localStorage.setItem('aimc_last_prompt',text);input.value='';log.scrollTop=log.scrollHeight;});
  $('[data-preview]')?.addEventListener('click',()=>alert('Preview generated. In production this opens a Netlify deploy preview or draft profile preview.'));
  $('[data-publish]')?.addEventListener('click',()=>alert('Publish preview. In production this commits approved changes through GitHub API and triggers Netlify.'));
  $('[data-undo]')?.addEventListener('click',()=>alert('Undo preview. In production this restores the previous saved version or Netlify deploy.'));
})();


/* ===== Sprint 3 additions ===== */
/* Hero cinematic carousel */
(function(){
  var root = document.querySelector('.hero-cinematic');
  if(!root) return;
  var slides = [].slice.call(root.querySelectorAll('.hero-slide'));
  var dots = [].slice.call(root.querySelectorAll('.hero-dot'));
  var label = root.querySelector('.hero-kind-label');
  if(slides.length < 2) return;
  var i = 0, timer = null;
  function show(n){
    i = (n + slides.length) % slides.length;
    slides.forEach(function(s,x){ s.classList.toggle('is-active', x===i); });
    dots.forEach(function(d,x){ d.classList.toggle('is-active', x===i); });
    if(label && slides[i].dataset.kind) label.textContent = slides[i].dataset.kind;
    var copy = root.querySelector('.hero-copy');
    if(copy){
      var ds = slides[i].dataset;
      var h1 = copy.querySelector('h1');
      var sub = copy.querySelector('.hero-sub');
      var cta = copy.querySelector('.hero-actions .btn.hot');
      if(h1 && ds.title){ h1.innerHTML = ds.title; }
      if(sub && ds.sub){ sub.textContent = ds.sub; }
      if(cta){ if(ds.cta){ cta.textContent = ds.cta; } if(ds.href){ cta.setAttribute('href', ds.href); } }
    }
  }
  function next(){ show(i+1); }
  function start(){ stop(); timer = setInterval(next, 5000); }
  function stop(){ if(timer) clearInterval(timer); }
  dots.forEach(function(d,x){ d.addEventListener('click', function(){ show(x); start(); }); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  show(0); start();
})();

/* Footer flag line: Built with love in the USA */
(function(){
  var f = document.querySelector('footer.footer');
  if(!f || f.querySelector('.footer-usa')) return;
  var span = document.createElement('span');
  span.className = 'footer-usa';
  span.innerHTML = 'Built with \u2764\uFE0F in the USA';
  f.appendChild(span);
})();


/* ===== Sprint 8: Live Services (Roadie Maps helpers, autocomplete, city guide) ===== */
(function(){
  'use strict';
  if (window.__liveServices) return; window.__liveServices = true;

  function liveTrack(name, params){
    try { if (window.aimcTrack) window.aimcTrack(name, params || {}); } catch(e){}
    try { if (window.gtag) window.gtag('event', name, params || {}); } catch(e){}
  }
  function postJSON(path, bodyObj){
    return fetch(path, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(bodyObj) }).then(function(r){ return r.json(); });
  }

  window.MapsLive = {
    autocomplete: function(input, opts){ opts = opts || {}; return postJSON('/.netlify/functions/maps-autocomplete', { input: input, types: opts.types || ['city','postal_code'], country: opts.country || 'us' }); },
    creativeSearch: function(opts){ opts = opts || {}; return postJSON('/.netlify/functions/maps-creative-search', { location: opts.location || '', lat: opts.lat, lng: opts.lng, radius: opts.radius || 8000, category: opts.category }); }
  };

  // Inject styles once
  var style = document.createElement('style');
  style.setAttribute('data-live-services','1');
  style.textContent = ".live-guide{max-width:1160px;margin:16px auto;padding:28px 20px}.live-guide h2{font-size:clamp(22px,3vw,30px);margin:0 0 6px;font-weight:900}.live-guide .lg-sub{color:#9ca8bb;margin:0 0 18px;font-size:14px}.lg-cats{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}.lg-btn{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#f8fbff;border-radius:999px;padding:9px 16px;font-size:13px;font-weight:700;cursor:pointer;transition:transform .15s ease,background .2s ease}.lg-btn:hover{transform:translateY(-1px);background:rgba(138,92,255,.18)}.lg-btn[aria-pressed=true]{background:linear-gradient(120deg,#ff5ca8,#8a5cff);border-color:transparent}.lg-status{color:#9ca8bb;font-size:14px;margin:6px 0 14px}.lg-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}.lg-card{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);border-radius:16px;padding:16px}.lg-card h3{margin:0 0 6px;font-size:16px}.lg-card p{margin:0 0 8px;color:#9ca8bb;font-size:13px;line-height:1.4}.lg-rate{color:#ffd166;font-size:13px;font-weight:700}.lg-link{display:inline-block;margin-top:8px;color:#3ec6ff;font-size:13px;font-weight:700;text-decoration:none}.lg-link:hover{text-decoration:underline}.ac-dropdown{position:absolute;z-index:10000;background:#0c101a;border:1px solid rgba(255,255,255,.14);border-radius:12px;overflow:hidden;box-shadow:0 18px 50px rgba(0,0,0,.5);min-width:220px}.ac-item{padding:10px 14px;font-size:14px;color:#f8fbff;cursor:pointer}.ac-item:hover,.ac-item.active{background:rgba(138,92,255,.22)}.live-venue{max-width:1160px;margin:16px auto;padding:24px 20px}.live-venue .lv-row{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.live-venue input,.live-venue select{padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.04);color:#f8fbff;font-size:14px}.live-venue .lg-btn{padding:10px 18px}";
  document.head.appendChild(style);

  function ctxOf(){ var t = document.querySelector('script[data-roadie-context]'); return t ? (t.getAttribute('data-roadie-context')||'') : ''; }

  function cityName(){
    var h1 = document.querySelector('h1');
    var t = h1 ? (h1.textContent||'').trim() : '';
    if (!t) t = (document.title||'').trim();
    t = t.split('|')[0];
    t = t.replace(/artists?/i,'').replace(/in my city/i,'').replace(/[-\u2013\u2014].*$/,'').trim();
    return t || null;
  }

  function esc(s){ return (s==null)?'':String(s); }

  function renderPlaces(container, data){
    container.innerHTML = '';
    var places = (data && data.places) || [];
    if (!places.length){
      var msg = document.createElement('p'); msg.className='lg-status';
      msg.textContent = (data && data.message) || 'No results found nearby. Try a nearby city or a wider search.';
      container.appendChild(msg); return;
    }
    places.forEach(function(p){
      var card = document.createElement('div'); card.className='lg-card';
      var h = document.createElement('h3'); h.textContent = esc(p.name); card.appendChild(h);
      if (p.address){ var a = document.createElement('p'); a.textContent = esc(p.address); card.appendChild(a); }
      if (p.rating != null){ var rt = document.createElement('div'); rt.className='lg-rate'; rt.textContent = '\u2605 ' + p.rating + (p.user_ratings_total ? (' (' + p.user_ratings_total + ')') : ''); card.appendChild(rt); }
      if (p.google_maps_url){ var lk = document.createElement('a'); lk.className='lg-link'; lk.href = p.google_maps_url; lk.target='_blank'; lk.rel='noopener noreferrer'; lk.textContent='Open in Google Maps'; card.appendChild(lk); }
      container.appendChild(card);
    });
  }

  function runSearch(opts, statusEl, resultsEl, btn){
    statusEl.textContent = 'Finding great spots\u2026';
    resultsEl.innerHTML = '';
    if (btn) btn.setAttribute('aria-pressed','true');
    liveTrack('local_search', { category: opts.category, location: opts.location || '' });
    window.MapsLive.creativeSearch(opts).then(function(data){
      statusEl.textContent = '';
      renderPlaces(resultsEl, data);
    }).catch(function(){ statusEl.textContent = 'Local search is unavailable right now. Please try again.'; });
  }

  var CITY_CATS = [
    ['art_gallery','Art Galleries'],['museum','Museums'],['music_venue','Music Venues'],
    ['art_supply','Art Supply Stores'],['recording_studio','Recording Studios'],['photography_studio','Photography Studios'],
    ['coffee_shop','Coffee Shops Artists Love'],['coworking','Coworking Spaces'],['frame_shop','Frame Shops'],['print_shop','Print Shops']
  ];

  function mountCityGuide(){
    if (document.querySelector('.live-guide')) return;
    var city = cityName();
    var section = document.createElement('section'); section.className='live-guide'; section.setAttribute('aria-label','Local creative guide');
    var h = document.createElement('h2'); h.textContent = city ? ('Explore ' + city + ' in person') : 'Explore your city in person'; section.appendChild(h);
    var sub = document.createElement('p'); sub.className='lg-sub'; sub.textContent = 'Real nearby places powered by Google Maps. Tap a category to find spots artists love.'; section.appendChild(sub);
    var cats = document.createElement('div'); cats.className='lg-cats'; section.appendChild(cats);
    var status = document.createElement('div'); status.className='lg-status'; section.appendChild(status);
    var results = document.createElement('div'); results.className='lg-results'; section.appendChild(results);
    CITY_CATS.forEach(function(c){
      var b = document.createElement('button'); b.className='lg-btn'; b.type='button'; b.textContent = c[1];
      b.addEventListener('click', function(){
        var all = cats.querySelectorAll('.lg-btn'); for (var i=0;i<all.length;i++) all[i].setAttribute('aria-pressed','false');
        runSearch({ location: city || '', category: c[0] }, status, results, b);
      });
      cats.appendChild(b);
    });
    var footer = document.querySelector('footer'); if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer); else document.body.appendChild(section);
  }

  function mountEventsVenue(){
    if (document.querySelector('.live-venue')) return;
    var section = document.createElement('section'); section.className='live-venue'; section.setAttribute('aria-label','Find a venue');
    var h = document.createElement('h2'); h.textContent='Find a Venue Near You'; h.style.fontSize='24px'; h.style.fontWeight='900'; h.style.margin='0 0 6px'; section.appendChild(h);
    var sub = document.createElement('p'); sub.className='lg-sub'; sub.style.color='#9ca8bb'; sub.style.margin='0 0 14px'; sub.textContent='Venue locations are powered by Google Maps. Live event listings come from our ticketing partners.'; section.appendChild(sub);
    var row = document.createElement('div'); row.className='lv-row'; section.appendChild(row);
    var loc = document.createElement('input'); loc.type='text'; loc.placeholder='City or ZIP'; row.appendChild(loc);
    var sel = document.createElement('select');
    [['music_venue','Music Venues'],['performing_arts','Performing Arts'],['art_gallery','Galleries']].forEach(function(o){ var op=document.createElement('option'); op.value=o[0]; op.textContent=o[1]; sel.appendChild(op); });
    row.appendChild(sel);
    var btn = document.createElement('button'); btn.className='lg-btn'; btn.type='button'; btn.textContent='Find Venues'; row.appendChild(btn);
    var status = document.createElement('div'); status.className='lg-status'; section.appendChild(status);
    var results = document.createElement('div'); results.className='lg-results'; section.appendChild(results);
    btn.addEventListener('click', function(){ if(!loc.value.trim()){ status.textContent='Enter a city or ZIP to search venues.'; return; } runSearch({ location: loc.value.trim(), category: sel.value }, status, results, null); });
    attachAutocomplete(loc);
    var footer = document.querySelector('footer'); if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer); else document.body.appendChild(section);
  }

  function attachAutocomplete(inputEl){
    if (!inputEl || inputEl.__acBound) return; inputEl.__acBound = true;
    var dd = document.createElement('div'); dd.className='ac-dropdown'; dd.style.display='none'; document.body.appendChild(dd);
    var items = [], active = -1, timer = null;
    function place(){ var r = inputEl.getBoundingClientRect(); dd.style.left = (r.left + window.scrollX) + 'px'; dd.style.top = (r.bottom + window.scrollY + 4) + 'px'; dd.style.width = r.width + 'px'; }
    function hide(){ dd.style.display='none'; active=-1; }
    function choose(it){ inputEl.value = it.description || it.label || ''; hide(); try { if (window.RoadieMemory && it.city) window.RoadieMemory.rememberCity(it.city); } catch(e){} liveTrack('location_selected', { place: it.label || null, city: it.city || null }); var ev=document.createEvent('Event'); ev.initEvent('change',true,true); inputEl.dispatchEvent(ev); }
    function render(){ dd.innerHTML=''; if(!items.length){ hide(); return; } place(); items.forEach(function(it,idx){ var d=document.createElement('div'); d.className='ac-item'+(idx===active?' active':''); d.textContent = it.description || it.label; d.addEventListener('mousedown', function(e){ e.preventDefault(); choose(it); }); dd.appendChild(d); }); dd.style.display='block'; }
    inputEl.addEventListener('input', function(){ var v = inputEl.value.trim(); if (v.length < 3){ hide(); return; } clearTimeout(timer); timer = setTimeout(function(){ liveTrack('location_search', { q: v }); window.MapsLive.autocomplete(v).then(function(res){ items = (res && res.predictions) || []; active=-1; render(); }).catch(function(){ hide(); }); }, 260); });
    inputEl.addEventListener('keydown', function(e){ if (dd.style.display==='none') return; if (e.key==='ArrowDown'){ e.preventDefault(); active=Math.min(active+1, items.length-1); render(); } else if (e.key==='ArrowUp'){ e.preventDefault(); active=Math.max(active-1,0); render(); } else if (e.key==='Enter'){ if (active>=0 && items[active]){ e.preventDefault(); choose(items[active]); } } else if (e.key==='Escape'){ hide(); } });
    inputEl.addEventListener('blur', function(){ setTimeout(hide, 150); });
    window.addEventListener('scroll', function(){ if (dd.style.display!=='none') place(); }, true);
  }

  function isTextInput(el){ var t = (el.getAttribute('type')||el.type||'text').toLowerCase(); return t==='text' || t==='search'; }
  function initSearchAutocomplete(){
    var sel = ['[data-search] input','input[data-location-search]','input[placeholder*="ZIP"]','input[placeholder*="City"]','input[placeholder*="city"]','input[placeholder*="category"]'];
    var inputs = document.querySelectorAll(sel.join(','));
    for (var i=0;i<inputs.length;i++){ if (isTextInput(inputs[i])) attachAutocomplete(inputs[i]); }
  }

  function init(){
    var ctx = ctxOf();
    try { initSearchAutocomplete(); } catch(e){}
    try { if (ctx === 'city') mountCityGuide(); } catch(e){}
    try { if (ctx === 'events') mountEventsVenue(); } catch(e){}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
