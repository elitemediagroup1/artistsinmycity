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
