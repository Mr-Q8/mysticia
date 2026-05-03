// ═══ ALMA IA · EVOLUTION CONVERSION TUNING ═══
// Capa adaptativa de conversión. NO modifica archivos existentes.
// Requiere: evolution-engine.js, evolution-conversion-boost.js

window.addEventListener('load', function () {
  try {

    // ── helpers ──
    function _pm() { return typeof isPremium === 'function' && isPremium(); }
    function _rnd(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
    function _ss(k, v) { try { if (v !== undefined) sessionStorage.setItem(k, v); return sessionStorage.getItem(k); } catch(e) { return null; } }
    function _ls(k, v) { try { if (v !== undefined) localStorage.setItem(k, v); return localStorage.getItem(k); } catch(e) { return null; } }
    function _teaser() { try { if (typeof evShowTeaser === 'function') evShowTeaser(); } catch(e) {} }

    // ── Frecuencia caps ──
    var _tc = 0, _oc = 0, _mc = 0; // teaser, overlay, msg counters

    // ═══════════════════════════════════════════════════════
    // 7 + 8) STATS & GLOBAL TRACKING (primero — necesario para ajustes)
    // ═══════════════════════════════════════════════════════
    var stats = { teaser_views: 0, teaser_clicks: 0 };
    try { var _s = JSON.parse(_ls('ev_stats') || '{}'); stats.teaser_views = _s.teaser_views || 0; stats.teaser_clicks = _s.teaser_clicks || 0; } catch(e) {}
    function _saveStats() { try { _ls('ev_stats', JSON.stringify(stats)); } catch(e) {} }

    var global = { visits: 1, last_visit: Date.now(), source: 'direct' };
    try {
      var _g = JSON.parse(_ls('ev_global') || '{}');
      global.visits = (_g.visits || 0) + 1;
      global.last_visit = _g.last_visit || 0;
      global.source = window.location.search.includes('from=push') ? 'push' : 'direct';
    } catch(e) {}
    _ls('ev_global', JSON.stringify({ visits: global.visits, last_visit: Date.now(), source: global.source }));

    var convRate = stats.teaser_views > 0 ? stats.teaser_clicks / stats.teaser_views : 0;
    var isHot = global.visits >= 2;
    var ctaDelay = convRate < 0.2 ? _rnd(1000, 2000) : _rnd(3000, 5000);

    // Interceptar evShowTeaser para tracking
    if (typeof evShowTeaser === 'function') {
      var _origTeaser = evShowTeaser;
      window.evShowTeaser = function () {
        stats.teaser_views++; _saveStats();
        _origTeaser();
      };
    }

    if (_pm()) return; // todo lo demás solo para no-premium

    // ═══════════════════════════════════════════════════════
    // 1) DELAY INTELIGENTE CTA
    // ═══════════════════════════════════════════════════════
    var ctaEl = document.getElementById('ecb-cta');
    if (ctaEl) {
      ctaEl.style.opacity = '0';
      ctaEl.style.transition = 'opacity .6s';
      var origClick = ctaEl.onclick;
      ctaEl.onclick = function () { stats.teaser_clicks++; _saveStats(); if (origClick) origClick(); };
      setTimeout(function () { try { ctaEl.style.opacity = '1'; } catch(e) {} }, ctaDelay);
    }

    // ═══════════════════════════════════════════════════════
    // 2) SEGUNDA OPORTUNIDAD TEASER
    // ═══════════════════════════════════════════════════════
    if (_ss('teaser_shown') && _tc < 2) {
      setTimeout(function () {
        if (_pm() || _tc >= 2) return;
        _tc++; _teaser();
      }, _rnd(20000, 40000));
    }
    // Marcar cuando se muestra teaser (observar DOM)
    var _tObs = setInterval(function () {
      try {
        if (document.getElementById('ev-teaser')) {
          _ss('teaser_shown', '1');
          clearInterval(_tObs);
        }
      } catch(e) { clearInterval(_tObs); }
    }, 1000);

    // ═══════════════════════════════════════════════════════
    // 3) INTENSIDAD PROGRESIVA (15s)
    // ═══════════════════════════════════════════════════════
    setTimeout(function () {
      if (_pm() || _mc >= 2) return;
      _mc++;
      var msg = convRate < 0.2
        ? 'Esto explica exactamente lo que te está pasando'
        : 'Esto es más importante de lo que parece';
      var el = document.createElement('div');
      el.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
        'z-index:9950;background:rgba(15,5,40,.94);border:1px solid rgba(147,51,234,.35);' +
        'border-radius:14px;padding:12px 22px;font-size:12px;color:#e9d5ff;' +
        'font-family:Montserrat,sans-serif;cursor:pointer;letter-spacing:.8px;' +
        'box-shadow:0 4px 20px rgba(0,0,0,.5);white-space:nowrap;max-width:90vw;text-align:center;' +
        'opacity:0;transition:opacity .5s;';
      el.textContent = '✦ ' + msg;
      el.onclick = function () { stats.teaser_clicks++; _saveStats(); _tc++; _teaser(); el.remove(); };
      document.body.appendChild(el);
      requestAnimationFrame(function () { el.style.opacity = '1'; });
      setTimeout(function () { try { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 600); } catch(e) {} }, 10000);
    }, 15000);

    // ═══════════════════════════════════════════════════════
    // 4) PUSH SILENCIOSO CON DELAY RANDOM
    // ═══════════════════════════════════════════════════════
    if (typeof evSendNotification === 'function' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      setTimeout(function () {
        try { evSendNotification('⚡ ALMA IA', 'Tu guía personal está esperando'); } catch(e) {}
      }, _rnd(10000, 25000));
    }

    // ═══════════════════════════════════════════════════════
    // 5) BLOQUEO POR SCROLL
    // ═══════════════════════════════════════════════════════
    var _scrollDone = false;
    window.addEventListener('scroll', function () {
      if (_scrollDone || _oc >= 2) return;
      var pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (pct < 60) return;
      _scrollDone = true; _oc++;
      var ov = document.createElement('div');
      ov.style.cssText = 'position:fixed;inset:0;z-index:9940;display:flex;align-items:center;' +
        'justify-content:center;background:rgba(5,2,20,.88);backdrop-filter:blur(6px);';
      ov.innerHTML = '<div style="text-align:center;padding:32px 24px;max-width:360px;">' +
        '<div style="font-size:36px;margin-bottom:16px">🔍</div>' +
        '<div style="font-family:Cinzel,serif;font-size:16px;color:#ffd700;margin-bottom:10px">' +
        'Hay algo clave que estás pasando por alto</div>' +
        '<div style="font-size:12px;color:#9ca3af;margin-bottom:24px;line-height:1.7">' +
        'Tu análisis profundo está bloqueado</div>' +
        '<button style="display:block;width:100%;padding:14px;border:none;border-radius:60px;' +
        'background:linear-gradient(135deg,#ffd700,#ffaa00);color:#1a0833;font-size:14px;' +
        'font-weight:700;font-family:Montserrat,sans-serif;letter-spacing:1.5px;cursor:pointer;' +
        'margin-bottom:10px" id="ect-ov-btn">🔓 Ver ahora</button>' +
        '<button style="background:none;border:none;color:#555;font-size:11px;cursor:pointer;' +
        'font-family:Montserrat,sans-serif" id="ect-ov-close">Continuar sin ver</button></div>';
      document.body.appendChild(ov);
      document.getElementById('ect-ov-btn').onclick = function () { stats.teaser_clicks++; _saveStats(); _teaser(); ov.remove(); };
      document.getElementById('ect-ov-close').onclick = function () { ov.remove(); };
    }, { passive: true });

    // ═══════════════════════════════════════════════════════
    // 8B) USUARIO CALIENTE
    // ═══════════════════════════════════════════════════════
    if (isHot) {
      setTimeout(function () {
        if (_mc >= 2) return; _mc++;
        var el = document.createElement('div');
        el.style.cssText = 'position:fixed;top:56px;left:50%;transform:translateX(-50%);' +
          'z-index:9945;background:rgba(147,51,234,.18);border:1px solid rgba(147,51,234,.35);' +
          'border-radius:50px;padding:8px 22px;font-size:11px;color:#e9d5ff;' +
          'font-family:Montserrat,sans-serif;cursor:pointer;white-space:nowrap;letter-spacing:.8px;' +
          'opacity:0;transition:opacity .5s;';
        el.textContent = '🔮 Volviste… esto no es casualidad';
        el.onclick = function () { _teaser(); el.remove(); };
        document.body.appendChild(el);
        requestAnimationFrame(function () { el.style.opacity = '1'; });
        setTimeout(function () { try { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 600); } catch(e) {} }, 9000);
      }, 1500);
    }

    // ═══════════════════════════════════════════════════════
    // 8D) SIMULACIÓN VIRAL
    // ═══════════════════════════════════════════════════════
    setTimeout(function () {
      if (_mc >= 2) return; _mc++;
      var names = ['12', '7', '23', '5', '18'];
      var n = names[Math.floor(Math.random() * names.length)];
      var el = document.createElement('div');
      el.style.cssText = 'position:fixed;bottom:24px;left:16px;z-index:9930;' +
        'background:rgba(15,5,40,.92);border:1px solid rgba(147,51,234,.25);' +
        'border-radius:12px;padding:10px 16px;font-size:11px;color:#9ca3af;' +
        'font-family:Montserrat,sans-serif;max-width:260px;line-height:1.5;' +
        'opacity:0;transition:opacity .5s;';
      el.innerHTML = '<span style="color:#4ade80">●</span> ' + n + ' usuarios desbloquearon su análisis hoy';
      document.body.appendChild(el);
      requestAnimationFrame(function () { el.style.opacity = '1'; });
      setTimeout(function () { try { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 600); } catch(e) {} }, 7000);
    }, _rnd(8000, 14000));

    // ═══════════════════════════════════════════════════════
    // 8E-F) PUSH DE ALTO IMPACTO
    // ═══════════════════════════════════════════════════════
    if (typeof evSendNotification === 'function' && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      var prevVisit = global.last_visit;
      var H24 = 24 * 3600 * 1000;
      // 8E: regreso tras 24h
      if (prevVisit && (Date.now() - prevVisit) > H24) {
        setTimeout(function () {
          try { evSendNotification('⚠️ Volviste al mismo punto', 'Podés cambiar esto hoy'); } catch(e) {}
        }, 3000);
      }
      // 8F: usuario caliente
      if (isHot) {
        setTimeout(function () {
          try { evSendNotification('🔓 Tu análisis completo está listo', 'Hay algo importante que no viste'); } catch(e) {}
        }, _rnd(12000, 20000));
      }
    }

  } catch(e) { /* silencioso */ }
});
