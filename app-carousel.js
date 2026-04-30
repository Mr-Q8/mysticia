// ═══ ALMA IA · CARRUSEL ASTRAL + DESCARGA ═══
// Se agrega DESPUÉS de app-core.js y app-features.js sin modificar nada existente

// ── CONFIG DE CARTAS DEL CARRUSEL ──
function buildCarouselData(user){
  const moon = getMoon(user.birthDate);
  const rising = getRising(user.birthDate, user.birthTime);
  const lp = getLifePath(user.birthDate);
  const tikun = KABBALAH[lp] || 'Keter';
  const elem = getElement(user.sign);
  const nn = calcNombreNum(user.name || user.email);
  const moonPhase = getMoonPhase();

  return [
    {
      icon:'☀️', label:'Sol Solar', value: user.sign,
      sub:'Tu identidad esencial', num: null,
      color:'#ffd700', ringPct:0.85,
      badge: elem
    },
    {
      icon:'🌙', label:'Luna', value: moon,
      sub:'Emociones · Intuición', num: null,
      color:'#aa88ff', ringPct:0.70,
      badge: moonPhase
    },
    {
      icon:'⬆️', label:'Ascendente', value: rising||'—',
      sub: rising ? 'Máscara social · Exterior' : 'Necesitas hora natal',
      num: null, color:'#ff88cc', ringPct: rising ? 0.75 : 0.3,
      badge: rising ? 'Verificado' : 'Aproximado'
    },
    {
      icon:'🔢', label:'Camino de Vida', value: String(lp),
      sub: tikun, num: lp,
      color:'#44ddff', ringPct: lp/33,
      badge: `Número ${lp}`
    },
    {
      icon:'✡️', label:'Número del Nombre', value: String(nn),
      sub: KABBALAH[nn]||'Energía del nombre', num: nn,
      color:'#ffaa44', ringPct: nn/33,
      badge: `Vibración ${nn}`
    },
    {
      icon:'🌊', label:'Elemento', value: elem.split(' ')[1],
      sub: getElementDesc(user.sign), num: null,
      color: getElementColor(user.sign), ringPct:0.65,
      badge: elem.split(' ')[0]
    },
    {
      icon:'💫', label:'Tikún del Alma', value: tikun.split(' - ')[0],
      sub: tikun.split(' - ')[1]||tikun, num: lp,
      color:'#cc66ff', ringPct:0.80,
      badge: 'Sefirá'
    }
  ];
}

function getElementDesc(sign){
  if(['Aries','Leo','Sagitario'].includes(sign))return'Pasión · Acción · Liderazgo';
  if(['Tauro','Virgo','Capricornio'].includes(sign))return'Estabilidad · Practica · Paciencia';
  if(['Géminis','Libra','Acuario'].includes(sign))return'Intelecto · Comunicación · Libertad';
  return'Emoción · Profundidad · Empatía';
}
function getElementColor(sign){
  if(['Aries','Leo','Sagitario'].includes(sign))return'#ff6644';
  if(['Tauro','Virgo','Capricornio'].includes(sign))return'#88cc44';
  if(['Géminis','Libra','Acuario'].includes(sign))return'#44aaff';
  return'#4488ff';
}

// ── RENDER CARRUSEL ──
function buildAstralCarousel(user){
  const carousel = document.getElementById('astral-carousel');
  const dotsEl = document.getElementById('carousel-dots');
  const card = document.getElementById('carousel-card');
  if(!carousel||!card) return;

  const items = buildCarouselData(user);
  const circumference = 2 * Math.PI * 38; // radio 38

  carousel.innerHTML = items.map((item, i) => {
    const dashOffset = circumference * (1 - Math.min(1, item.ringPct));
    return `
      <div class="astral-card-item" id="ac-${i}" onclick="selectCarouselCard(${i})">
        <div class="astral-ring-wrap">
          <svg class="astral-ring-svg" viewBox="0 0 90 90">
            <circle class="astral-ring-bg" cx="45" cy="45" r="38"/>
            <circle class="astral-ring-fill"
              cx="45" cy="45" r="38"
              stroke="${item.color}"
              stroke-dasharray="${circumference}"
              style="--dash-total:${circumference};--dash-offset:${dashOffset};animation-delay:${i*0.15}s;"
            />
          </svg>
          <div class="astral-ring-inner">
            <span class="astral-ring-icon">${item.icon}</span>
            ${item.num !== null ? `<span class="astral-ring-num">${item.num}</span>` : ''}
          </div>
        </div>
        <div class="astral-card-label">${item.label}</div>
        <div class="astral-card-value">${item.value}</div>
        <div class="astral-card-sub">${item.sub}</div>
        <span class="astral-card-badge">${item.badge}</span>
      </div>`;
  }).join('');

  // Dots
  dotsEl.innerHTML = items.map((_, i) =>
    `<button class="c-dot${i===0?' active':''}" onclick="scrollToCard(${i})"></button>`
  ).join('');

  // Scroll listener para actualizar dots
  carousel.addEventListener('scroll', () => {
    const idx = Math.round(carousel.scrollLeft / 176);
    dotsEl.querySelectorAll('.c-dot').forEach((d,i) => d.classList.toggle('active', i===idx));
  }, {passive:true});

  card.style.display = 'block';
  card.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function selectCarouselCard(i){
  document.querySelectorAll('.astral-card-item').forEach((el,j)=>{
    el.style.borderColor = j===i ? 'var(--gold)' : 'var(--gborder)';
    el.style.boxShadow = j===i ? '0 0 20px rgba(255,215,0,0.3)' : '';
  });
}

function scrollToCard(i){
  const carousel = document.getElementById('astral-carousel');
  if(carousel) carousel.scrollTo({left: i * 176, behavior:'smooth'});
}

// ── HOOK: mostrar carrusel cuando la carta natal está cargada ──
// Reemplaza initNatal para añadir el carrusel al final (sin romper nada)
const _origInitNatal = window.initNatal;
window.initNatal = async function(){
  await _origInitNatal();
  if(currentUser) buildAstralCarousel(currentUser);
};

// ── DESCARGA: CARTA INDIVIDUAL ──
function downloadAstralCard(){
  const carousel = document.getElementById('astral-carousel');
  if(!carousel) return;
  const idx = Math.round(carousel.scrollLeft / 176);
  const items = buildCarouselData(currentUser);
  const item = items[Math.min(idx, items.length-1)];
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - Math.min(1, item.ringPct));

  const canvas = document.getElementById('astral-canvas');
  canvas.width = 400; canvas.height = 500;
  const ctx = canvas.getContext('2d');

  // Fondo
  const bg = ctx.createRadialGradient(200,200,0,200,200,280);
  bg.addColorStop(0,'#0d0520'); bg.addColorStop(1,'#050510');
  ctx.fillStyle = bg; ctx.fillRect(0,0,400,500);

  // Borde
  ctx.strokeStyle = 'rgba(150,80,255,0.4)'; ctx.lineWidth = 1.5;
  roundRect(ctx, 10, 10, 380, 480, 20); ctx.stroke();

  // Título ALMA IA
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 14px serif'; ctx.textAlign = 'center'; ctx.letterSpacing = '4px';
  ctx.fillText('ALMA IA', 200, 45);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '10px sans-serif'; ctx.fillText('MAPA ASTRAL', 200, 62);

  // Anillo SVG → Canvas
  const cx=200, cy=195, r=110;
  // Track
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=8; ctx.stroke();
  // Fill arc
  const startAngle = -Math.PI/2;
  const endAngle = startAngle + (2*Math.PI * Math.min(1, item.ringPct));
  ctx.beginPath(); ctx.arc(cx,cy,r,startAngle,endAngle);
  ctx.strokeStyle = item.color; ctx.lineWidth = 8;
  ctx.lineCap = 'round'; ctx.stroke();

  // Icono y número dentro
  ctx.font = '44px serif'; ctx.textAlign='center';
  ctx.fillText(item.icon, cx, cy+8);
  if(item.num !== null){
    ctx.font='bold 22px serif'; ctx.fillStyle=item.color;
    ctx.fillText(item.num, cx, cy+36);
  }

  // Textos info
  ctx.fillStyle='rgba(255,255,255,0.4)';
  ctx.font='10px sans-serif'; ctx.letterSpacing='3px';
  ctx.fillText(item.label.toUpperCase(), 200, 330);
  ctx.fillStyle='#ffffff'; ctx.font='bold 22px serif'; ctx.letterSpacing='1px';
  ctx.fillText(item.value, 200, 362);
  ctx.fillStyle='rgba(170,68,255,0.9)'; ctx.font='13px sans-serif'; ctx.letterSpacing='0px';
  ctx.fillText(item.sub, 200, 385);
  // Badge
  ctx.fillStyle='rgba(255,215,0,0.15)';
  roundRect(ctx,130,400,140,28,14); ctx.fill();
  ctx.strokeStyle='rgba(255,215,0,0.3)'; ctx.lineWidth=1; ctx.stroke();
  ctx.fillStyle='#ffd700'; ctx.font='11px sans-serif';
  ctx.fillText(item.badge, 200, 419);

  // Nombre del usuario
  ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.font='11px sans-serif';
  ctx.fillText(`${currentUser.name} · ${new Date().toLocaleDateString('es')}`, 200, 460);
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='10px sans-serif';
  ctx.fillText('mysticia.vercel.app', 200, 480);

  triggerDownload(canvas, `alma-ia-${item.label.toLowerCase().replace(/\s/g,'-')}.png`);
}

// ── DESCARGA: MAPA COMPLETO ──
function downloadFullChart(){
  const items = buildCarouselData(currentUser);
  const canvas = document.getElementById('astral-canvas');
  canvas.width = 400; canvas.height = 680;
  const ctx = canvas.getContext('2d');

  // Fondo
  const bg = ctx.createRadialGradient(200,300,0,200,300,350);
  bg.addColorStop(0,'#0d0520'); bg.addColorStop(1,'#050510');
  ctx.fillStyle=bg; ctx.fillRect(0,0,400,680);
  ctx.strokeStyle='rgba(150,80,255,0.4)'; ctx.lineWidth=1.5;
  roundRect(ctx,10,10,380,660,20); ctx.stroke();

  // Header
  ctx.fillStyle='#ffd700'; ctx.font='bold 18px serif'; ctx.textAlign='center';
  ctx.fillText('ALMA IA · MAPA ASTRAL', 200, 46);
  ctx.fillStyle='rgba(255,255,255,0.5)'; ctx.font='11px sans-serif';
  ctx.fillText(`${currentUser.name} · ${currentUser.sign} · ${new Date().toLocaleDateString('es')}`, 200, 66);

  // Línea decorativa
  ctx.strokeStyle='rgba(255,215,0,0.2)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(40,78); ctx.lineTo(360,78); ctx.stroke();

  // Mini anillos grid 3x2 + 1
  const cols=3, startY=100, cardW=118, cardH=155;
  items.slice(0,6).forEach((item,i)=>{
    const col=i%cols; const row=Math.floor(i/cols);
    const cx2 = 55 + col*(cardW+4);
    const cy2 = startY + row*(cardH+8) + 40;

    // Mini anillo
    const r2=32;
    ctx.beginPath(); ctx.arc(cx2,cy2,r2,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=5; ctx.stroke();
    const ea=-Math.PI/2+(2*Math.PI*Math.min(1,item.ringPct));
    ctx.beginPath(); ctx.arc(cx2,cy2,r2,-Math.PI/2,ea);
    ctx.strokeStyle=item.color; ctx.lineWidth=5; ctx.lineCap='round'; ctx.stroke();

    ctx.font='18px serif'; ctx.fillStyle='#fff'; ctx.textAlign='center';
    ctx.fillText(item.icon,cx2,cy2+7);

    // Label + valor
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='8px sans-serif';
    ctx.fillText(item.label.toUpperCase(), cx2, cy2+52);
    ctx.fillStyle='#fff'; ctx.font='bold 12px serif';
    ctx.fillText(item.value.length>10?item.value.slice(0,9)+'…':item.value, cx2, cy2+68);
    ctx.fillStyle=item.color; ctx.font='9px sans-serif';
    ctx.fillText(item.sub.length>18?item.sub.slice(0,17)+'…':item.sub, cx2, cy2+83);
  });

  // Línea separadora
  const sepY=100+2*(cardH+8)+12;
  ctx.strokeStyle='rgba(150,80,255,0.15)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(30,sepY); ctx.lineTo(370,sepY); ctx.stroke();

  // Séptima carta centrada abajo
  if(items[6]){
    const item=items[6]; const cx3=200; const cy3=sepY+55; const r3=36;
    ctx.beginPath(); ctx.arc(cx3,cy3,r3,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=5; ctx.stroke();
    const ea2=-Math.PI/2+(2*Math.PI*Math.min(1,item.ringPct));
    ctx.beginPath(); ctx.arc(cx3,cy3,r3,-Math.PI/2,ea2);
    ctx.strokeStyle=item.color; ctx.lineWidth=5; ctx.lineCap='round'; ctx.stroke();
    ctx.font='22px serif'; ctx.fillStyle='#fff'; ctx.textAlign='center';
    ctx.fillText(item.icon,cx3,cy3+8);
    ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.font='9px sans-serif';
    ctx.fillText(item.label.toUpperCase(),cx3,cy3+55);
    ctx.fillStyle='#fff'; ctx.font='bold 14px serif';
    ctx.fillText(item.value,cx3,cy3+72);
    ctx.fillStyle=item.color; ctx.font='10px sans-serif';
    ctx.fillText(item.sub,cx3,cy3+89);
  }

  // Footer
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.font='10px sans-serif';
  ctx.fillText('mysticia.vercel.app | ALMA IA © 2026', 200, 660);

  triggerDownload(canvas, `alma-ia-mapa-completo-${currentUser.name.replace(/\s/g,'-')}.png`);
}

// ── HELPER: Descargar canvas ──
function triggerDownload(canvas, filename){
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link); link.click();
  document.body.removeChild(link);
  toast('✨ Carta descargada');
}

// ── HELPER: Rounded rect para Canvas ──
function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
}
