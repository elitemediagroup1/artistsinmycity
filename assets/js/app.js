(function(){
  const $=(s,p=document)=>p.querySelector(s);
  const $$=(s,p=document)=>[...p.querySelectorAll(s)];
  $('[data-menu]')?.addEventListener('click',()=>$('.site-header').classList.toggle('menu-open'));
  $$('[data-search]').forEach(f=>f.addEventListener('submit',e=>{e.preventDefault();const q=new FormData(f).get('q')||'';location.href='/pages/search.html?q='+encodeURIComponent(q)}));
  $('[data-demo-search]')?.addEventListener('click',()=>location.href='/pages/search.html?q=preview');
  const params=new URLSearchParams(location.search);
  if($('[data-search-results]')) $('[data-search-results]').textContent=`Search preview for “${params.get('q')||'all artists'}”. Live artists will appear here after profiles are added.`;
  if($('[data-city-title]')) $('[data-city-title]').textContent=(params.get('city')||'City')+' Artists';
  if($('[data-category-title]')) $('[data-category-title]').textContent=(params.get('type')||'Category')+' Artists';
  const log=$('[data-chat-log]');
  $('[data-ai-form]')?.addEventListener('submit',e=>{e.preventDefault();const input=e.target.prompt;const text=input.value.trim();if(!text)return;log.insertAdjacentHTML('beforeend',`<div class="me">${text.replace(/[<>]/g,'')}</div>`);const reply='Preview AI response: I can turn that into structured profile updates, SEO title, AEO answers, captions, and layout changes. Real Claude connection will run through a secure Netlify function.';log.insertAdjacentHTML('beforeend',`<div class="ai">${reply}</div>`);$('[data-bio-preview]').textContent=text;localStorage.setItem('aimc_last_prompt',text);input.value='';log.scrollTop=log.scrollHeight;});
  $('[data-preview]')?.addEventListener('click',()=>alert('Preview generated. In production this opens a Netlify deploy preview or draft profile preview.'));
  $('[data-publish]')?.addEventListener('click',()=>alert('Publish preview. In production this commits approved changes through GitHub API and triggers Netlify.'));
  $('[data-undo]')?.addEventListener('click',()=>alert('Undo preview. In production this restores the previous saved version or Netlify deploy.'));
})();
