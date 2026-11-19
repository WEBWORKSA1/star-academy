/* Star.Academy — page controllers */
(function(){
  'use strict';
  var SA=window.SA, $=SA.$, $$=SA.$$, esc=SA.esc, page=document.body.getAttribute('data-page');
  var sky=SA.sky;

  /* ================= shared renderers ================= */
  function renderLocName(){ $$('[data-locname]').forEach(function(el){ el.textContent=sky.locOrDefault().name }); $$('[data-tzlabel]').forEach(function(el){ el.textContent=sky.tzLabel() }) }
  function moonBlock(n){
    var c=$('#moonCanvas'); if(c) sky.drawMoon(c,n.moon.phase);
    set('#moonName',n.moon.name); set('#moonIllum',Math.round(n.moon.illum*100)+'% lit');
    set('#moonAge','Age '+n.moon.age.toFixed(1)+' days · '+Math.round(n.moon.dist).toLocaleString()+' km away');
    set('#moonRise',sky.fmtT(n.moon.rise)); set('#moonSet',sky.fmtT(n.moon.set));
  }
  function set(sel,v,html){ $$(sel).forEach(function(el){ if(html) el.innerHTML=v; else el.textContent=v }) }
  function countdown(el,target){
    function tick(){ var ms=target-Date.now(); if(ms<0){el.textContent='Happening now / just passed';return}
      var dd=Math.floor(ms/864e5),h=Math.floor(ms%864e5/36e5),m=Math.floor(ms%36e5/6e4),s=Math.floor(ms%6e4/1e3);
      el.textContent=(dd?dd+'d ':'')+h+'h '+m+'m '+s+'s'; }
    tick(); clearInterval(el._i); el._i=setInterval(tick,1000);
  }
  SA.countdown=countdown;

  function apod(box){
    if(!box) return;
    SA.liveOrCached('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY',function(j){if(!j||!j.title)throw 0;return j},'apod').then(function(a){
      if(!a||!a.title||!a.url||/\/themes\//.test(a.url)||a.title==='NASA Science'||a.title==='Astronomy Picture of the Day') throw 0;
      var media=a.media_type==='video'?(a.url&&/youtube|vimeo/.test(a.url)?'<div class="video playing"><iframe src="'+esc(a.url)+'" title="'+esc(a.title)+'" allowfullscreen loading="lazy"></iframe></div>':'<a class="btn btn-ghost" href="'+esc(a.url)+'" target="_blank" rel="noopener">Watch today’s APOD video</a>')
        :'<a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener"><img class="apod-img" loading="lazy" src="'+esc(a.url)+'" alt="'+esc(a.title)+'"></a>';
      box.innerHTML=media+'<h3 style="margin-top:14px">'+esc(a.title)+'</h3><div class="tiny dim">'+esc(a.date||'')+(a.copyright?' · Image credit & copyright: '+esc(a.copyright.trim()):' · Credit: NASA / APOD')+'</div><p class="muted small" style="margin-top:10px">'+esc((a.explanation||'').slice(0,420))+'… <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener">Read on APOD</a></p>';
    }).catch(function(){ box.innerHTML='<p class="muted">Today’s Astronomy Picture of the Day is on <a href="https://apod.nasa.gov/apod/astropix.html" target="_blank" rel="noopener">apod.nasa.gov</a>.</p>' });
  }
  function normLaunch(l){ return {name:l.name,net:l.net||l.window_start,provider:(l.launch_service_provider&&l.launch_service_provider.name)||l.lsp_name||'',location:(l.pad&&l.pad.location&&l.pad.location.name)||l.location||'',status:(l.status&&(l.status.abbrev||l.status.name))||'',image:l.image||''} }
  function launches(box,n){
    if(!box) return;
    SA.liveOrCached('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=10&hide_recent_previous=true',function(j){ if(!j.results)throw 0; return {launches:j.results.map(normLaunch)} },'launches').then(function(d){
      var L=(d.launches||[]).filter(function(l){return new Date(l.net)>Date.now()-3*36e5}).slice(0,n||6);
      if(!L.length) throw 0;
      box.innerHTML=L.map(function(l,i){ return '<div class="event"><div class="d"><span class="tiny muted">'+new Date(l.net).toLocaleDateString([], {month:'short'})+'</span><b>'+new Date(l.net).getDate()+'</b></div><div><strong>'+esc(l.name)+'</strong><div class="tiny muted">'+esc(l.provider)+(l.location?' · '+esc(l.location):'')+(l.status?' · <span class="pill">'+esc(l.status)+'</span>':'')+'</div><div class="tiny dim">'+sky.fmtDT(new Date(l.net))+' ('+sky.tzLabel()+')</div></div><div class="act">'+(i===0?'<span class="countdown small" data-cd="'+l.net+'"></span>':'')+'</div></div>' }).join('');
      $$('[data-cd]',box).forEach(function(el){countdown(el,new Date(el.getAttribute('data-cd')))});
    }).catch(function(){ box.innerHTML='<p class="muted">Launch schedule is refreshing. See <a href="https://www.rocketlaunch.live" target="_blank" rel="noopener">RocketLaunch.Live</a> meanwhile.</p>' });
  }
  var KPLAT=[66.5,64.5,62.4,60.4,58.3,56.3,54.2,52.2,50.1,48.1];
  function normKp(j){ var rows=[];
    if(Array.isArray(j)&&Array.isArray(j[0])){ for(var i=1;i<j.length;i++) rows.push({t:j[i][0],kp:+j[i][1],obs:j[i][2]}) }
    else if(Array.isArray(j)) rows=j.map(function(r){return {t:r.time_tag,kp:+(r.kp!=null?r.kp:r.Kp),obs:r.observed}});
    if(!rows.length) throw 0; return {forecast:rows} }
  function kp(box){
    if(!box) return;
    SA.liveOrCached('https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json',normKp,'spaceweather').then(function(d){
      var now=Date.now(), f=(d.forecast||[]).map(function(r){return {t:new Date(r.t.replace(' ','T')+(/Z$/.test(r.t)?'':'Z')),kp:r.kp,obs:r.obs}});
      var next=f.filter(function(r){return r.t>=now-3*36e5&&r.t<=now+24*36e5}); if(!next.length) next=f.slice(-8);
      var mx=next.reduce(function(m,r){return Math.max(m,r.kp)},0), cur=(f.filter(function(r){return r.t<=now}).pop()||next[0]||{kp:0}).kp;
      var lvl=mx>=7?['Severe storm','red']:mx>=5?['Geomagnetic storm','gold']:mx>=4?['Active','cyan']:['Quiet','green'];
      box.innerHTML='<div class="kpis"><div class="kpi"><div class="l">Kp now</div><div class="v">'+cur.toFixed(1)+'</div></div><div class="kpi"><div class="l">Max next 24h</div><div class="v">'+mx.toFixed(1)+'</div></div><div class="kpi"><div class="l">Status</div><div class="v"><span class="pill '+lvl[1]+'">'+lvl[0]+'</span></div></div><div class="kpi"><div class="l">Aurora reach</div><div class="v">~'+KPLAT[Math.min(9,Math.round(mx))]+'°</div></div></div><p class="tiny dim" style="margin-top:10px">Kp from NOAA SWPC. "Aurora reach" ≈ lowest geomagnetic latitude where aurora may be seen on the horizon under dark, clear skies.</p>';
    }).catch(function(){ box.innerHTML='<p class="muted">Space-weather data refreshing — check <a href="https://www.swpc.noaa.gov/products/aurora-30-minute-forecast" target="_blank" rel="noopener">NOAA SWPC</a>.</p>' });
  }
  function news(box,n){
    if(!box) return;
    SA.liveOrCached('https://api.spaceflightnewsapi.net/v4/articles/?limit=12',function(j){ if(!j.results)throw 0; return {articles:j.results.map(function(a){return {title:a.title,url:a.url,image:a.image_url,site:a.news_site,summary:a.summary,published:a.published_at}})} },'news').then(function(d){
      var A=(d.articles||[]).slice(0,n||6); if(!A.length) throw 0;
      box.innerHTML=A.map(function(a){return '<a class="card" href="'+esc(a.url)+'" target="_blank" rel="noopener nofollow">'+(a.image?'<img class="newsimg" loading="lazy" src="'+esc(a.image)+'" alt="" onerror="this.remove()">':'')+'<span class="pill">'+esc(a.site||'News')+'</span><h3 style="font-size:1.02rem;margin-top:8px">'+esc(a.title)+'</h3><p class="small muted">'+esc((a.summary||'').slice(0,140))+'…</p><div class="tiny dim">'+(a.published?new Date(a.published).toLocaleDateString():'')+'</div></a>'}).join('');
    }).catch(function(){ box.innerHTML='<p class="muted">Headlines refreshing…</p>' });
  }
  SA.parts={apod:apod,launches:launches,kp:kp,news:news};

  /* ================= HOME ================= */
  if(page==='home'){
    sky.bindLocUI(document);
    function draw(){ var loc=sky.locOrDefault(), n=sky.night(loc,new Date()); renderLocName(); moonBlock(n);
      set('#sunset',sky.fmtT(n.sunset)); set('#darkStart',sky.fmtT(n.dark)); set('#darkEnd',sky.fmtT(n.darkEnd));
      set('#visPlanets', n.visible.length? n.visible.map(function(p){return '<span class="pill gold">'+p.name+' · '+p.verdict.replace(' · telescope','')+'</span>'}).join(' ') : '<span class="muted small">No bright planets well placed tonight — perfect for the Moon and stars.</span>',true);
    }
    draw(); document.addEventListener('sa:loc',draw);
    var nb=sky.nextBig(); if(nb){ set('#nbTitle',nb.title); set('#nbDate',sky.fmtD(nb.t,{weekday:'long',month:'long',day:'numeric',year:'numeric'})); set('#nbDesc',nb.desc); var cd=$('#nbCount'); if(cd) countdown(cd,nb.t) }
    var up=sky.events(new Date(),45).slice(0,6);
    set('#upcoming',up.map(function(e){return '<div class="event"><div class="d"><span class="tiny muted">'+e.t.toLocaleDateString([], {month:'short'})+'</span><b>'+e.t.getDate()+'</b></div><div><strong>'+esc(e.title)+'</strong><div class="tiny muted">'+esc(e.desc.slice(0,110))+'…</div></div></div>'}).join(''),true);
    apod($('#apodBox')); launches($('#launchBox'),3); kp($('#kpBox'));
  }

  /* ================= TONIGHT ================= */
  if(page==='tonight'){
    sky.bindLocUI(document);
    var offset=0, labels=true;
    function render(){
      var loc=sky.locOrDefault(), n=sky.night(loc,new Date()); renderLocName(); moonBlock(n);
      set('#kSunset',sky.fmtT(n.sunset)); set('#kDark',sky.fmtT(n.dark)); set('#kDarkEnd',sky.fmtT(n.darkEnd)); set('#kSunrise',sky.fmtT(n.sunrise));
      set('#kCivil',sky.fmtT(n.civil)); set('#kNaut',sky.fmtT(n.naut)); set('#kDay',n.daylen?n.daylen.toFixed(1)+' h':'—');
      set('#quarters',n.quarters.map(function(q){return '<div class="kpi"><div class="l">'+sky.QN[q.q]+'</div><div class="v" style="font-size:1.05rem">'+sky.fmtD(q.time)+'</div></div>'}).join(''),true);
      set('#planetRows',n.planets.map(function(p){return '<tr><td><strong>'+p.name+'</strong></td><td class="'+p.cls+'">'+p.verdict+'</td><td>'+(p.best?sky.fmtT(p.best.t)+' · '+Math.round(p.best.alt)+'° '+sky.dirName(p.best.az):'—')+'</td><td>'+sky.fmtT(p.rise)+'</td><td>'+sky.fmtT(p.set)+'</td><td>'+p.mag.toFixed(1)+'</td><td>'+p.con+'</td></tr>'}).join(''),true);
      var tips=[]; if(n.moon.illum<.3) tips.push('Moon is dim — a great night for faint galaxies and the Milky Way.'); else if(n.moon.illum>.8) tips.push('Bright Moon tonight — focus on the Moon itself, planets and double stars.');
      n.visible.forEach(function(p){ if(p.name==='Jupiter') tips.push('Jupiter: look for its four Galilean moons with any binoculars.'); if(p.name==='Saturn') tips.push('Saturn: even a small telescope at 50× shows the rings.'); if(p.name==='Venus') tips.push('Venus is the brilliant "evening/morning star" — watch its phase in a telescope.'); if(p.name==='Mars') tips.push('Mars shines orange-red; best views come at high altitude.'); });
      set('#tips',tips.map(function(t){return '<li>'+t+'</li>'}).join('')||'<li>Let your eyes adapt for 20 minutes and use a red light.</li>',true);
      drawChart();
    }
    function drawChart(){ var c=$('#skychart'); if(!c) return; var t=new Date(Date.now()+offset*6e4); sky.chart(c,sky.locOrDefault(),t,{labels:labels}); set('#chartTime',t.toLocaleString([], {weekday:'short',hour:'2-digit',minute:'2-digit'})) }
    var sl=$('#timeSlider'); if(sl) sl.addEventListener('input',function(){offset=+sl.value;drawChart()});
    var nb=$('#nowBtn'); if(nb) nb.addEventListener('click',function(){offset=0;if(sl)sl.value=0;drawChart()});
    var lb=$('#labelBtn'); if(lb) lb.addEventListener('click',function(){labels=!labels;drawChart()});
    var db=$('#darkBtn'); if(db) db.addEventListener('click',function(){ var n=sky.night(sky.locOrDefault(),new Date()); var t=n.dark||n.naut||n.sunset; if(t){offset=Math.round(((t.date||t)-Date.now())/6e4)+30; if(sl) sl.value=Math.max(-720,Math.min(1440,offset)); drawChart()} });
    render(); document.addEventListener('sa:loc',render); addEventListener('resize',drawChart);
    setInterval(function(){ if(offset===0) drawChart() },60000);
  }

  /* ================= CALENDAR ================= */
  if(page==='calendar'){
    var all=sky.events(new Date(new Date().setHours(0,0,0,0)),366), filter='all', stars=false;
    function rc(){
      var list=all.filter(function(e){return (filter==='all'||e.type===filter)&&(!stars||e.star)}), out='', lastM='';
      list.forEach(function(e,i){ var m=e.t.toLocaleDateString([], {month:'long',year:'numeric'});
        if(m!==lastM){out+='<h3 style="margin:26px 0 12px">'+m+'</h3>';lastM=m}
        out+='<div class="event"><div class="d"><span class="tiny muted">'+e.t.toLocaleDateString([], {weekday:'short'})+'</span><b>'+e.t.getDate()+'</b></div><div><strong>'+(e.star?'⭐ ':'')+esc(e.title)+'</strong> <span class="pill">'+e.type+'</span><div class="small muted">'+esc(e.desc)+'</div><div class="tiny dim">'+sky.fmtDT(e.t)+' ('+sky.tzLabel()+')</div></div><div class="act"><button class="btn btn-ghost btn-sm" data-ics="'+all.indexOf(e)+'">+ Calendar</button></div></div>'; });
      set('#events',out||'<p class="muted">No events match.</p>',true);
      set('#evCount',list.length+' events');
    }
    $$('#evTabs button').forEach(function(b){b.addEventListener('click',function(){ $$('#evTabs button').forEach(function(x){x.classList.remove('on')}); b.classList.add('on'); filter=b.getAttribute('data-f'); rc() })});
    var st=$('#starOnly'); if(st) st.addEventListener('change',function(){stars=st.checked;rc()});
    document.addEventListener('click',function(e){var b=e.target.closest('[data-ics]'); if(b) sky.ics(all[+b.getAttribute('data-ics')])});
    rc();
  }

  /* ================= LIVE ================= */
  if(page==='live'){
    apod($('#apodBox')); launches($('#launchBox'),8); kp($('#kpBox')); news($('#newsBox'),9);
    var cv=$('#issmap'), img=new Image(), track=[]; img.crossOrigin='anonymous'; img.src='https://tile.openstreetmap.org/0/0/0.png';
    function merc(lat,lon,W,H){ var x=(lon+180)/360*W, la=Math.max(-85,Math.min(85,lat))*Math.PI/180, y=(1-Math.log(Math.tan(la)+1/Math.cos(la))/Math.PI)/2*H; return [x,y] }
    function drawMap(iss){
      if(!cv) return; var W=cv.clientWidth, H=W; cv.style.aspectRatio='1/1'; var dpr=Math.min(devicePixelRatio||1,2); cv.width=W*dpr; cv.height=H*dpr;
      var c=cv.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); c.fillStyle='#0a1a3a'; c.fillRect(0,0,W,H);
      if(img.complete&&img.naturalWidth){ c.globalAlpha=.85; c.drawImage(img,0,0,W,H); c.globalAlpha=1 }
      // night shading
      try{ var A=window.Astronomy, now=new Date(), eq=A.Equator('Sun',now,new A.Observer(0,0,0),true,true), gast=A.SiderealTime(now), lonS=((eq.ra-gast)*15+540)%360-180, dec=eq.dec*Math.PI/180;
        c.fillStyle='rgba(0,0,20,.45)'; var step=Math.max(4,W/90);
        for(var px=0;px<W;px+=step){ for(var py=0;py<H;py+=step){ var lon=px/W*360-180, n=Math.PI*(1-2*py/H), lat=Math.atan(Math.sinh(n)), cz=Math.sin(lat)*Math.sin(dec)+Math.cos(lat)*Math.cos(dec)*Math.cos((lon-lonS)*Math.PI/180); if(cz<0) c.fillRect(px,py,step+.5,step+.5) } }
      }catch(e){}
      if(track.length>1){ c.strokeStyle='rgba(255,200,97,.8)'; c.lineWidth=2; c.beginPath(); track.forEach(function(p,i){ var q=merc(p[0],p[1],W,H); if(i&&Math.abs(p[1]-track[i-1][1])>180) c.moveTo(q[0],q[1]); else if(i) c.lineTo(q[0],q[1]); else c.moveTo(q[0],q[1]) }); c.stroke() }
      if(iss){ var q=merc(iss.latitude,iss.longitude,W,H); c.fillStyle='#ffc861'; c.beginPath(); c.arc(q[0],q[1],7,0,6.283); c.fill(); c.strokeStyle='#fff'; c.lineWidth=2; c.stroke(); c.fillStyle='#fff'; c.font='bold 12px Inter'; c.fillText('ISS',q[0]+10,q[1]-8) }
      c.fillStyle='rgba(255,255,255,.7)'; c.font='10px Inter'; c.fillText('Map © OpenStreetMap contributors',6,H-6);
    }
    var lastIss=null;
    function poll(){ SA.getJSON('https://api.wheretheiss.at/v1/satellites/25544',6000).then(function(s){ lastIss=s; track.push([s.latitude,s.longitude]); if(track.length>400) track.shift();
      set('#issLat',s.latitude.toFixed(2)+'°'); set('#issLon',s.longitude.toFixed(2)+'°'); set('#issAlt',Math.round(s.altitude)+' km'); set('#issVel',Math.round(s.velocity).toLocaleString()+' km/h'); set('#issVis',s.visibility==='daylight'?'In sunlight':'In Earth’s shadow'); drawMap(s) })
      .catch(function(){ set('#issVis','Live feed unavailable — retrying'); drawMap(lastIss) }) }
    img.onload=function(){drawMap(lastIss)}; img.onerror=function(){drawMap(lastIss)};
    poll(); setInterval(poll,5000); addEventListener('resize',function(){drawMap(lastIss)});
  }

  /* ================= VIDEOS ================= */
  if(page==='videos'){
    SA.cached('videos').then(function(d){
      var V=d.videos||[], chans=[]; V.forEach(function(v){ if(chans.indexOf(v.channel)<0) chans.push(v.channel) });
      var tabs=$('#vTabs'), grid=$('#vGrid'), cur='all';
      tabs.innerHTML='<button class="on" data-c="all">All</button>'+chans.map(function(c){return '<button data-c="'+esc(c)+'">'+esc(c)+'</button>'}).join('');
      function r(){ grid.innerHTML=V.filter(function(v){return cur==='all'||v.channel===cur}).slice(0,48).map(SA.videoHTML).join('') || '<p class="muted">Videos are refreshing.</p>' }
      tabs.addEventListener('click',function(e){var b=e.target.closest('button'); if(!b) return; $$('button',tabs).forEach(function(x){x.classList.remove('on')}); b.classList.add('on'); cur=b.getAttribute('data-c'); r()});
      set('#vUpdated',d.updated?'Library auto-refreshed '+new Date(d.updated).toLocaleString():'' );
      r();
    }).catch(function(){ set('#vGrid','<p class="muted">Video library refreshing — check back shortly.</p>',true) });
  }

  /* ================= TOOLS ================= */
  if(page==='tools'){
    // Telescope finder
    var tf=$('#tfForm');
    if(tf) tf.addEventListener('submit',function(e){ e.preventDefault(); var d=SA.formData(tf); var r=recommend(d);
      $('#tfResult').innerHTML='<div class="callout"><span class="eyebrow">Your match</span><h3>'+r.t+'</h3><p>'+r.w+'</p><p class="small muted"><strong>You’ll see:</strong> '+r.s+'</p><p class="small muted"><strong>Typical examples:</strong> '+r.e+'</p><a class="btn btn-gold" href="get-started.html#telescope-help" data-prefill="'+esc(r.t)+'">Get my free shortlist & deal alerts →</a></div>';
      SA.store.set('tf',{rec:r.t,answers:d}); $('#tfResult').scrollIntoView({behavior:'smooth',block:'center'}); });
    function recommend(a){
      var b=a.budget, g=a.goal, p=a.port, x=a.exp, s=a.sky;
      if(b==='lt150') return {t:'10×50 binoculars + a planisphere',w:'The smartest first purchase: wide view, zero setup, and they stay useful forever. Learn the sky first, then add a telescope.',s:'Moon craters, Jupiter’s moons, the Pleiades, Orion Nebula, Andromeda Galaxy (dark skies).',e:'Any quality 10×50 porro-prism binocular; a rotating star wheel for your latitude.'};
      if(g==='photo'&&(b==='400-900'||b==='900+')&&x!=='exp') return {t:'Smart telescope (all-in-one imaging)',w:'Automated pointing, tracking and stacking from a phone app — color images of nebulae even from the city.',s:'Color images of nebulae and galaxies in minutes; great for sharing.',e:'Seestar-, Dwarf- or Unistellar-class smart telescopes.'};
      if(g==='photo'&&b==='900+') return {t:'Small apochromatic refractor on a tracking equatorial mount',w:'The classic deep-sky imaging kit for growing into serious astrophotography.',s:'Wide-field nebulae and galaxies with a dedicated astro camera.',e:'60–80 mm APO refractor + computerized EQ mount + guiding.'};
      if(b==='900+'&&(g==='planets'||p==='port')) return {t:'Computerized Schmidt-Cassegrain (6–8 inch)',w:'Compact tube, long focal length and GoTo — superb on planets and portable for its power.',s:'Saturn’s rings and Cassini division, Jupiter’s belts and Great Red Spot, lunar detail.',e:'NexStar SE-class 6" or 8" SCT.'};
      if((b==='400-900'||b==='900+')&&p!=='port') return {t:'8-inch Dobsonian reflector',w:'The best aperture-per-dollar on Earth. Simple to use, gathers ~800× more light than your eye.',s:'Globular clusters resolved into stars, spiral galaxies, planetary nebulae, rich planetary detail.',e:'8" Dobsonians from Apertura, Sky-Watcher, Celestron (app-guided versions available).'};
      if(x==='beg'&&s==='city') return {t:'App-guided reflector (smartphone-assisted, 114–130 mm)',w:'Your phone tells you where to push the scope — beginners find targets on night one, even under city lights.',s:'Moon, planets, double stars, bright clusters and the Orion Nebula.',e:'StarSense Explorer-class 114–130 mm reflectors.'};
      return {t:'Tabletop Dobsonian (114–150 mm)',w:'Grab-and-go, sets up in seconds on a table or stool, and shows far more than a cheap tripod scope.',s:'Moon, Jupiter’s belts, Saturn’s rings, Pleiades, Orion Nebula, bright galaxies.',e:'Heritage/StarBlast/StarSense tabletop Dobsonians.'};
    }
    // calculator
    var cf=$('#calcForm');
    function calc(){ if(!cf) return; var D=+cf.ap.value, F=+cf.fl.value, f=+cf.ep.value, af=+cf.afov.value; if(!(D>0&&F>0&&f>0)) return;
      var M=F/f; set('#cMag',M.toFixed(0)+'×'); set('#cTfov',(af/M).toFixed(2)+'° ('+Math.round(af/M*60)+'′)'); set('#cExit',(D/M).toFixed(1)+' mm');
      set('#cMax',Math.round(2*D)+'×'); set('#cRatio','f/'+(F/D).toFixed(1)); set('#cLim','~'+(2.7+5*Math.log10(D)).toFixed(1)); set('#cRes',(116/D).toFixed(2)+'″');
      set('#cNote',(D/M>7?'Exit pupil is larger than a dark-adapted eye (~7 mm) — use a shorter-focal-length eyepiece.':M>2*D?'Magnification exceeds the useful maximum — expect a dim, blurry image.':D/M<0.7?'Very high power: only for steady nights on planets/double stars.':'Good combination for '+(D/M>3?'wide deep-sky views.':'Moon & planets.')));
    }
    if(cf){cf.addEventListener('input',calc);calc()}
    // birthday moon
    var bm=$('#bmForm');
    if(bm) bm.addEventListener('submit',function(e){e.preventDefault(); var dt=new Date(bm.date.value+'T21:00:00'); if(isNaN(dt)) return; var ph=Astronomy.MoonPhase(dt), il=Astronomy.Illumination('Moon',dt).phase_fraction;
      sky.drawMoon($('#bmCanvas'),ph); set('#bmOut','<h3>'+sky.phaseName(ph)+'</h3><p class="muted">'+Math.round(il*100)+'% illuminated on '+dt.toLocaleDateString([], {year:'numeric',month:'long',day:'numeric'})+'.</p><button class="btn btn-ghost btn-sm" data-share="My birthday Moon was a '+sky.phaseName(ph)+' 🌙 — find yours at Star.Academy">Share</button>',true)});
    // planet age/weight
    var pa=$('#paForm'), PER={Mercury:87.969,Venus:224.701,Earth:365.256,Mars:686.98,Jupiter:4332.59,Saturn:10759.22,Uranus:30688.5,Neptune:60182}, GR={Mercury:.378,Venus:.907,Earth:1,Moon:.166,Mars:.377,Jupiter:2.528,Saturn:1.065,Uranus:.886,Neptune:1.14,Pluto:.063};
    if(pa) pa.addEventListener('submit',function(e){e.preventDefault(); var b=new Date(pa.bd.value), w=+pa.wt.value; if(isNaN(b)) return; var days=(Date.now()-b)/864e5;
      set('#paOut','<div class="table-wrap"><table><thead><tr><th>World</th><th>Your age</th><th>Your weight</th></tr></thead><tbody>'+Object.keys(GR).map(function(k){return '<tr><td>'+k+'</td><td>'+(PER[k]?(days/PER[k]).toFixed(2)+' yrs':'—')+'</td><td>'+(w?(w*GR[k]).toFixed(1):'—')+'</td></tr>'}).join('')+'</tbody></table></div><p class="tiny dim" style="margin-top:8px">Weight uses surface (or cloud-top) gravity relative to Earth.</p>',true)});
    // bortle
    var bt=$('#btForm');
    if(bt) bt.addEventListener('submit',function(e){e.preventDefault(); var d=SA.formData(bt), s=(+d.q1||0)+(+d.q2||0)+(+d.q3||0)+(+d.q4||0); var cls=Math.max(1,Math.min(9,9-Math.round(s*8/12)));
      var desc=['','Pristine — zodiacal light, airglow, Milky Way casts shadows.','Truly dark — Milky Way highly structured.','Rural — some glow on the horizon, Milky Way still complex.','Rural/suburban transition — Milky Way visible but washed out near horizon.','Suburban — Milky Way faint overhead only.','Bright suburban — Milky Way barely visible.','Suburban/urban transition — sky gray-orange.','City — only bright stars and planets.','Inner city — Moon, planets and a handful of stars.'][cls];
      set('#btOut','<div class="callout"><span class="eyebrow">Estimated sky</span><h3>Bortle class '+cls+'</h3><p>'+desc+'</p><p class="small muted">'+(cls>=6?'Focus on the Moon, planets, double stars and bright clusters — or plan a trip to darker skies (we can help).':'You have workable dark skies — try galaxies and the Milky Way on moonless nights.')+'</p><a class="btn btn-gold btn-sm" href="get-started.html#trip">Find darker skies near me →</a></div>',true)});
    // converter
    var cv2=$('#cvForm'), U={km:1,au:149597870.7,ly:9.4607e12,pc:3.0857e13};
    function conv(){ if(!cv2) return; var v=+cv2.v.value, u=cv2.u.value; if(!(v>=0)) return; var km=v*U[u];
      set('#cvOut',Object.keys(U).map(function(k){return '<div class="kpi"><div class="l">'+({km:'Kilometers',au:'Astronomical units',ly:'Light-years',pc:'Parsecs'})[k]+'</div><div class="v" style="font-size:1rem">'+(km/U[k]).toPrecision(6)+'</div></div>'}).join('')+'<div class="kpi"><div class="l">Light travel time</div><div class="v" style="font-size:1rem">'+lt(km/299792.458)+'</div></div>',true) }
    function lt(s){ if(s<60) return s.toFixed(1)+' s'; if(s<3600) return (s/60).toFixed(1)+' min'; if(s<864e2) return (s/3600).toFixed(1)+' h'; if(s<31557600) return (s/864e2).toFixed(1)+' days'; return (s/31557600).toPrecision(4)+' yrs' }
    if(cv2){cv2.addEventListener('input',conv);conv()}
  }

  /* ================= ACADEMY ================= */
  if(page==='academy' && SA.COURSE){
    var C=SA.COURSE, prog=SA.store.get('course',{}), cur=0;
    function done(i){return !!prog[i]}
    function list(){ var n=C.filter(function(_,i){return done(i)}).length;
      set('#cProg',n+' / '+C.length+' lessons complete'); var bar=$('#cBar'); if(bar) bar.style.width=(n/C.length*100)+'%';
      set('#lessonList',C.map(function(l,i){return '<a href="#lesson-'+(i+1)+'" data-l="'+i+'" class="'+(done(i)?'done ':'')+(i===cur?'cur':'')+'"><span>'+(i+1)+'. '+esc(l.t)+'</span><span>'+(done(i)?'✓':'')+'</span></a>'}).join(''),true);
      var cert=$('#certBox'); if(cert) cert.style.display=n===C.length?'block':'none'; }
    function show(i){ cur=i; var l=C[i];
      set('#lesson','<span class="eyebrow">Lesson '+(i+1)+' of '+C.length+' · '+l.min+' min</span><h2>'+esc(l.t)+'</h2>'+l.body+
        '<div class="callout"><h3>🎯 Tonight’s task</h3><p class="mb0">'+l.task+'</p></div>'+
        '<div class="card quiz"><h3>Quick check</h3><p>'+esc(l.q[0])+'</p>'+l.q[1].map(function(o,k){return '<button class="btn btn-ghost" data-a="'+k+'">'+esc(o)+'</button>'}).join('')+'<div id="qres" class="small"></div></div>'+
        (l.link?'<p class="small" style="margin-top:14px">📖 Go deeper: <a href="'+l.link[1]+'">'+esc(l.link[0])+'</a></p>':'')+
        '<div style="display:flex;gap:10px;justify-content:space-between;margin-top:18px">'+(i>0?'<button class="btn btn-ghost" data-go="'+(i-1)+'">← Previous</button>':'<span></span>')+(i<C.length-1?'<button class="btn btn-gold" data-go="'+(i+1)+'">Next lesson →</button>':'')+'</div>',true);
      list(); if(location.hash!=='#lesson-'+(i+1)) history.replaceState(null,'','#lesson-'+(i+1));
    }
    document.addEventListener('click',function(e){
      var a=e.target.closest('[data-a]'); if(a){ var ok=+a.getAttribute('data-a')===C[cur].q[2]; var r=$('#qres');
        if(ok){prog[cur]=1;SA.store.set('course',prog);r.innerHTML='<p class="vis-yes">✓ Correct! Lesson complete.</p>';list()} else r.innerHTML='<p style="color:var(--red)">Not quite — '+esc(C[cur].q[3]||'try again!')+'</p>'; }
      var g=e.target.closest('[data-go]'); if(g){show(+g.getAttribute('data-go'));$('#lesson').scrollIntoView({behavior:'smooth'})}
      var l=e.target.closest('[data-l]'); if(l){e.preventDefault();show(+l.getAttribute('data-l'));$('#lesson').scrollIntoView({behavior:'smooth'})}
    });
    var m=/lesson-(\d+)/.exec(location.hash); show(m?Math.min(C.length-1,+m[1]-1):0);
    var cb=$('#certBtn'); if(cb) cb.addEventListener('click',function(){ var nm=($('#certName').value||'Stargazer').slice(0,40); var c=document.createElement('canvas'); c.width=1600;c.height=1130; var x=c.getContext('2d');
      var g=x.createLinearGradient(0,0,1600,1130);g.addColorStop(0,'#0b1230');g.addColorStop(1,'#2a1050');x.fillStyle=g;x.fillRect(0,0,1600,1130);
      for(var i=0;i<400;i++){x.fillStyle='rgba(255,255,255,'+Math.random()*.8+')';x.fillRect(Math.random()*1600,Math.random()*1130,Math.random()*2.2,Math.random()*2.2)}
      x.strokeStyle='#ffc861';x.lineWidth=6;x.strokeRect(40,40,1520,1050);x.lineWidth=2;x.strokeRect(60,60,1480,1010);
      x.textAlign='center';x.fillStyle='#ffc861';x.font='bold 40px sans-serif';x.fillText('★ STAR.ACADEMY ★',800,190);
      x.fillStyle='#fff';x.font='bold 84px serif';x.fillText('Certificate of Completion',800,330);
      x.fillStyle='#a3acd0';x.font='34px sans-serif';x.fillText('This certifies that',800,430);
      x.fillStyle='#fff';x.font='bold 96px serif';x.fillText(nm,800,560);
      x.fillStyle='#a3acd0';x.font='34px sans-serif';x.fillText('has completed all 12 lessons of',800,650);
      x.fillStyle='#6ee7ff';x.font='bold 56px sans-serif';x.fillText('Night Sky 101 — Foundations of Stargazing',800,740);
      x.fillStyle='#a3acd0';x.font='28px sans-serif';x.fillText('Awarded '+new Date().toLocaleDateString([], {year:'numeric',month:'long',day:'numeric'})+' · star.academy',800,900);
      var a=document.createElement('a');a.download='star-academy-certificate.png';a.href=c.toDataURL('image/png');a.click(); SA.toast('Certificate downloaded — share it! 🎓'); });
  }

  /* ================= GET STARTED (lead funnel) ================= */
  if(page==='get-started'){
    var f=$('#planForm'), steps=$$('.step',f), i=0;
    function go(n){ i=Math.max(0,Math.min(steps.length-1,n)); steps.forEach(function(s,k){s.classList.toggle('active',k===i)}); $('#pbar').style.width=((i+1)/steps.length*100)+'%'; set('#stepNo','Step '+(i+1)+' of '+steps.length) }
    f.addEventListener('click',function(e){ var n=e.target.closest('[data-next]'), p=e.target.closest('[data-prev]');
      if(n){ var req=$$('[required]',steps[i]).filter(function(el){ if(el.type==='radio') return !$$('input[name="'+el.name+'"]:checked',steps[i]).length; return !el.value }); if(req.length){SA.toast('Pick an option to continue');return} go(i+1) }
      if(p) go(i-1) });
    f.addEventListener('change',function(e){ if(e.target.type==='radio'&&e.target.closest('.step')&&i<steps.length-2) setTimeout(function(){go(i+1)},220) });
    f.addEventListener('submit',function(){ var snap=SA.formData(f); if(snap._honey) return; setTimeout(function(){ plan(snap) },0) });
    go(0);
    var city=$('#planCity'); if(city){ var l=sky.getLoc(); if(l&&!/default/.test(l.name)) city.value=l.name }
    function plan(d){
      var gear={free:'Start with your eyes, a red flashlight and our free Tonight’s Sky tool.', 'lt200':'Get 10×50 binoculars and a planisphere — the best value in astronomy.', '200-600':'A tabletop Dobsonian or app-guided 114–130 mm reflector is your sweet spot.', '600-1500':'An 8-inch Dobsonian (visual) or a smart telescope (imaging) will thrill you.', '1500+':'Consider a computerized 8" SCT or an imaging rig (APO refractor + tracking mount).'}[d.budget]||'';
      var n=sky.night(sky.locOrDefault(),new Date()), t=[]; n.visible.slice(0,2).forEach(function(p){t.push(p.name+' — '+p.verdict.toLowerCase())});
      t.push('The Moon — '+n.moon.name.toLowerCase()+' ('+Math.round(n.moon.illum*100)+'% lit)'); if(t.length<3) t.push('Orion Nebula / Pleiades (season permitting) with binoculars');
      var ev=sky.events(new Date(),120).filter(function(e){return e.star}).slice(0,3);
      var out=$('#planOut'); out.style.display='block';
      out.innerHTML='<div class="callout"><span class="eyebrow">✨ Your personal stargazing plan</span><h2 style="margin-top:6px">Welcome, '+esc(d.name||'Stargazer')+'!</h2>'+
        '<h3>1 · Your gear path</h3><p>'+gear+'</p><h3>2 · Look up tonight</h3><ul>'+t.slice(0,3).map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul>'+
        '<h3>3 · Mark your calendar</h3><ul>'+ev.map(function(e){return '<li><strong>'+sky.fmtD(e.t,{month:'short',day:'numeric',year:'numeric'})+'</strong> — '+esc(e.title)+'</li>'}).join('')+'</ul>'+
        '<h3>4 · Learn in 12 short lessons</h3><p>Start <a href="academy.html">Night Sky 101</a> (free, with a certificate).</p><p class="small muted">A specialist will email your detailed plan'+(d.interests?' plus offers for: '+esc(d.interests):'')+'. Check your inbox (and spam).</p>'+
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn btn-gold" href="tonight.html">Open Tonight’s Sky →</a><a class="btn btn-ghost" href="calendar.html">Full sky calendar</a></div></div>';
      f.style.display='none'; out.scrollIntoView({behavior:'smooth'});
    }
    // prefill from telescope finder
    var tf=SA.store.get('tf',null), th=$('#thRec'); if(tf&&th) th.value='Telescope Finder match: '+tf.rec;
  }
})();
