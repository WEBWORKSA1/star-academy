/* Star.Academy — sky engine (requires vendor/astronomy.browser.min.js, MIT) */
(function(){
  'use strict';
  var SA=window.SA=window.SA||{}, A=window.Astronomy; if(!A){console.warn('Astronomy engine missing');return}
  var sky=SA.sky={};
  var PLANETS=['Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune'];
  sky.CITIES=[
    ['New York',40.7128,-74.006,'America/New_York'],['Los Angeles',34.0522,-118.2437,'America/Los_Angeles'],['Chicago',41.8781,-87.6298,'America/Chicago'],['Houston',29.7604,-95.3698,'America/Chicago'],
    ['Toronto',43.6532,-79.3832,'America/Toronto'],['Montréal',45.5019,-73.5674,'America/Toronto'],['Vancouver',49.2827,-123.1207,'America/Vancouver'],['Anchorage',61.2181,-149.9003,'America/Anchorage'],
    ['Honolulu',21.3069,-157.8583,'Pacific/Honolulu'],['Mexico City',19.4326,-99.1332,'America/Mexico_City'],['São Paulo',-23.5505,-46.6333,'America/Sao_Paulo'],['Buenos Aires',-34.6037,-58.3816,'America/Argentina/Buenos_Aires'],
    ['London',51.5074,-0.1278,'Europe/London'],['Paris',48.8566,2.3522,'Europe/Paris'],['Berlin',52.52,13.405,'Europe/Berlin'],['Madrid',40.4168,-3.7038,'Europe/Madrid'],['Rome',41.9028,12.4964,'Europe/Rome'],
    ['Amsterdam',52.3676,4.9041,'Europe/Amsterdam'],['Stockholm',59.3293,18.0686,'Europe/Stockholm'],['Reykjavík',64.1466,-21.9426,'Atlantic/Reykjavik'],['Moscow',55.7558,37.6173,'Europe/Moscow'],
    ['Istanbul',41.0082,28.9784,'Europe/Istanbul'],['Cairo',30.0444,31.2357,'Africa/Cairo'],['Lagos',6.5244,3.3792,'Africa/Lagos'],['Nairobi',-1.2921,36.8219,'Africa/Nairobi'],['Johannesburg',-26.2041,28.0473,'Africa/Johannesburg'],
    ['Dubai',25.2048,55.2708,'Asia/Dubai'],['Riyadh',24.7136,46.6753,'Asia/Riyadh'],['Mumbai',19.076,72.8777,'Asia/Kolkata'],['Delhi',28.6139,77.209,'Asia/Kolkata'],['Bengaluru',12.9716,77.5946,'Asia/Kolkata'],
    ['Kolkata',22.5726,88.3639,'Asia/Kolkata'],['Colombo',6.9271,79.8612,'Asia/Colombo'],['Singapore',1.3521,103.8198,'Asia/Singapore'],['Bangkok',13.7563,100.5018,'Asia/Bangkok'],['Jakarta',-6.2088,106.8456,'Asia/Jakarta'],
    ['Manila',14.5995,120.9842,'Asia/Manila'],['Hong Kong',22.3193,114.1694,'Asia/Hong_Kong'],['Beijing',39.9042,116.4074,'Asia/Shanghai'],['Shanghai',31.2304,121.4737,'Asia/Shanghai'],['Seoul',37.5665,126.978,'Asia/Seoul'],
    ['Tokyo',35.6762,139.6503,'Asia/Tokyo'],['Sydney',-33.8688,151.2093,'Australia/Sydney'],['Melbourne',-37.8136,144.9631,'Australia/Melbourne'],['Auckland',-36.8485,174.7633,'Pacific/Auckland']
  ];
  /* ---------- location ---------- */
  sky.getLoc=function(){ return SA.store.get('loc',null) };
  sky.setLoc=function(l){ SA.store.set('loc',l); document.dispatchEvent(new CustomEvent('sa:loc',{detail:l})) };
  var ALIAS={'Asia/Calcutta':'Asia/Kolkata','America/Montreal':'America/Toronto','Asia/Saigon':'Asia/Bangkok','Asia/Ho_Chi_Minh':'Asia/Bangkok','Europe/Kiev':'Europe/Istanbul','America/Buenos_Aires':'America/Argentina/Buenos_Aires'};
  sky.deviceTZ=function(){ try{ var z=Intl.DateTimeFormat().resolvedOptions().timeZone; return ALIAS[z]||z }catch(e){return null} };
  sky.locOrDefault=function(){
    var l=sky.getLoc(); if(l) return l;
    var z=sky.deviceTZ(), c=null; for(var i=0;i<sky.CITIES.length;i++){ if(sky.CITIES[i][3]===z){c=sky.CITIES[i];break} }
    if(c) return {name:c[0]+' (auto)',lat:c[1],lon:c[2],tz:c[3],def:true};
    return {name:'New York (default)',lat:40.7128,lon:-74.006,tz:'America/New_York',def:true};
  };
  function curTZ(){ var l=sky.locOrDefault(); return l.tz||undefined }
  sky.tzLabel=function(){ var z=curTZ(); return z?z.split('/').pop().replace(/_/g,' ')+' time':'your local time' };
  sky.geolocate=function(){
    if(!navigator.geolocation){SA.toast('Geolocation not available — pick a city');return}
    SA.toast('Finding your sky…');
    navigator.geolocation.getCurrentPosition(function(p){
      sky.setLoc({name:'My location ('+p.coords.latitude.toFixed(2)+'°, '+p.coords.longitude.toFixed(2)+'°)',lat:+p.coords.latitude.toFixed(4),lon:+p.coords.longitude.toFixed(4),tz:sky.deviceTZ()||undefined});
    },function(){SA.toast('Location blocked — choose a city instead')},{timeout:10000,maximumAge:6e5});
  };
  sky.bindLocUI=function(root){
    root=root||document;
    var sel=root.querySelector('[data-city]');
    if(sel){
      sel.innerHTML='<option value="">Choose a city…</option>'+sky.CITIES.map(function(c,i){return '<option value="'+i+'">'+c[0]+'</option>'}).join('');
      sel.addEventListener('change',function(){ var c=sky.CITIES[+sel.value]; if(c) sky.setLoc({name:c[0],lat:c[1],lon:c[2],tz:c[3]}) });
    }
    root.querySelectorAll('[data-geo]').forEach(function(b){b.addEventListener('click',sky.geolocate)});
    var f=root.querySelector('[data-latlon]');
    if(f) f.addEventListener('submit',function(e){e.preventDefault();var la=parseFloat(f.lat.value),lo=parseFloat(f.lon.value);
      if(isNaN(la)||isNaN(lo)||Math.abs(la)>90||Math.abs(lo)>180){SA.toast('Enter valid latitude/longitude');return}
      sky.setLoc({name:'Custom ('+la.toFixed(2)+'°, '+lo.toFixed(2)+'°)',lat:la,lon:lo,tz:sky.deviceTZ()||undefined});});
  };
  /* ---------- helpers ---------- */
  function d(t){return t?(t.date||t):null}
  function opt(o){ var z=curTZ(); if(z) o.timeZone=z; return o }
  sky.fmtT=function(t){ t=d(t); try{ return t?t.toLocaleTimeString([], opt({hour:'2-digit',minute:'2-digit'})):'—' }catch(e){ return t.toLocaleTimeString() } };
  sky.fmtD=function(t,o){ t=d(t); try{ return t?t.toLocaleDateString([], opt(Object.assign({},o||{weekday:'short',month:'short',day:'numeric'}))):'—' }catch(e){ return t.toLocaleDateString() } };
  sky.fmtDT=function(t){ t=d(t); try{ return t?t.toLocaleString([], opt({month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})):'—' }catch(e){ return t.toLocaleString() } };
  function obs(l){return new A.Observer(l.lat,l.lon,0)}
  function hor(body,date,o){var eq=A.Equator(body,date,o,true,true);var h=A.Horizon(date,o,eq.ra,eq.dec,'normal');return {alt:h.altitude,az:h.azimuth,ra:eq.ra,dec:eq.dec}}
  sky.hor=hor;
  function search(fn){try{return fn()}catch(e){return null}}
  function dirName(az){return ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(az/22.5)%16]}
  sky.dirName=dirName;

  /* ---------- tonight ---------- */
  sky.night=function(loc,date){
    date=date||new Date(); var o=obs(loc);
    // anchor: today's local noon
    // anchor on the location's local solar noon (independent of device time zone)
    var off=loc.lon/15*36e5, ls=new Date(date.getTime()+off);
    var noon=new Date(Date.UTC(ls.getUTCFullYear(),ls.getUTCMonth(),ls.getUTCDate(),12)-off); if(ls.getUTCHours()<7) noon=new Date(noon.getTime()-864e5);
    var r={loc:loc,date:date};
    r.sunset=search(function(){return A.SearchRiseSet('Sun',o,-1,noon,1)});
    r.civil=search(function(){return A.SearchAltitude('Sun',o,-1,noon,1,-6)});
    r.naut=search(function(){return A.SearchAltitude('Sun',o,-1,noon,1,-12)});
    r.dark=search(function(){return A.SearchAltitude('Sun',o,-1,noon,1,-18)});
    var start=r.sunset?d(r.sunset):noon;
    r.darkEnd=search(function(){return A.SearchAltitude('Sun',o,+1,start,1,-18)});
    r.sunrise=search(function(){return A.SearchRiseSet('Sun',o,+1,start,1)});
    r.daylen=null;
    var sr0=search(function(){return A.SearchRiseSet('Sun',o,+1,new Date(noon.getTime()-12*36e5),1)});
    if(sr0&&r.sunset) r.daylen=(d(r.sunset)-d(sr0))/36e5;
    // moon
    var ph=A.MoonPhase(date), il=A.Illumination('Moon',date);
    var dist=A.GeoMoon(date).Length()*149597870.7;
    r.moon={phase:ph,illum:il.phase_fraction,name:sky.phaseName(ph),dist:dist,
      rise:search(function(){return A.SearchRiseSet('Moon',o,+1,noon,1)}),
      set:search(function(){return A.SearchRiseSet('Moon',o,-1,start,1)}),
      age:ph/360*29.530588};
    var q=search(function(){return A.SearchMoonQuarter(date)}); r.quarters=[];
    for(var i=0;q&&i<4;i++){r.quarters.push({q:q.quarter,time:d(q.time)});q=A.NextMoonQuarter(q)}
    // planets
    var end=r.sunrise?d(r.sunrise):new Date(start.getTime()+12*36e5);
    var samples=[]; for(var t=start.getTime(); t<=end.getTime(); t+=15*6e4){var td=new Date(t);samples.push({t:td,sun:hor('Sun',td,o).alt})}
    r.planets=PLANETS.map(function(p){
      var il=A.Illumination(p,date), best=null, first=null, last=null;
      samples.forEach(function(s){ if(s.sun>-8) return; var h=hor(p,s.t,o); if(h.alt>8){ if(!first)first=s.t; last=s.t; if(!best||h.alt>best.alt) best={alt:h.alt,az:h.az,t:s.t} } });
      var eq=A.Equator(p,date,o,true,true), con=A.Constellation(eq.ra,eq.dec);
      var verdict='Not visible', cls='vis-no';
      if(first){ var span=(last-first)/36e5, tot=(end-start)/36e5;
        if(span>tot*0.7){verdict='Most of the night';cls='vis-yes'}
        else if(first-start<2*36e5 && end-last>2*36e5){verdict='Evening';cls='vis-yes'}
        else if(end-last<2*36e5 && first-start>2*36e5){verdict='Morning';cls='vis-yes'}
        else {verdict='Part of the night';cls='vis-yes'}
        if(il.mag>5.8){cls='vis-mid';verdict+=' · telescope'}
      }
      return {name:p,mag:il.mag,con:con.name,verdict:verdict,cls:cls,best:best,first:first,last:last,
        rise:search(function(){return A.SearchRiseSet(p,o,+1,noon,1)}),set:search(function(){return A.SearchRiseSet(p,o,-1,noon,1)})};
    });
    r.visible=r.planets.filter(function(p){return p.first&&p.mag<5.8});
    return r;
  };
  sky.phaseName=function(p){
    if(p<6||p>354) return 'New Moon'; if(p<84) return 'Waxing Crescent'; if(p<96) return 'First Quarter';
    if(p<174) return 'Waxing Gibbous'; if(p<186) return 'Full Moon'; if(p<264) return 'Waning Gibbous'; if(p<276) return 'Last Quarter'; return 'Waning Crescent';
  };
  sky.QN=['New Moon','First Quarter','Full Moon','Last Quarter'];
  sky.FULLNAMES=['Wolf Moon','Snow Moon','Worm Moon','Pink Moon','Flower Moon','Strawberry Moon','Buck Moon','Sturgeon Moon','Harvest/Corn Moon','Hunter\u2019s Moon','Beaver Moon','Cold Moon'];

  /* ---------- moon drawing ---------- */
  sky.drawMoon=function(canvas,phase){
    var c=canvas.getContext('2d'),s=canvas.width,r=s/2-2,cx=s/2,cy=s/2; c.clearRect(0,0,s,s);
    c.fillStyle='#1a1e33';c.beginPath();c.arc(cx,cy,r,0,6.2832);c.fill();
    var p=phase*Math.PI/180, k=Math.cos(p), waxing=phase<180;
    var g=c.createRadialGradient(cx-r*.3,cy-r*.3,r*.1,cx,cy,r);g.addColorStop(0,'#fff8e1');g.addColorStop(1,'#d8cfae');
    // lit semicircle (right when waxing, left when waning — northern-hemisphere view)
    c.fillStyle=g;c.beginPath();
    if(waxing){c.arc(cx,cy,r,-Math.PI/2,Math.PI/2,false)}else{c.arc(cx,cy,r,Math.PI/2,-Math.PI/2+2*Math.PI,false)}
    c.closePath();c.fill();
    // terminator: dark ellipse for crescents, lit ellipse for gibbous phases
    c.fillStyle=k>0?'#1a1e33':g;c.beginPath();c.ellipse(cx,cy,Math.max(.01,Math.abs(k)*r),r,0,0,2*Math.PI);c.fill();
    c.strokeStyle='rgba(255,255,255,.15)';c.lineWidth=1.5;c.beginPath();c.arc(cx,cy,r,0,6.2832);c.stroke();
  };

  /* ---------- events (rolling) ---------- */
  sky.SHOWERS=[
    {n:'Quadrantids',m:1,d:3,z:110,a:'Dec 28 – Jan 12',tip:'Short, sharp peak; best before dawn from the Northern Hemisphere.'},
    {n:'Lyrids',m:4,d:22,z:18,a:'Apr 14 – Apr 30',tip:'Occasional bright fireballs; look after midnight.'},
    {n:'Eta Aquariids',m:5,d:6,z:50,a:'Apr 19 – May 28',tip:'Debris of Halley\u2019s Comet; great from the Southern Hemisphere before dawn.'},
    {n:'Southern Delta Aquariids',m:7,d:30,z:25,a:'Jul 12 – Aug 23',tip:'Faint meteors; dark southern skies help.'},
    {n:'Perseids',m:8,d:12,z:100,a:'Jul 17 – Aug 24',tip:'The summer favorite; fast, bright meteors after midnight.'},
    {n:'Draconids',m:10,d:8,z:10,a:'Oct 6 – Oct 10',tip:'Best in the evening, unlike most showers.'},
    {n:'Orionids',m:10,d:21,z:20,a:'Oct 2 – Nov 7',tip:'Also from Halley\u2019s Comet; look east after midnight.'},
    {n:'Southern Taurids',m:11,d:5,z:5,a:'Sep 20 – Nov 20',tip:'Slow, bright fireballs possible.'},
    {n:'Northern Taurids',m:11,d:12,z:5,a:'Oct 20 – Dec 10',tip:'Slow fireballs; pairs with the Southern Taurids.'},
    {n:'Leonids',m:11,d:17,z:15,a:'Nov 6 – Nov 30',tip:'Swift meteors; best before dawn.'},
    {n:'Geminids',m:12,d:14,z:150,a:'Dec 4 – Dec 20',tip:'The year\u2019s richest shower; active all night.'},
    {n:'Ursids',m:12,d:22,z:10,a:'Dec 17 – Dec 26',tip:'Modest rates near the Little Dipper.'}
  ];
  sky.events=function(start,days){
    start=start||new Date(); days=days||365; var end=new Date(start.getTime()+days*864e5), ev=[];
    function add(t,type,title,desc,extra){t=d(t); if(t&&t>=start&&t<=end) ev.push(Object.assign({t:t,type:type,title:title,desc:desc},extra||{}))}
    // moon quarters + supermoons
    var q=search(function(){return A.SearchMoonQuarter(start)});
    while(q&&d(q.time)<=end){
      var t=d(q.time), name=sky.QN[q.quarter];
      if(q.quarter===2){ var dist=A.GeoMoon(t).Length()*149597870.7, fn=sky.FULLNAMES[t.getMonth()];
        var sup=dist<362000; add(t,'moon',(sup?'Supermoon — ':'Full Moon — ')+fn,'The Moon is fully lit'+(sup?' and near perigee ('+Math.round(dist).toLocaleString()+' km), so it looks slightly bigger and brighter.':'. Bright moonlight washes out faint stars and meteors.'),{star:sup}); }
      else if(q.quarter===0){ add(t,'moon','New Moon','Darkest skies of the month — the best nights for galaxies, nebulae and the Milky Way.') }
      else add(t,'moon',name,'Half-lit Moon. Great time to view craters along the terminator with binoculars.');
      q=A.NextMoonQuarter(q);
    }
    // eclipses
    var le=search(function(){return A.SearchLunarEclipse(start)});
    for(var i=0;le&&i<6&&d(le.peak)<=end;i++){ add(le.peak,'eclipse',cap(le.kind)+' lunar eclipse','Visible from the night side of Earth at the time of peak. Totally safe to watch with the naked eye.',{star:le.kind!=='penumbral'}); le=A.NextLunarEclipse(le.peak) }
    var se=search(function(){return A.SearchGlobalSolarEclipse(start)});
    for(i=0;se&&i<6&&d(se.peak)<=end;i++){ var where=(se.latitude!=null&&!isNaN(se.latitude))?' Peak near '+se.latitude.toFixed(1)+'°, '+se.longitude.toFixed(1)+'°.':'';
      add(se.peak,'eclipse',cap(se.kind)+' solar eclipse','Never look at the Sun without certified eclipse glasses.'+where,{star:true}); se=A.NextGlobalSolarEclipse(se.peak) }
    // seasons
    [start.getFullYear(),start.getFullYear()+1].forEach(function(y){ var s=A.Seasons(y);
      add(s.mar_equinox,'season','March equinox','Equal day and night; spring begins in the Northern Hemisphere.');
      add(s.jun_solstice,'season','June solstice','Longest day in the north, shortest in the south.');
      add(s.sep_equinox,'season','September equinox','Equal day and night; autumn begins in the Northern Hemisphere.');
      add(s.dec_solstice,'season','December solstice','Longest night in the north — perfect for stargazing.'); });
    // oppositions
    ['Mars','Jupiter','Saturn','Uranus','Neptune'].forEach(function(p){
      var t=search(function(){return A.SearchRelativeLongitude(p,0,start)});
      if(t) add(t,'planet',p+' at opposition',p+' is opposite the Sun: up all night and at its brightest/biggest for the year.',{star:p==='Mars'||p==='Jupiter'||p==='Saturn'});
    });
    // elongations
    ['Mercury','Venus'].forEach(function(p){
      var s=start;
      for(var k=0;k<4;k++){ var e=search(function(){return A.SearchMaxElongation(p,s)}); if(!e) break; var t=d(e.time); if(t>end) break;
        add(t,'planet',p+' at greatest '+(e.visibility==='morning'?'western':'eastern')+' elongation',p+' is '+e.elongation.toFixed(1)+'° from the Sun — best seen in the '+e.visibility+' sky.');
        s=new Date(t.getTime()+20*864e5); }
    });
    // meteor showers
    [start.getFullYear(),start.getFullYear()+1].forEach(function(y){ sky.SHOWERS.forEach(function(s){
      var t=new Date(y,s.m-1,s.d,23,0,0); var il=A.Illumination('Moon',t).phase_fraction;
      var moon=il<.25?'Great: little moonlight':(il<.6?'Fair: some moonlight':'Poor: bright Moon');
      add(t,'meteor',s.n+' meteor shower peak','Up to ~'+s.z+' meteors/hour under ideal dark skies. Active '+s.a+'. '+s.tip+' Moon '+Math.round(il*100)+'% lit — '+moon+'.',{star:s.z>=50&&il<.6,zhr:s.z});
    })});
    ev.sort(function(a,b){return a.t-b.t}); return ev;
  };
  function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s}
  sky.nextBig=function(){ var ev=sky.events(new Date(),400).filter(function(e){return e.star}); return ev[0]||null };

  /* ---------- ICS ---------- */
  sky.ics=function(e){
    function f(t){return t.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'')}
    var e2=new Date(e.t.getTime()+3600e3);
    var s=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Star.Academy//Sky Calendar//EN','BEGIN:VEVENT','UID:'+(+e.t)+'@star.academy','DTSTAMP:'+f(new Date()),'DTSTART:'+f(e.t),'DTEND:'+f(e2),
      'SUMMARY:'+e.title.replace(/,/g,'\\,'),'DESCRIPTION:'+(e.desc+' — via Star.Academy').replace(/,/g,'\\,'),'END:VEVENT','END:VCALENDAR'].join('\r\n');
    var a=document.createElement('a');a.href=URL.createObjectURL(new Blob([s],{type:'text/calendar'}));a.download=e.title.replace(/[^\w]+/g,'-').toLowerCase()+'.ics';document.body.appendChild(a);a.click();a.remove();
  };

  /* ---------- bright stars (J2000 RA h, Dec °, mag) ---------- */
  sky.STARS=[["Sirius",6.7525,-16.716,-1.46],["Canopus",6.3992,-52.696,-0.74],["Arcturus",14.261,19.182,-0.05],["Rigil Kent.",14.66,-60.834,-0.27],["Vega",18.6156,38.784,0.03],["Capella",5.2782,45.998,0.08],["Rigel",5.2423,-8.202,0.13],["Procyon",7.655,5.225,0.34],["Achernar",1.6286,-57.237,0.46],["Betelgeuse",5.9195,7.407,0.5],["Hadar",14.0637,-60.373,0.61],["Altair",19.8464,8.868,0.76],["Acrux",12.4433,-63.099,0.76],["Aldebaran",4.5987,16.509,0.86],["Antares",16.4901,-26.432,0.96],["Spica",13.4199,-11.161,0.97],["Pollux",7.7553,28.026,1.14],["Fomalhaut",22.9608,-29.622,1.16],["Deneb",20.6905,45.28,1.25],["Mimosa",12.7954,-59.689,1.25],["Regulus",10.1395,11.967,1.35],["Adhara",6.9771,-28.972,1.5],["Castor",7.5767,31.888,1.58],["Shaula",17.5601,-37.104,1.62],["Gacrux",12.5194,-57.113,1.64],["Bellatrix",5.4189,6.35,1.64],["Elnath",5.4382,28.608,1.65],["Alnilam",5.6036,-1.202,1.69],["Alnitak",5.6793,-1.943,1.77],["Mintaka",5.5334,-0.299,2.23],["Saiph",5.7959,-9.67,2.09],["Alioth",12.9005,55.96,1.77],["Dubhe",11.0621,61.751,1.79],["Merak",11.0307,56.382,2.37],["Phecda",11.8972,53.695,2.44],["Megrez",12.2571,57.033,3.31],["Mizar",13.3988,54.925,2.23],["Alkaid",13.7923,49.313,1.86],["Polaris",2.5303,89.264,1.98],["Schedar",0.6751,56.537,2.24],["Caph",0.153,59.15,2.28],["Navi",0.9451,60.717,2.47],["Ruchbah",1.4302,60.235,2.68],["Segin",1.9066,63.67,3.37],["Sadr",20.3705,40.257,2.23],["Gienah",20.7702,33.97,2.48],["Fawaris",19.7496,45.131,2.87],["Albireo",19.512,27.96,3.05],["Denebola",11.8177,14.572,2.14],["Algieba",10.3329,19.842,2.08],["Zosma",11.2351,20.524,2.56],["Alpheratz",0.1398,29.091,2.06],["Mirach",1.1622,35.621,2.05],["Almach",2.065,42.33,2.1],["Hamal",2.1196,23.463,2.0],["Algol",3.1361,40.956,2.1],["Mirfak",3.4054,49.861,1.79],["Pleiades",3.7914,24.105,2.87],["Markab",23.0794,15.205,2.48],["Scheat",23.0629,28.083,2.42],["Algenib",0.2206,15.184,2.83],["Kochab",14.8451,74.155,2.08],["Eltanin",17.9434,51.489,2.23],["Rasalhague",17.5822,12.56,2.08],["Nunki",18.9211,-26.297,2.05],["Kaus Austr.",18.4029,-34.385,1.85],["Dschubba",16.0056,-22.622,2.29],["Acrab",16.0906,-19.806,2.62],["Sargas",17.622,-42.998,1.86],["Lesath",17.5127,-37.296,2.7],["Tau Sco",16.598,-28.216,2.82],["Sigma Sco",16.3531,-25.593,2.89],["Atria",16.8111,-69.028,1.91],["Peacock",20.4275,-56.735,1.94],["Alnair",22.1372,-46.961,1.74],["Diphda",0.7265,-17.987,2.04],["Menkar",3.038,4.09,2.54],["Alphard",9.4598,-8.659,1.98],["Suhail",9.1333,-43.433,2.21],["Avior",8.3752,-59.51,1.86],["Miaplacidus",9.22,-69.717,1.67],["Alhena",6.6285,16.399,1.93],["Wezen",7.1399,-26.393,1.83],["Mirzam",6.3783,-17.956,1.98],["Menkalinan",5.9921,44.948,1.9],["Cor Caroli",12.9338,38.318,2.9],["Vindemiatrix",13.0363,10.959,2.83],["Zubenelgenubi",14.848,-16.042,2.75]];
  sky.LINES=[["Betelgeuse","Bellatrix"],["Betelgeuse","Alnitak"],["Bellatrix","Mintaka"],["Mintaka","Alnilam"],["Alnilam","Alnitak"],["Alnitak","Saiph"],["Mintaka","Rigel"],
    ["Dubhe","Merak"],["Merak","Phecda"],["Phecda","Megrez"],["Megrez","Dubhe"],["Megrez","Alioth"],["Alioth","Mizar"],["Mizar","Alkaid"],
    ["Segin","Ruchbah"],["Ruchbah","Navi"],["Navi","Schedar"],["Schedar","Caph"],
    ["Deneb","Sadr"],["Sadr","Albireo"],["Fawaris","Sadr"],["Sadr","Gienah"],
    ["Regulus","Algieba"],["Algieba","Zosma"],["Zosma","Denebola"],["Denebola","Regulus"],
    ["Acrab","Dschubba"],["Dschubba","Sigma Sco"],["Sigma Sco","Antares"],["Antares","Tau Sco"],["Tau Sco","Sargas"],["Sargas","Shaula"],["Shaula","Lesath"],
    ["Acrux","Gacrux"],["Markab","Scheat"],["Scheat","Alpheratz"],["Alpheratz","Algenib"],["Algenib","Markab"],["Alpheratz","Mirach"],["Mirach","Almach"],
    ["Castor","Pollux"],["Kaus Austr.","Nunki"],["Mirfak","Algol"]];

  /* ---------- sky chart ---------- */
  sky.chart=function(canvas,loc,date,opt){
    opt=opt||{}; var dpr=Math.min(window.devicePixelRatio||1,2), W=canvas.clientWidth||600; canvas.width=W*dpr; canvas.height=W*dpr;
    var c=canvas.getContext('2d'); c.setTransform(dpr,0,0,dpr,0,0); var R=W/2-14, cx=W/2, cy=W/2, o=obs(loc);
    c.clearRect(0,0,W,W);
    var sun=hor('Sun',date,o).alt;
    var bg=c.createRadialGradient(cx,cy,10,cx,cy,R); var night=sun<-12;
    bg.addColorStop(0,night?'#0c1440':(sun<0?'#1d2a6b':'#3567b5')); bg.addColorStop(1,night?'#040719':(sun<0?'#0d1640':'#1b3d7a'));
    c.fillStyle=bg;c.beginPath();c.arc(cx,cy,R,0,6.2832);c.fill();
    function P(alt,az){ var r=R*Math.tan((90-alt)*Math.PI/360); var a=az*Math.PI/180; return [cx-r*Math.sin(a), cy-r*Math.cos(a)] }
    // grid
    c.strokeStyle='rgba(255,255,255,.08)';c.lineWidth=1;[30,60].forEach(function(al){c.beginPath();c.arc(cx,cy,R*Math.tan((90-al)*Math.PI/360),0,6.2832);c.stroke()});
    var pos={}; var t0=date;
    sky.STARS.forEach(function(s){ var h=A.Horizon(t0,o,s[1],s[2],'normal'); pos[s[0]]=h; });
    c.strokeStyle='rgba(155,180,255,.35)';c.lineWidth=1.1;
    sky.LINES.forEach(function(l){var a=pos[l[0]],b=pos[l[1]]; if(!a||!b||a.altitude<-2||b.altitude<-2) return; var p1=P(a.altitude,a.azimuth),p2=P(b.altitude,b.azimuth);c.beginPath();c.moveTo(p1[0],p1[1]);c.lineTo(p2[0],p2[1]);c.stroke()});
    c.font='11px Inter,sans-serif';
    sky.STARS.forEach(function(s){ var h=pos[s[0]]; if(h.altitude<0) return; var p=P(h.altitude,h.azimuth), r=Math.max(.8,3.6-s[3]*0.9);
      c.fillStyle='#fff';c.beginPath();c.arc(p[0],p[1],r,0,6.2832);c.fill();
      if(opt.labels!==false && s[3]<1.7){c.fillStyle='rgba(220,230,255,.75)';c.fillText(s[0],p[0]+5,p[1]-4)} });
    var colors={Mercury:'#c9c3b5',Venus:'#fff3c4',Mars:'#ff8a5c',Jupiter:'#ffd9a0',Saturn:'#f3d27a',Uranus:'#9ef0ff',Neptune:'#7aa8ff'};
    PLANETS.forEach(function(p){ var h=hor(p,date,o); if(h.alt<0) return; var q=P(h.alt,h.az); c.fillStyle=colors[p]; c.beginPath();c.arc(q[0],q[1],4.5,0,6.2832);c.fill();
      c.fillStyle=colors[p];c.font='bold 12px Inter,sans-serif';c.fillText(p,q[0]+7,q[1]+4) });
    var m=hor('Moon',date,o); if(m.alt>0){var q=P(m.alt,m.az);c.fillStyle='#fff3d6';c.beginPath();c.arc(q[0],q[1],8,0,6.2832);c.fill();c.fillStyle='#fff3d6';c.font='bold 12px Inter,sans-serif';c.fillText('Moon',q[0]+11,q[1]+4)}
    if(sun>-1){var s2=P(Math.max(sun,0),hor('Sun',date,o).az);c.fillStyle='#ffd34d';c.beginPath();c.arc(s2[0],s2[1],10,0,6.2832);c.fill()}
    // horizon + cardinal
    c.strokeStyle='rgba(255,200,97,.6)';c.lineWidth=2;c.beginPath();c.arc(cx,cy,R,0,6.2832);c.stroke();
    c.fillStyle='#ffc861';c.font='bold 14px Space Grotesk,sans-serif';c.textAlign='center';c.textBaseline='middle';
    [['N',0],['E',90],['S',180],['W',270]].forEach(function(k){var p=P(-6,k[1]);c.fillText(k[0],p[0],p[1])});
    c.textAlign='start';c.textBaseline='alphabetic';
    return {sunAlt:sun};
  };
})();
