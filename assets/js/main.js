/* Star.Academy — core UI: nav, night-vision, starfield, consent, forms, donations, video, lead CTAs */
(function(){
  'use strict';
  var SA = window.SA = window.SA || {};
  var $ = function(s,r){return (r||document).querySelector(s)};
  var $$ = function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  SA.$=$; SA.$$=$$;
  var store = {
    get:function(k,d){try{var v=localStorage.getItem('sa_'+k);return v===null?d:JSON.parse(v)}catch(e){return d}},
    set:function(k,v){try{localStorage.setItem('sa_'+k,JSON.stringify(v))}catch(e){}}
  };
  SA.store = store;

  /* ---------- recipient (never rendered, assembled only at send time) ---------- */
  function rcpt(){return ['moc.liamg','@1askrowbew'].join('').split('').reverse().join('')}

  /* ---------- night vision ---------- */
  if(store.get('red',false)) document.documentElement.classList.add('red');
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-redmode]'); if(!t) return;
    var on=document.documentElement.classList.toggle('red'); store.set('red',on);
    toast(on?'Night-vision mode on — protects your dark adaptation':'Night-vision mode off');
  });

  /* ---------- mobile menu ---------- */
  document.addEventListener('click',function(e){
    var b=e.target.closest('#menuToggle'); if(!b) return;
    var m=$('#menu'); var open=m.classList.toggle('open'); b.setAttribute('aria-expanded',open);
  });
  $$('[data-year]').forEach(function(el){el.textContent=new Date().getFullYear()});

  /* ---------- toast ---------- */
  function toast(msg){
    var t=$('#toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';document.body.appendChild(t)}
    t.textContent=msg;t.style.display='block';clearTimeout(t._h);t._h=setTimeout(function(){t.style.display='none'},2800);
  }
  SA.toast=toast;

  /* ---------- starfield ---------- */
  (function(){
    var c=document.getElementById('starfield'); if(!c||!c.getContext) return;
    var x=c.getContext('2d'), stars=[], w, h, dpr=Math.min(window.devicePixelRatio||1,2);
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function size(){w=innerWidth;h=innerHeight;c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';x.setTransform(dpr,0,0,dpr,0,0);
      var n=Math.round(w*h/9000);stars=[];for(var i=0;i<n;i++)stars.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.2+.2,p:Math.random()*6.28,s:.4+Math.random()*1.6});}
    var last=0;
    function draw(t){
      if(t-last<33&&!reduce){requestAnimationFrame(draw);return} last=t;
      x.clearRect(0,0,w,h);
      for(var i=0;i<stars.length;i++){var s=stars[i];var a=reduce?.7:(.45+.55*Math.abs(Math.sin(s.p+t/1000*s.s*.6)));
        x.globalAlpha=a;x.fillStyle=i%17===0?'#ffdf9e':(i%11===0?'#bfe9ff':'#ffffff');x.beginPath();x.arc(s.x,s.y,s.r,0,6.283);x.fill();}
      x.globalAlpha=1; if(!reduce&&!document.hidden) requestAnimationFrame(draw);
    }
    size(); addEventListener('resize',function(){size(); if(reduce) draw(0)});
    document.addEventListener('visibilitychange',function(){if(!document.hidden&&!reduce)requestAnimationFrame(draw)});
    requestAnimationFrame(draw);
  })();

  /* ---------- cookie notice ---------- */
  (function(){
    var c=$('#cookie'); if(!c) return;
    if(!store.get('cookie',false)) c.classList.add('show');
    c.addEventListener('click',function(e){ if(e.target.matches('[data-cookie]')){store.set('cookie',e.target.getAttribute('data-cookie'));c.classList.remove('show')} });
  })();

  /* ---------- forms (AJAX → hidden recipient) ---------- */
  SA.send = function(data){
    data._captcha='false'; data._template='table';
    data._url=location.href; data._submitted=new Date().toISOString();
    return fetch('https://formsubmit.co/ajax/'+rcpt(),{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(data)})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json().catch(function(){return {}}) });
  };
  function formData(f){
    var o={};
    $$('input,select,textarea',f).forEach(function(el){
      if(!el.name||el.disabled) return;
      if((el.type==='checkbox'||el.type==='radio')&&!el.checked) return;
      if(o[el.name]!==undefined){o[el.name]+=', '+el.value}else{o[el.name]=el.value}
    });
    return o;
  }
  SA.formData=formData;
  document.addEventListener('submit',function(e){
    var f=e.target; if(!f.matches('form[data-sa-form]')) return;
    e.preventDefault();
    var msg=$('.form-msg',f); var btn=$('button[type=submit]',f);
    var d=formData(f);
    if(d._honey){return}
    var type=f.getAttribute('data-sa-form');
    d._subject='[Star.Academy] '+(f.getAttribute('data-subject')||type)+(d.name?' — '+d.name:'');
    d.form_type=type;
    if(btn){btn.disabled=true;btn._t=btn.textContent;btn.textContent='Sending…'}
    var leads=store.get('leads',[]); leads.push({t:Date.now(),type:type}); store.set('leads',leads.slice(-20));
    if(d.email) store.set('email',d.email);
    SA.send(d).then(function(){
      if(msg){msg.className='form-msg ok';msg.textContent=f.getAttribute('data-ok')||'Thank you! Your message is on its way. We reply within 1–2 business days.'}
      f.dispatchEvent(new CustomEvent('sa:sent',{detail:d}));
      $$('input:not([type=hidden]):not([type=checkbox]):not([type=radio]),textarea',f).forEach(function(i){if(!i.hasAttribute('data-keep'))i.value=''});
      if(window.gtag) try{gtag('event','generate_lead',{form:type})}catch(_){}
    }).catch(function(){
      if(msg){msg.className='form-msg err';msg.textContent='Network hiccup — please try again in a moment.'}
    }).then(function(){ if(btn){btn.disabled=false;btn.textContent=btn._t} });
  });
  // prefill remembered email
  var em=store.get('email','');
  if(em) $$('input[type=email]').forEach(function(i){ if(!i.value) i.value=em });

  /* ---------- donations (PayPal link assembled at click) ---------- */
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-donate]'); if(!b) return;
    e.preventDefault();
    var amt=b.getAttribute('data-donate');
    if(amt==='custom'){var v=($('#customAmount')||{}).value; amt=(v&&+v>0)?(+v).toFixed(2):''}
    var purpose=b.getAttribute('data-purpose')||'Support Star.Academy';
    var u='https://www.paypal.com/donate/?business='+encodeURIComponent(rcpt())+'&no_recurring=0&currency_code=USD&item_name='+encodeURIComponent(purpose)+(amt?'&amount='+amt:'');
    window.open(u,'_blank','noopener');
    toast('Opening secure PayPal checkout… thank you! ✨');
  });

  /* ---------- lazy YouTube (privacy-enhanced) ---------- */
  SA.videoHTML=function(v){
    return '<div class="vcard"><div class="video" data-yt="'+v.id+'" style="background-image:url(https://i.ytimg.com/vi/'+v.id+'/hqdefault.jpg)" role="button" tabindex="0" aria-label="Play video: '+esc(v.title)+'"></div>'+
      '<h4>'+esc(v.title)+'</h4><div class="tiny muted">'+esc(v.channel||'')+(v.published?' · '+new Date(v.published).toLocaleDateString():'')+'</div></div>';
  };
  function play(el){ if(el.classList.contains('playing')) return; el.classList.add('playing');
    el.innerHTML='<iframe src="https://www.youtube-nocookie.com/embed/'+el.getAttribute('data-yt')+'?autoplay=1&rel=0" title="YouTube video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>'; }
  document.addEventListener('click',function(e){var v=e.target.closest('.video[data-yt]'); if(v) play(v)});
  document.addEventListener('keydown',function(e){var v=e.target.closest&&e.target.closest('.video[data-yt]'); if(v&&(e.key==='Enter'||e.key===' ')){e.preventDefault();play(v)}});

  /* ---------- data loader: live first, cached JSON fallback ---------- */
  SA.root = (document.documentElement.getAttribute('data-root')||'');
  SA.getJSON=function(url,ms){
    return new Promise(function(res,rej){
      var done=false, ctl=window.AbortController?new AbortController():null;
      var t=setTimeout(function(){ if(!done){done=true; if(ctl)ctl.abort(); rej(new Error('timeout'))} }, ms||7000);
      fetch(url,ctl?{signal:ctl.signal}:{}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()})
        .then(function(j){if(!done){done=true;clearTimeout(t);res(j)}}).catch(function(e){if(!done){done=true;clearTimeout(t);rej(e)}});
    });
  };
  SA.cached=function(name){ return SA.getJSON(SA.root+'data/'+name+'.json?v='+Math.floor(Date.now()/36e5),8000) };
  SA.liveOrCached=function(liveUrl,transform,name){
    return SA.getJSON(liveUrl,6500).then(transform).catch(function(){ return SA.cached(name) });
  };
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  SA.esc=esc;

  /* ---------- home/any: latest videos block ---------- */
  $$('[data-videos]').forEach(function(box){
    var n=+box.getAttribute('data-videos')||6, ch=box.getAttribute('data-channel');
    SA.cached('videos').then(function(d){
      var list=(d.videos||d||[]); if(ch) list=list.filter(function(v){return (v.channel||'').toLowerCase().indexOf(ch.toLowerCase())>-1});
      if(!list.length) return;
      box.innerHTML=list.slice(0,n).map(SA.videoHTML).join('');
    }).catch(function(){});
  });

  /* ---------- sticky mobile CTA + exit intent ---------- */
  var sticky=$('#stickycta');
  if(sticky){ addEventListener('scroll',function(){ sticky.classList.toggle('show', scrollY>650) },{passive:true}); }
  var modal=$('#leadModal');
  function showModal(){ if(!modal) return; var last=store.get('exit',0); if(Date.now()-last<7*864e5) return; store.set('exit',Date.now()); modal.classList.add('show'); }
  if(modal && !/get-started/.test(location.pathname)){
    var armed=false; setTimeout(function(){armed=true},12000);
    document.addEventListener('mouseout',function(e){ if(armed && !e.relatedTarget && e.clientY<8) showModal() });
    modal.addEventListener('click',function(e){ if(e.target===modal||e.target.closest('.x')) modal.classList.remove('show') });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') modal.classList.remove('show') });
  }

  /* ---------- share buttons ---------- */
  document.addEventListener('click',function(e){
    var b=e.target.closest('[data-share]'); if(!b) return; e.preventDefault();
    var d={title:document.title,text:b.getAttribute('data-share')||document.title,url:location.href};
    if(navigator.share){navigator.share(d).catch(function(){})}
    else if(navigator.clipboard){navigator.clipboard.writeText(d.url);toast('Link copied — share the stars!')}
  });

  /* ---------- AdSense auto-ads push for any manual units ---------- */
  $$('ins.adsbygoogle').forEach(function(){ try{(window.adsbygoogle=window.adsbygoogle||[]).push({})}catch(e){} });
})();
