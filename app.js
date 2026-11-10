(function(){
  'use strict';
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('rok').textContent = new Date().getFullYear();

  /* ---------- menu ---------- */
  var burger = document.getElementById('burger'), nav = document.getElementById('nav');
  function zamknij(){ nav.classList.remove('otw'); burger.setAttribute('aria-expanded','false'); burger.setAttribute('aria-label','Otwórz menu'); }
  burger.addEventListener('click', function(){
    var o = nav.classList.toggle('otw');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
  });
  nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', zamknij); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') zamknij(); });
  document.addEventListener('click', function(e){ if (nav.classList.contains('otw') && !nav.contains(e.target) && !burger.contains(e.target)) zamknij(); });

  /* aktywna sekcja w menu: tylko gdy sekcja faktycznie jest na ekranie */
  var linki = {}; nav.querySelectorAll('a[href^="#"]:not(.btn)').forEach(function(a){ linki[a.getAttribute('href').slice(1)] = a; });
  var sekcje = Object.keys(linki).map(function(id){ return document.getElementById(id); }).filter(Boolean);
  function spy(){
    var y = window.innerHeight * 0.4, akt = null;
    sekcje.forEach(function(s){ var r = s.getBoundingClientRect(); if (r.top <= y && r.bottom > y) akt = s.id; });
    Object.keys(linki).forEach(function(id){ linki[id].classList.toggle('akt', id === akt); });
  }

  /* pasek na telefonie po przewinięciu za hero */
  var mob = document.getElementById('mob'), heroCta = document.querySelector('.hero-cta'), kontakt = document.getElementById('kontakt');
  function pasek(){
    var za = heroCta.getBoundingClientRect().bottom < 0;
    var k = kontakt.getBoundingClientRect();
    var wKontakcie = k.top < window.innerHeight && k.bottom > 0;
    mob.classList.toggle('widac', za && !wKontakcie);
  }
  var tick = false;
  window.addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(function(){ spy(); pasek(); tick = false; }); } }, {passive:true});
  spy(); pasek();

  /* ---------- globus: kula DGK, łuki tras do Polski ---------- */
  var svg = document.getElementById('glob'), NS = 'http://www.w3.org/2000/svg', R = 100, D = Math.PI / 180;
  var PL = {n:'Polska', lat:52.2, lon:19.0};
  var SKAD = [
    {n:'Chiny', lat:31.2, lon:121.5, dx:6, dy:-6},
    {n:'Indie', lat:19.1, lon:72.9, dx:6, dy:9},
    {n:'Turcja', lat:41.0, lon:29.0, dx:6, dy:9},
    {n:'Tajwan', lat:25.0, lon:121.5, dx:6, dy:9},
    {n:'Japonia', lat:35.7, lon:139.7, dx:6, dy:-4}
  ];
  function el(t, a){ var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); return e; }
  function vec(lat, lon){ lat *= D; lon *= D; return [Math.cos(lat)*Math.cos(lon), Math.cos(lat)*Math.sin(lon), Math.sin(lat)]; }
  function slerp(a, b, t){
    var d = Math.acos(Math.max(-1, Math.min(1, a[0]*b[0]+a[1]*b[1]+a[2]*b[2]))), s = Math.sin(d);
    if (s < 1e-6) return a;
    var p = Math.sin((1-t)*d)/s, q = Math.sin(t*d)/s;
    return [a[0]*p+b[0]*q, a[1]*p+b[1]*q, a[2]*p+b[2]*q];
  }
  var lam = 66, phi = 24;
  function proj(v, h){
    var cl = Math.cos(lam*D), sl = Math.sin(lam*D), cp = Math.cos(phi*D), sp = Math.sin(phi*D);
    var x1 = v[0]*cl + v[1]*sl, y1 = -v[0]*sl + v[1]*cl, z1 = v[2];
    var depth = x1*cp + z1*sp, up = -x1*sp + z1*cp, r = R*(h||1);
    return {x:y1*r, y:-up*r, z:depth, rr:Math.sqrt(y1*y1+up*up)*(h||1)};
  }
  function widoczny(p){ return p.z > 0 || p.rr > 1.0; }
  function linia(pts){
    var dp = '', dt = '', prevF = null;
    for (var i = 0; i < pts.length; i++){
      var p = pts[i], f = widoczny(p), c = p.x.toFixed(1)+' '+p.y.toFixed(1);
      if (f) dp += (prevF === true ? 'L' : 'M') + c; else dt += (prevF === false ? 'L' : 'M') + c;
      prevF = f;
    }
    return [dp, dt];
  }
  var siatkaPts = [];
  for (var lo = -180; lo < 180; lo += 20){ var m = []; for (var la = -90; la <= 90; la += 6) m.push(vec(la, lo)); siatkaPts.push(m); }
  for (var la2 = -60; la2 <= 75; la2 += 20){ var pr = []; for (var lo2 = -180; lo2 <= 180; lo2 += 6) pr.push(vec(la2, lo2)); siatkaPts.push(pr); }

  var defs = el('defs', {});
  var rg = el('radialGradient', {id:'gKula', cx:'38%', cy:'32%', r:'75%'});
  rg.appendChild(el('stop', {offset:'0', 'stop-color':'#FFFFFF'}));
  rg.appendChild(el('stop', {offset:'.7', 'stop-color':'#EEF8F3'}));
  rg.appendChild(el('stop', {offset:'1', 'stop-color':'#D7EFE3'}));
  defs.appendChild(rg);
  var LAND = [], L = window.LAND || [];
  for (var li = 0; li < L.length; li += 2) LAND.push(vec(L[li], L[li+1]));
  var cien = el('ellipse', {'class':'g-cien', cx:0, cy:R*1.12, rx:R*.78, ry:R*.08});
  var gTyl = el('path', {'class':'g-tyl'}), obrys = el('circle', {'class':'g-obrys', cx:0, cy:0, r:R, fill:'url(#gKula)'}), gPrz = el('path', {'class':'g-siatka'}), gLad = el('path', {'class':'g-lad'});
  svg.appendChild(defs); svg.appendChild(cien); svg.appendChild(gTyl); svg.appendChild(obrys); svg.appendChild(gPrz); svg.appendChild(gLad);
  var vPL = vec(PL.lat, PL.lon);
  var trasy = SKAD.map(function(s, i){
    var g = el('linearGradient', {id:'tr'+i, gradientUnits:'userSpaceOnUse'});
    g.appendChild(el('stop', {offset:'0', 'stop-color':'#0E9E9A'}));
    g.appendChild(el('stop', {offset:'1', 'stop-color':'#1CB26B'}));
    defs.appendChild(g);
    var path = el('path', {'class':'g-trasa', stroke:'url(#tr'+i+')'});
    var pkt = el('circle', {'class':'g-pkt', r:2.6});
    var ruch = el('circle', {'class':'g-ruch', r:2.2});
    var et = el('text', {'class':'g-et'}); et.textContent = s.n;
    svg.appendChild(path); svg.appendChild(pkt); svg.appendChild(ruch); svg.appendChild(et);
    var v = vec(s.lat, s.lon), pts = [];
    for (var k = 0; k <= 48; k++){ var t = k/48; pts.push({v:slerp(v, vPL, t), h:1 + 0.16*Math.sin(Math.PI*t)}); }
    return {s:s, g:g, path:path, pkt:pkt, ruch:ruch, et:et, v:v, pts:pts, off:i/SKAD.length};
  });
  var puls = el('circle', {'class':'g-puls', r:4}), plk = el('circle', {'class':'g-pl', r:4.2}), plt = el('text', {'class':'g-et g-et-pl'});
  plt.textContent = 'Polska';
  svg.appendChild(puls); svg.appendChild(plk); svg.appendChild(plt);

  function rysuj(t){
    var dp = '', dt = '';
    siatkaPts.forEach(function(l){ var r = linia(l.map(function(v){ return proj(v); })); dp += r[0]; dt += r[1]; });
    gPrz.setAttribute('d', dp); gTyl.setAttribute('d', dt);
    var dl = '';
    for (var j = 0; j < LAND.length; j++){ var q0 = proj(LAND[j]); if (q0.z > 0.04) dl += 'M' + q0.x.toFixed(1) + ' ' + q0.y.toFixed(1) + 'h0'; }
    gLad.setAttribute('d', dl);
    trasy.forEach(function(tr){
      var P = tr.pts.map(function(o){ return proj(o.v, o.h); });
      tr.path.setAttribute('d', linia(P)[0]);
      var a = P[0], b = P[P.length-1];
      tr.g.setAttribute('x1', a.x); tr.g.setAttribute('y1', a.y); tr.g.setAttribute('x2', b.x); tr.g.setAttribute('y2', b.y);
      var vis = a.z > 0;
      tr.pkt.setAttribute('cx', a.x); tr.pkt.setAttribute('cy', a.y); tr.pkt.style.display = vis ? '' : 'none';
      tr.et.setAttribute('x', a.x + tr.s.dx); tr.et.setAttribute('y', a.y + tr.s.dy); tr.et.style.display = vis ? '' : 'none';
      var f = (((t/5200) + tr.off) % 1 + 1) % 1, idx = Math.floor(f*(P.length-1)), q = P[idx];
      tr.ruch.setAttribute('cx', q.x); tr.ruch.setAttribute('cy', q.y);
      tr.ruch.style.display = widoczny(q) ? '' : 'none';
    });
    var p = proj(vPL);
    plk.setAttribute('cx', p.x); plk.setAttribute('cy', p.y);
    puls.setAttribute('cx', p.x); puls.setAttribute('cy', p.y);
    var ph = (t/1800) % 1; puls.setAttribute('r', 4 + ph*10); puls.style.opacity = (1-ph).toFixed(2);
    plt.setAttribute('x', p.x - 13); plt.setAttribute('y', p.y - 9);
  }
  var t0 = performance.now(), biegnie = false, raf = 0;
  function klatka(now){
    var t = Math.max(0, now - t0) + 1200;
    lam = 66 + 16*Math.sin(t/10000);
    rysuj(t);
    raf = requestAnimationFrame(klatka);
  }
  rysuj(1200);
  if (!rm && 'IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      en.forEach(function(e){
        if (e.isIntersecting && !biegnie){ biegnie = true; raf = requestAnimationFrame(klatka); }
        else if (!e.isIntersecting && biegnie){ biegnie = false; cancelAnimationFrame(raf); }
      });
    }).observe(svg);
  }

  /* ---------- tor etapów: palec, mysz, strzałki ---------- */
  var tor = document.getElementById('tor'), karty = tor.querySelectorAll('.etap'), licznik = document.getElementById('licznik');
  var strz = document.querySelectorAll('.str');
  function krok(){ return karty[1] ? karty[1].offsetLeft - karty[0].offsetLeft : tor.clientWidth; }
  function stan(){
    var i = Math.round(tor.scrollLeft / krok());
    i = Math.max(0, Math.min(karty.length - 1, i));
    if (tor.scrollLeft + tor.clientWidth >= tor.scrollWidth - 4) i = karty.length - 1;
    licznik.textContent = (i + 1) + ' / ' + karty.length;
    strz[0].disabled = tor.scrollLeft <= 2;
    strz[1].disabled = tor.scrollLeft + tor.clientWidth >= tor.scrollWidth - 4;
  }
  strz.forEach(function(b){ b.addEventListener('click', function(){ tor.scrollBy({left: krok()*(+b.dataset.dir), behavior: rm ? 'auto' : 'smooth'}); }); });
  tor.addEventListener('scroll', function(){ requestAnimationFrame(stan); }, {passive:true});
  tor.addEventListener('keydown', function(e){
    if (e.key === 'ArrowRight'){ e.preventDefault(); tor.scrollBy({left:krok(), behavior:'smooth'}); }
    if (e.key === 'ArrowLeft'){ e.preventDefault(); tor.scrollBy({left:-krok(), behavior:'smooth'}); }
  });
  var drag = null;
  tor.addEventListener('pointerdown', function(e){
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = {x:e.clientX, s:tor.scrollLeft, ruszyl:false};
  });
  window.addEventListener('pointermove', function(e){
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.ruszyl && Math.abs(dx) > 4){ drag.ruszyl = true; tor.classList.add('ciag'); }
    if (drag.ruszyl) tor.scrollLeft = drag.s - dx;
  });
  window.addEventListener('pointerup', function(){
    if (!drag) return;
    var by = drag.ruszyl; drag = null;
    if (by){
      var s = tor.scrollLeft; tor.classList.remove('ciag');
      tor.scrollLeft = s;
      var i = Math.round(s / krok());
      tor.scrollTo({left: i*krok(), behavior: rm ? 'auto' : 'smooth'});
    }
  });
  tor.addEventListener('dragstart', function(e){ e.preventDefault(); });
  window.addEventListener('resize', stan);
  stan();

  /* ---------- formularz pokazowy ---------- */
  var form = document.getElementById('form'), info = document.getElementById('formInfo');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!form.checkValidity()){ form.reportValidity(); return; }
    info.textContent = 'To podgląd strony. Formularz zacznie wysyłać wiadomości po wdrożeniu.';
  });
})();
