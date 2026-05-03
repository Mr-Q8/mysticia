// ═══ ALMA IA · EVOLUTION ENGINE ═══
// Módulo independiente. NO toca premium.js ni módulos existentes.
// Prefijo: ev / .ev-   |   Stripe: https://buy.stripe.com/3cI14oad2asU0ZucGi8AE00

(function () {
  'use strict';

  const EV_STRIPE = 'https://buy.stripe.com/3cI14oad2asU0ZucGi8AE00';
  const EV_KEY_LAST = 'ev_last_msg';
  const EV_KEY_VISIT = 'ev_visit_count';

  // ── Utilidad isPremium (compatible con módulo existente) ──
  function evIsPremium() {
    return typeof isPremium === 'function' ? isPremium() : localStorage.getItem('premium') === 'true';
  }

  // ── Ir a Stripe ──
  function evGoStripe() { window.location.href = EV_STRIPE; }

  // ────────────────────────────────────────────────────────────
  // 1. SISTEMA IA INTERACTIVO
  // ────────────────────────────────────────────────────────────
  const EV_MSGS = {
    perfil: [
      'Tu patrón refleja una mente que busca control donde no lo hay.',
      'Hay una tensión interna que estás ignorando. Es clave.',
      'Tu perfil muestra potencial bloqueado por hábitos repetitivos.'
    ],
    accion: [
      'Hoy es un día para decidir, no para postergar.',
      'Una sola acción hoy cambia la dirección de tu semana.',
      'Estás en un punto de inflexión. Actuar ahora tiene más peso.'
    ],
    patron: [
      'Repetís el mismo ciclo en distintas formas. Es hora de verlo.',
      'El patrón más limitante es el que no podés nombrar aún.',
      'Hay algo que hacés automáticamente que te cuesta claridad.'
    ],
    proposito: [
      'Tu propósito no está perdido, está cubierto por urgencias falsas.',
      'Lo que te da energía genuina es la pista más importante.',
      'Seguís buscando afuera lo que ya sabés adentro.'
    ],
    teaser: [
      'Hay algo importante en tu análisis que no estás viendo aún.',
      'Detectamos un patrón en tu perfil que explica mucho.',
      'Tu resultado completo revela algo que cambia la perspectiva.'
    ],
    advertencia: [
      'Si no actuás sobre esto, lo repetís en 3 meses.',
      'Ignorar este patrón tiene un costo concreto en tu energía.',
      'Esto no se resuelve solo. Requiere una decisión consciente.'
    ]
  };

  window.evAI = function (type, data) {
    const pool = EV_MSGS[type] || EV_MSGS.accion;
    const last = localStorage.getItem(EV_KEY_LAST + '_' + type);
    let idx = Math.floor(Math.random() * pool.length);
    // evitar repetición
    if (pool[idx] === last && pool.length > 1) idx = (idx + 1) % pool.length;
    const msg = pool[idx];
    localStorage.setItem(EV_KEY_LAST + '_' + type, msg);
    return msg;
  };

  // ────────────────────────────────────────────────────────────
  // 2. TEASER + CONVERSIÓN
  // ────────────────────────────────────────────────────────────
  window.evShowTeaser = function () {
    if (evIsPremium()) return;
    if (document.getElementById('ev-teaser')) return;

    const msg = evAI('teaser');
    const el = document.createElement('div');
    el.id = 'ev-teaser';
    el.className = 'ev-teaser';
    el.innerHTML = `
      <div class="ev-teaser-icon">🔒</div>
      <div class="ev-teaser-msg">${msg}</div>
      <div class="ev-teaser-sub">Hay algo importante que no estás viendo...</div>
      <button class="ev-btn-primary" onclick="evGoStripe()">🔓 Ver lo que realmente está pasando</button>
      <button class="ev-btn-ghost" onclick="this.closest('#ev-teaser').remove()">Ahora no</button>
    `;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('ev-open'));
  };

  // ────────────────────────────────────────────────────────────
  // 3. PAYWALL INTELIGENTE
  // ────────────────────────────────────────────────────────────
  window.evPaywall = function (targetEl) {
    if (evIsPremium()) return false; // libre
    if (!targetEl) return true;

    targetEl.style.position = 'relative';
    targetEl.style.overflow = 'hidden';

    // blur en contenido hijo
    const children = targetEl.children;
    Array.from(children).forEach(c => { c.style.filter = 'blur(6px)'; c.style.userSelect = 'none'; });

    const wall = document.createElement('div');
    wall.className = 'ev-paywall';
    wall.innerHTML = `
      <div class="ev-paywall-icon">🔐</div>
      <div class="ev-paywall-title">Esto explica tu situación actual</div>
      <div class="ev-paywall-sub">Propósito completo · Patrones profundos · Plan de acción</div>
      <button class="ev-btn-primary" onclick="evGoStripe()">Acceder ahora</button>
    `;
    targetEl.appendChild(wall);
    return true;
  };

  // ────────────────────────────────────────────────────────────
  // 4. ACTIVACIÓN POST PAGO (respeta premium-validate.js)
  // ────────────────────────────────────────────────────────────
  (function evCheckSuccess() {
    const url = window.location.href;
    if (!url.includes('success')) return;
    // Solo activar si premium-validate NO está manejándolo (pm_manual_confirmed)
    const manualConfirmed = localStorage.getItem('pm_manual_confirmed') === 'true';
    if (!manualConfirmed) return; // dejar que premium-validate lo gestione
    localStorage.setItem('premium', 'true');
  })();

  // ────────────────────────────────────────────────────────────
  // 5. BOTÓN GLOBAL DE PAGO
  // ────────────────────────────────────────────────────────────
  function evInjectGlobalBtn() {
    if (evIsPremium()) return;
    if (document.getElementById('ev-global-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'ev-global-btn';
    btn.className = 'ev-global-btn';
    btn.innerHTML = '✨ Desbloquear acceso completo';
    btn.onclick = evGoStripe;
    document.body.appendChild(btn);
  }

  // ────────────────────────────────────────────────────────────
  // 7. IA + RESULTADOS: mostrar teaser antes de resultado completo
  // ────────────────────────────────────────────────────────────
  window.evWrapResult = function (containerEl, showFullFn) {
    if (evIsPremium()) { showFullFn(); return; }

    const msg = evAI('teaser');
    containerEl.innerHTML = `
      <div class="ev-result-teaser">
        <div class="ev-result-partial">
          <div style="filter:blur(5px);user-select:none;font-size:13px;color:#c4b5d4;line-height:2">
            ████████ ████ ███ ████████ ████<br>██████ ████ ███████
          </div>
          <div class="ev-result-pct">30%</div>
        </div>
        <div class="ev-result-msg">${msg}</div>
        <button class="ev-btn-primary" onclick="evGoStripe()">🔓 Ver análisis completo</button>
      </div>
    `;
  };

  // ────────────────────────────────────────────────────────────
  // 8. URGENCIA DINÁMICA
  // ────────────────────────────────────────────────────────────
  const EV_URGENCY = [
    'Esto no se repite igual mañana.',
    'Tu estado está cambiando ahora mismo.',
    'Si no actuás hoy, lo repetís.'
  ];

  window.evUrgency = function () {
    return EV_URGENCY[Math.floor(Math.random() * EV_URGENCY.length)];
  };

  // ────────────────────────────────────────────────────────────
  // 9. REFUERZO DOPAMINA
  // ────────────────────────────────────────────────────────────
  window.evDopamine = function (pct) {
    if (!pct) pct = Math.floor(Math.random() * 15) + 5;
    const msg = evIsPremium()
      ? `Avanzaste +${pct}% · Estás cambiando tu patrón`
      : `Avanzaste +${pct}% · Podrías avanzar más rápido`;

    const toast = document.createElement('div');
    toast.className = 'ev-toast';
    toast.innerHTML = `⚡ ${msg}`;
    if (!evIsPremium()) {
      toast.innerHTML += ` <span class="ev-toast-link" onclick="evGoStripe()">→ Desbloquear</span>`;
    }
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('ev-show'));
    setTimeout(() => { toast.classList.remove('ev-show'); setTimeout(() => toast.remove(), 400); }, 3500);
  };

  // ────────────────────────────────────────────────────────────
  // 10. REENGANCHE (usuario que vuelve)
  // ────────────────────────────────────────────────────────────
  function evReengage() {
    if (evIsPremium()) return;
    const visits = parseInt(localStorage.getItem(EV_KEY_VISIT) || '0') + 1;
    localStorage.setItem(EV_KEY_VISIT, visits);
    if (visits < 2) return; // solo desde la 2da visita

    if (document.getElementById('ev-reengage')) return;
    const el = document.createElement('div');
    el.id = 'ev-reengage';
    el.className = 'ev-reengage';
    el.innerHTML = `
      <div class="ev-reengage-msg">Seguís en el mismo punto.</div>
      <div class="ev-reengage-sub">${evUrgency()}</div>
      <button class="ev-btn-primary" onclick="evGoStripe();this.closest('#ev-reengage').remove()">Podés cambiar esto hoy</button>
      <button class="ev-btn-ghost" onclick="this.closest('#ev-reengage').remove()">✕</button>
    `;
    document.body.appendChild(el);
    setTimeout(() => el.classList.add('ev-open'), 3000);
  }

  // ── INIT ──
  function evInit() {
    evInjectGlobalBtn();
    evReengage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', evInit);
  } else {
    evInit();
  }

  // Exponer goStripe globalmente
  window.evGoStripe = evGoStripe;

})();
