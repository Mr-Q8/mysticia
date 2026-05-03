// ═══ ALMA IA · EVOLUTION CONVERSION BOOST ═══
// Capa de conversión agresiva. NO modifica archivos existentes.
// Usa: evShowTeaser, evSendNotification, evDopamine, isPremium

window.addEventListener('load', function () {
  try {

    // ── helpers ──
    function _pm() { return typeof isPremium === 'function' && isPremium(); }
    var STRIPE = 'https://buy.stripe.com/3cI14oad2asU0ZucGi8AE00';

    // ═══════════════════════════════════════════════════════
    // 1) PUSH → TEASER: si URL contiene ?from=push
    // ═══════════════════════════════════════════════════════
    if (window.location.search.includes('from=push') && !_pm()) {
      setTimeout(function () {
        try { evShowTeaser(); } catch(e) {}
      }, 800);
    }

    // ═══════════════════════════════════════════════════════
    // 2) PARCHE evSendNotification: onclick abre /?from=push
    // ═══════════════════════════════════════════════════════
    if (typeof evSendNotification === 'function') {
      var _origSend = evSendNotification;
      window.evSendNotification = function (title, message) {
        try {
          if (Notification.permission !== 'granted') return false;
          var n = new Notification(title, { body: message, icon: '/icon.png', tag: 'ev-boost' });
          n.onclick = function () { window.focus(); window.location.href = '/?from=push'; };
          return true;
        } catch(e) { return _origSend(title, message); }
      };
    }

    // ═══════════════════════════════════════════════════════
    // 3) REENGANCHE 24H
    // ═══════════════════════════════════════════════════════
    try {
      var now = Date.now();
      var last = parseInt(localStorage.getItem('ev_last_activity') || '0');
      var H24 = 24 * 3600 * 1000;
      if (last && (now - last) > H24 && !_pm()) {
        evSendNotification('⚠️ Seguís en el mismo punto', 'Podés cambiar esto hoy');
      }
      localStorage.setItem('ev_last_activity', now);
    } catch(e) {}

    // ═══════════════════════════════════════════════════════
    // 4) CTA FLOTANTE "Ver análisis completo"
    // ═══════════════════════════════════════════════════════
    if (!_pm() && !document.getElementById('ecb-cta')) {
      var cta = document.createElement('div');
      cta.id = 'ecb-cta';
      cta.style.cssText = 'position:fixed;bottom:190px;right:16px;z-index:9975;cursor:pointer;' +
        'background:linear-gradient(135deg,#9333ea,#ffd700 180%);color:#fff;' +
        'font-size:12px;font-weight:700;font-family:Montserrat,sans-serif;' +
        'padding:10px 18px;border-radius:50px;letter-spacing:1px;' +
        'box-shadow:0 4px 20px rgba(147,51,234,.5);' +
        'animation:ev-pulse 3s ease-in-out infinite;';
      cta.textContent = '🔓 Ver análisis completo';
      cta.onclick = function () { try { evShowTeaser(); } catch(e) { window.location.href = STRIPE; } };
      document.body.appendChild(cta);
    }

    // ═══════════════════════════════════════════════════════
    // 5) MODO DINERO AGRESIVO (solo no-premium)
    // ═══════════════════════════════════════════════════════
    if (!_pm()) {

      // A) URGENCIA DINÁMICA — banner superior
      var URGENCY = [
        'Esto no se va a repetir igual',
        'Tu estado está cambiando ahora',
        'Si no actuás, lo repetís',
        'Estás ignorando algo importante'
      ];
      var uMsg = URGENCY[Math.floor(Math.random() * URGENCY.length)];
      var ub = document.createElement('div');
      ub.id = 'ecb-urgency';
      ub.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9960;' +
        'background:rgba(147,51,234,.15);backdrop-filter:blur(4px);' +
        'border-bottom:1px solid rgba(147,51,234,.25);' +
        'text-align:center;padding:7px 12px;font-size:11px;' +
        'color:#e9d5ff;font-family:Montserrat,sans-serif;letter-spacing:1px;' +
        'cursor:pointer;';
      ub.textContent = '⚡ ' + uMsg;
      ub.onclick = function () { try { evShowTeaser(); } catch(e) {} };
      document.body.appendChild(ub);
      setTimeout(function () { try { ub.remove(); } catch(e) {} }, 12000);

      // B) FOMO — usuario que vuelve
      try {
        var seen = sessionStorage.getItem('ecb_seen');
        if (seen) {
          var fomo = document.createElement('div');
          fomo.style.cssText = 'position:fixed;top:48px;left:50%;transform:translateX(-50%);' +
            'z-index:9955;background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.25);' +
            'border-radius:12px;padding:8px 20px;font-size:11px;color:#fca5a5;' +
            'font-family:Montserrat,sans-serif;letter-spacing:1px;white-space:nowrap;cursor:pointer;';
          fomo.textContent = '👁 Ya viste esto antes… pero no avanzaste';
          fomo.onclick = function () { try { evShowTeaser(); } catch(e) {} fomo.remove(); };
          document.body.appendChild(fomo);
          setTimeout(function () { try { fomo.remove(); } catch(e) {} }, 8000);
        }
        sessionStorage.setItem('ecb_seen', '1');
      } catch(e) {}

      // C) MINI COUNTDOWN VISUAL
      if (!document.getElementById('ecb-countdown')) {
        var mins = Math.floor(Math.random() * 12) + 8; // 8-19 min random
        var secs = Math.floor(Math.random() * 59);
        var cd = document.createElement('div');
        cd.id = 'ecb-countdown';
        cd.style.cssText = 'position:fixed;bottom:240px;right:16px;z-index:9965;' +
          'background:rgba(15,5,40,.92);border:1px solid rgba(255,215,0,.25);' +
          'border-radius:14px;padding:10px 16px;text-align:center;' +
          'font-family:Montserrat,sans-serif;cursor:pointer;min-width:160px;';
        cd.innerHTML = '<div style="font-size:9px;color:#9ca3af;letter-spacing:1px;margin-bottom:4px">ACCESO DISPONIBLE POR</div>' +
          '<div id="ecb-timer" style="font-size:18px;font-weight:700;color:#ffd700;letter-spacing:2px">' +
          String(mins).padStart(2,'0') + ':' + String(secs).padStart(2,'0') + '</div>' +
          '<div style="font-size:9px;color:#6b7280;margin-top:3px">tiempo limitado</div>';
        cd.onclick = function () { try { evShowTeaser(); } catch(e) {} };
        document.body.appendChild(cd);

        var totalSecs = mins * 60 + secs;
        var ticker = setInterval(function () {
          totalSecs--;
          if (totalSecs <= 0) { clearInterval(ticker); try { cd.remove(); } catch(e) {} return; }
          var m = Math.floor(totalSecs / 60), s = totalSecs % 60;
          var el = document.getElementById('ecb-timer');
          if (el) el.textContent = String(m).padStart(2,'0') + ':' + String(s).padStart(2,'0');
        }, 1000);
      }

      // D) MICRO DOPAMINA (delay 2s para no chocar con init)
      setTimeout(function () {
        try { if (typeof evDopamine === 'function') evDopamine(3); } catch(e) {}
      }, 2000);

      // E) PUSH DE CONVERSIÓN (si hay permiso)
      setTimeout(function () {
        try {
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            evSendNotification('🔓 Tu análisis completo está listo', 'Hay algo que no estás viendo');
          }
        } catch(e) {}
      }, 5000);

    } // fin !_pm()

  } catch(e) { /* silencioso */ }
});
