// ═══ ALMA IA · EVOLUTION PUSH ═══
(function () {
  'use strict';
  const PUSH_KEY_COUNT = 'ev_push_day_count';
  const PUSH_KEY_DATE  = 'ev_push_day_date';
  const PUSH_KEY_LAST  = 'ev_push_last_ts';
  const PUSH_KEY_ON    = 'ev_push_enabled';
  const MAX_PER_DAY    = 3;
  const MIN_INTERVAL   = 6 * 3600 * 1000;

  function evIsPremium() {
    return typeof isPremium === 'function' ? isPremium() : localStorage.getItem('premium') === 'true';
  }

  // Anti-spam
  function _canSend() {
    const today = new Date().toDateString();
    if (localStorage.getItem(PUSH_KEY_DATE) !== today) {
      localStorage.setItem(PUSH_KEY_DATE, today);
      localStorage.setItem(PUSH_KEY_COUNT, '0');
    }
    if (parseInt(localStorage.getItem(PUSH_KEY_COUNT) || '0') >= MAX_PER_DAY) return false;
    return Date.now() - parseInt(localStorage.getItem(PUSH_KEY_LAST) || '0') >= MIN_INTERVAL;
  }
  function _registerSend() {
    localStorage.setItem(PUSH_KEY_COUNT, parseInt(localStorage.getItem(PUSH_KEY_COUNT) || '0') + 1);
    localStorage.setItem(PUSH_KEY_LAST, Date.now());
  }

  // Mensajes IA
  const MSGS = {
    accion:      ['Hoy tenés que tomar una decisión importante.', 'Podés cambiar esto hoy.', 'Una acción hoy cambia tu semana.'],
    advertencia: ['Estás evitando algo clave.', 'Esto no se resuelve solo.', 'El costo de no actuar crece.'],
    patron:      ['Repetís el mismo ciclo. Es hora de verlo.', 'Hay un patrón que limita tu avance.'],
    teaser:      ['Detectamos algo importante en tu perfil…', 'Tu análisis completo está listo.', 'Hay algo que no estás viendo.']
  };
  function _getContent(type) {
    if (typeof evAI === 'function') return { title: 'ALMA IA', body: evAI(type) };
    const pool = MSGS[type] || MSGS.accion;
    return { title: 'ALMA IA', body: pool[Math.floor(Math.random() * pool.length)] };
  }

  // 6.2 Enviar notificación
  window.evSendNotification = function (title, message) {
    if (Notification.permission !== 'granted' || !_canSend()) return false;
    const n = new Notification(title, { body: message, icon: '/icon.png', tag: 'ev-daily' });
    n.onclick = function () {
      window.focus();
      if (!evIsPremium() && typeof evShowTeaser === 'function') evShowTeaser();
    };
    _registerSend();
    return true;
  };

  // 6.1 Pedir permiso
  window.evRequestPushPermission = function () {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') { _toast('Notificaciones ya activas ✓'); return; }
    _promptPermission(function () {
      Notification.requestPermission().then(function (p) {
        if (p === 'granted') {
          localStorage.setItem(PUSH_KEY_ON, 'true');
          _toast('🔔 Guía diaria activada');
          evSchedulePush();
        } else { _toast('Permiso denegado', 'warn'); }
      });
    });
  };

  function _promptPermission(cb) {
    if (document.getElementById('ev-perm')) return;
    const el = document.createElement('div');
    el.id = 'ev-perm';
    el.className = 'ev-perm-prompt';
    el.innerHTML = `<div class="ev-perm-icon">🔔</div>
      <div class="ev-perm-title">Activá tu guía diaria</div>
      <div class="ev-perm-sub">Mensajes personalizados en los momentos clave del día.</div>
      <button class="ev-btn-primary" id="ev-perm-ok">Activar notificaciones</button>
      <button class="ev-btn-ghost" onclick="this.closest('#ev-perm').remove()">No por ahora</button>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('ev-open'));
    document.getElementById('ev-perm-ok').onclick = function () { el.remove(); cb(); };
  }

  // 6.4 Programación diaria (verificar cada 30 min)
  window.evSchedulePush = function () {
    if (localStorage.getItem(PUSH_KEY_ON) !== 'true' || Notification.permission !== 'granted') return;
    setInterval(function () {
      if (!_canSend()) return;
      const h = new Date().getHours();
      if (!((h >= 8 && h < 10) || (h >= 14 && h < 16) || (h >= 20 && h < 22))) return;
      const types = evIsPremium() ? ['accion', 'advertencia', 'patron'] : ['accion', 'advertencia', 'patron', 'teaser', 'teaser'];
      const type = types[Math.floor(Math.random() * types.length)];
      const { title, body } = _getContent(type);
      evSendNotification(title, body);
    }, 30 * 60 * 1000);
  };

  // 6.7 Teaser premium desde push
  window.evSendPremiumTeaser = function () {
    if (evIsPremium()) return;
    const ok = evSendNotification('🔒 ALMA IA', 'Tu análisis completo está listo. Tocá para verlo.');
    if (!ok && typeof evShowTeaser === 'function') evShowTeaser();
  };

  // 11. Toggle UI
  function _injectToggle() {
    if (document.getElementById('ev-push-toggle')) return;
    const on = localStorage.getItem(PUSH_KEY_ON) === 'true';
    const el = document.createElement('div');
    el.id = 'ev-push-toggle';
    el.className = 'ev-push-toggle';
    el.innerHTML = `<span class="ev-toggle-label">🔔 Activar guía diaria</span>
      <label class="ev-switch"><input type="checkbox" id="ev-push-chk" ${on ? 'checked' : ''}><span class="ev-slider"></span></label>`;
    document.body.appendChild(el);
    document.getElementById('ev-push-chk').onchange = function () {
      if (this.checked) { evRequestPushPermission(); }
      else { localStorage.setItem(PUSH_KEY_ON, 'false'); _toast('Guía diaria desactivada'); }
    };
  }

  function _toast(msg, type) {
    const t = document.createElement('div');
    t.className = 'ev-toast' + (type === 'warn' ? ' ev-toast-warn' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('ev-show'));
    setTimeout(() => { t.classList.remove('ev-show'); setTimeout(() => t.remove(), 400); }, 3000);
  }

  function init() {
    _injectToggle();
    if (Notification.permission === 'granted' && localStorage.getItem(PUSH_KEY_ON) === 'true') evSchedulePush();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
