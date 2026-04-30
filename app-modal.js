// ═══ ALMA IA · MODAL CARTA ASTRAL ═══
// Módulo independiente — no modifica nada existente

(function(){
  // ── ESTADO ──
  let _items=[], _idx=0, _aiCache={};

  // ── DATOS ESTÁTICOS POR TIPO ──
  const CARD_DATA={
    'Sol Solar':{
      phrases:['Tu luz interior no necesita permiso para brillar.','Eres exactamente quien debes ser en este momento.','El sol no se disculpa por brillar — tú tampoco debes.'],
      meanings:{
        'Aries':'Tu esencia es pura iniciativa y fuego creador. Aries solar imprime liderazgo natural y una voluntad inquebrantable en cada acción.',
        'Tauro':'Tu núcleo es estabilidad y sensorialidad. Tauro solar te da paciencia excepcional, amor por la belleza y una fuerza de voluntad de piedra.',
        'Géminis':'Tu esencia es curiosidad y conexión. Géminis solar te hace puente entre mundos, con mente ágil y don de la comunicación.',
        'Cáncer':'Tu núcleo es profundidad emocional y cuidado. Cáncer solar te da intuición poderosa y la capacidad de crear hogar donde quieras.',
        'Leo':'Tu esencia es creatividad y generosidad. Leo solar irradia carisma natural y una necesidad sana de expresar tu luz única.',
        'Virgo':'Tu núcleo es discernimiento y servicio. Virgo solar te da capacidad analítica excepcional y un deseo genuino de mejorar todo.',
        'Libra':'Tu esencia es armonía y belleza. Libra solar te hace mediador nato con sentido estético elevado y búsqueda de justicia.',
        'Escorpio':'Tu núcleo es transformación y profundidad. Escorpio solar te da intensidad magnética y capacidad de renacer de tus cenizas.',
        'Sagitario':'Tu esencia es expansión y búsqueda de verdad. Sagitario solar te da optimismo contagioso y amor por la libertad y el conocimiento.',
        'Capricornio':'Tu núcleo es disciplina y propósito. Capricornio solar te da ambición estructurada y la capacidad de construir lo que imaginas.',
        'Acuario':'Tu esencia es innovación y humanismo. Acuario solar te hace visionario nato con misión colectiva y pensamiento original.',
        'Piscis':'Tu núcleo es empatía y conexión universal. Piscis solar te da sensibilidad artística profunda y acceso a dimensiones invisibles.'
      },
      advice:'Hoy afirma conscientemente quién eres. No quien deberías ser — sino quien ya eres en tu núcleo más verdadero.'
    },
    'Luna':{
      phrases:['Tus emociones son datos sagrados, no debilidades.','Tu mundo interior es tan vasto como el cielo nocturno.','Escucha lo que sientes antes de decidir qué pensar.'],
      meanings:{
        'Aries':'Luna en Aries: reaccionas con instinto y pasión. Tus emociones son veloces y honestas. Aprende a respirar antes de actuar.',
        'Tauro':'Luna en Tauro: necesitas seguridad y confort emocional. El cambio te desafía pero también te fortalece.',
        'Géminis':'Luna en Géminis: tus emociones se procesan a través de palabras e ideas. Escribir o hablar te sana profundamente.',
        'Cáncer':'Luna en Cáncer: en su hogar natural. Sensibilidad extraordinaria y memoria emocional poderosa.',
        'Leo':'Luna en Leo: necesitas reconocimiento y amor genuino. Tu corazón se expande cuando te ven y te valoran.',
        'Virgo':'Luna en Virgo: procesas emociones analizándolas. El orden externo calma tu mundo interno.',
        'Libra':'Luna en Libra: buscas equilibrio en todo vínculo. La armonía relacional es tu nutrición emocional esencial.',
        'Escorpio':'Luna en Escorpio: emociones profundas e intensas. Sanas a través de la transformación y la honestidad radical.',
        'Sagitario':'Luna en Sagitario: necesitas libertad y aventura para sentirte bien. El encierro emocional te apaga.',
        'Capricornio':'Luna en Capricornio: contienes las emociones con disciplina. Aprender a sentir sin juzgarte es tu gran viaje.',
        'Acuario':'Luna en Acuario: procesas desde la mente. Necesitas espacio y libertad para conectar emocionalmente a tu manera.',
        'Piscis':'Luna en Piscis: emociones fluidas y empáticas. Eres esponja energética — proteger tu campo es esencial.'
      },
      advice:'Esta semana, antes de responder a cualquier situación difícil, date 3 minutos de silencio para escuchar qué siente realmente tu corazón.'
    },
    'Ascendente':{
      phrases:['Tu máscara no es falsa — es el puente entre tu alma y el mundo.','El mundo te ve primero por tu ascendente; tú te conoces por tu sol.','Tu presencia es un regalo, incluso cuando no lo percibes.'],
      meanings:{
        default:'El Ascendente define cómo te percibes a ti mismo en tu relación con el mundo y cómo los demás te ven al primer contacto. Es tu energía más visible y tu estilo natural de relacionarte.'
      },
      advice:'Observa esta semana cómo reaccionas en los primeros 5 minutos de conocer a alguien nuevo. Ahí está tu Ascendente en acción.'
    },
    'Camino de Vida':{
      phrases:['Tu número no te limita — te orienta hacia tu mayor versión.','El camino de vida es el alma del destino numerológico.','No vine a este mundo a encajar — vine a florecer.'],
      meanings:{
        1:'Camino 1 — Liderazgo e iniciativa. Tu misión es desarrollar independencia, originalidad y el coraje de iniciar. El pionero del grupo.',
        2:'Camino 2 — Cooperación y sensibilidad. Vienes a aprender el poder de la diplomacia, el trabajo en equipo y la intuición relacional.',
        3:'Camino 3 — Expresión y creatividad. Tu alma busca comunicar, crear y traer alegría al mundo a través del arte o la palabra.',
        4:'Camino 4 — Estructura y construcción. Vienes a construir fundamentos sólidos, trabajar con disciplina y crear seguridad duradera.',
        5:'Camino 5 — Libertad y cambio. Tu alma necesita variedad, aventura y la expansión constante de experiencias.',
        6:'Camino 6 — Amor y responsabilidad. Vienes a servir, cuidar y crear armonía en el hogar y la comunidad.',
        7:'Camino 7 — Sabiduría e introspección. Tu alma es buscadora espiritual, analítica y profunda.',
        8:'Camino 8 — Poder y abundancia. Vienes a dominar el mundo material con integridad y construir abundancia real.',
        9:'Camino 9 — Humanismo y cierre. Tu alma busca servir a la humanidad y completar ciclos con sabiduría.',
        11:'Camino Maestro 11 — Iluminación e intuición. Sensibilidad extrema y misión de inspirar a otros con tu luz.',
        22:'Camino Maestro 22 — Constructor de mundos. Capacidad excepcional para materializar grandes visiones.',
        33:'Camino Maestro 33 — Maestro sanador. Misión de elevar la conciencia colectiva con amor incondicional.'
      },
      advice:'Haz UNA acción hoy que esté alineada con la esencia de tu número de vida. No grande — auténtica.'
    },
    'Número del Nombre':{
      phrases:['Tu nombre vibra con una frecuencia que el universo reconoce.','Cada letra de tu nombre es una nota de tu sinfonía cósmica.','La vibración de tu nombre abre puertas invisibles.'],
      meanings:{
        default:'El Número del Nombre (calculado con A=1 hasta Z=26) revela la vibración energética que proyectas al mundo a través de tu identidad. Es la frecuencia de tu presencia en cada interacción.'
      },
      advice:'Pronuncia tu nombre completo tres veces en voz alta hoy. Siente su vibración. Esa es tu firma energética en el universo.'
    },
    'Elemento':{
      phrases:['Tu elemento no es tu destino — es tu combustible.','Fluir con tu naturaleza elemental es la forma más inteligente de avanzar.','Los elementos son el idioma más antiguo del cosmos.'],
      meanings:{
        '🔥 Fuego':'Elemento Fuego: pasión, acción e inspiración son tu combustible. Lideras con entusiasmo y enciendes a quienes te rodean. El desafío es sostener sin quemar.',
        '🌍 Tierra':'Elemento Tierra: practicidad, paciencia y construcción son tu naturaleza. Materializas lo que otros solo imaginan. El desafío es soltar el control excesivo.',
        '💨 Aire':'Elemento Aire: pensamiento, comunicación e ideas son tu territorio. Conectas conceptos y personas con facilidad. El desafío es aterrizar las ideas en acción.',
        '💧 Agua':'Elemento Agua: emoción, intuición y profundidad son tu mundo. Sientes lo que otros no ven. El desafío es no absorber el dolor ajeno como propio.'
      },
      advice:'Esta semana trabaja CON tu elemento, no contra él. Si eres Fuego, actúa. Si eres Agua, siente. Si eres Tierra, construye. Si eres Aire, comunica.'
    },
    'Tikún del Alma':{
      phrases:['Tu Tikún es la tarea más sagrada de esta vida.','El alma eligió exactamente lo que necesita sanar.','Cada obstáculo es el mapa hacia tu Tikún.'],
      meanings:{
        default:'El Tikún (תיקון) en la Cábala es la corrección o misión específica que el alma trae a esta encarnación. Es el patrón de aprendizaje más profundo que hay que integrar en esta vida para elevar la conciencia.'
      },
      advice:'Identifica UN patrón repetitivo en tu vida. Ese patrón es tu Tikún mostrándose. No lo evadas — obsévalo con amor y curiosidad.'
    }
  };

  // ── ABRIR MODAL ──
  window.openAstralModal = function(idx){
    _items = buildCarouselData(currentUser);
    _idx = idx;
    renderModal(_idx);
    const modal = document.getElementById('astral-modal');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    initSwipe();
    initKeyboard();
  };

  // ── CERRAR MODAL ──
  window.closeAstralModal = function(){
    const modal = document.getElementById('astral-modal');
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ── NAVEGAR ──
  window.navigateModal = function(dir){
    const next = _idx + dir;
    if(next < 0 || next >= _items.length) return;
    const box = document.getElementById('astral-modal-box');
    box.classList.add(dir < 0 ? 'swiping-right' : 'swiping-left');
    setTimeout(()=>{
      box.classList.remove('swiping-left','swiping-right');
      _idx = next;
      renderModal(_idx);
      box.scrollTop = 0;
    }, 120);
  };

  // ── RENDER ──
  function renderModal(idx){
    const item = _items[idx];
    const data = CARD_DATA[item.label] || {};
    const circumference = 2 * Math.PI * 60; // r=60

    // Header
    document.getElementById('amod-icon').textContent = item.icon;
    document.getElementById('amod-label').textContent = item.label;
    document.getElementById('amod-title').textContent = item.value + (item.sub ? ' · ' + item.sub.split('·')[0].trim() : '');

    // Anillo
    const fill = document.getElementById('amod-ring-fill');
    const dashOffset = circumference * (1 - Math.min(1, item.ringPct));
    fill.style.stroke = item.color;
    fill.style.setProperty('--dash-total', circumference);
    fill.style.setProperty('--dash-offset', dashOffset);
    fill.setAttribute('stroke-dasharray', circumference);
    // Re-trigger animation
    fill.style.animation = 'none';
    fill.getBoundingClientRect();
    fill.style.animation = '';

    document.getElementById('amod-ring-icon').textContent = item.icon;
    document.getElementById('amod-ring-num').textContent = item.num !== null ? item.num : '';
    document.getElementById('amod-ring-val').textContent = item.value;
    document.getElementById('amod-badge').textContent = item.badge;

    // Frase emocional
    const phrases = data.phrases || ['Tu alma tiene una misión única en este universo.'];
    document.getElementById('amod-phrase').textContent =
      '"' + phrases[Math.floor(Math.random() * phrases.length)] + '"';

    // Significado estático
    const meanings = data.meanings || {};
    const meaning = meanings[item.value] || meanings['default'] ||
      `${item.label} en ${item.value}: una energía única que moldea profundamente tu camino y forma en que experimentas el mundo.`;
    document.getElementById('amod-meaning').textContent = meaning;

    // Consejo
    document.getElementById('amod-advice').textContent = data.advice ||
      'Observa cómo esta energía se manifiesta en tus relaciones y decisiones de hoy.';

    // Dots
    const dotsEl = document.getElementById('amod-dots');
    dotsEl.innerHTML = _items.map((_,i) =>
      `<button class="c-dot${i===idx?' active':''}" onclick="navigateModal(${i-_idx})"></button>`
    ).join('');

    // Botones nav
    document.getElementById('amod-prev').disabled = idx === 0;
    document.getElementById('amod-next').disabled = idx === _items.length - 1;

    // Carga IA asíncrona
    loadAIReading(item, idx);
  }

  // ── LECTURA IA POR CARTA ──
  async function loadAIReading(item, idx){
    const aiEl = document.getElementById('amod-ai-text');
    const loader = document.getElementById('amod-loader');
    if(!aiEl || !loader) return;

    const cacheKey = `modal_ai_${item.label}_${currentUser?.sign}_${today()}`;
    if(_aiCache[cacheKey]){
      aiEl.innerHTML = _aiCache[cacheKey];
      aiEl.style.display = 'block';
      return;
    }

    // Check localStorage
    const cached = lsGet(cacheKey);
    if(cached){
      aiEl.innerHTML = cached;
      aiEl.style.display = 'block';
      _aiCache[cacheKey] = cached;
      return;
    }

    loader.classList.add('show');
    aiEl.style.display = 'none';

    try{
      const prompt = `En máximo 3 párrafos cortos (2 líneas cada uno), dame una lectura personalizada de mi ${item.label} (${item.value}) en el contexto de mi vida actual. Usuario: ${currentUser?.name}, signo solar ${currentUser?.sign}, ciudad ${currentUser?.birthCity||'no especificada'}. Sé directo, cálido y transformador. Habla en primera persona al usuario.`;
      const reading = await callAI('CodigoVital', prompt);

      // Solo muestra si aún estamos en la misma carta
      if(_idx === idx){
        aiEl.innerHTML = reading;
        aiEl.style.display = 'block';
      }
      _aiCache[cacheKey] = reading;
      lsSave(cacheKey, reading);
    }catch(e){
      if(_idx === idx){
        aiEl.innerHTML = 'Las estrellas están en silencio ahora. Intenta de nuevo más tarde.';
        aiEl.style.display = 'block';
      }
    }finally{
      if(_idx === idx) loader.classList.remove('show');
    }
  }

  // ── SWIPE (móvil) ──
  function initSwipe(){
    const box = document.getElementById('astral-modal-box');
    if(!box || box._swipeInit) return;
    box._swipeInit = true;
    let startX=0, startY=0, isDragging=false;

    box.addEventListener('touchstart', e=>{
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    },{passive:true});

    box.addEventListener('touchmove', e=>{
      if(!isDragging) return;
      const dx = e.touches[0].clientX - startX;
      const dy = Math.abs(e.touches[0].clientY - startY);
      if(Math.abs(dx) > dy && Math.abs(dx) > 20){
        e.preventDefault();
      }
    },{passive:false});

    box.addEventListener('touchend', e=>{
      if(!isDragging) return;
      isDragging = false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = Math.abs(e.changedTouches[0].clientY - startY);
      if(Math.abs(dx) > 60 && Math.abs(dx) > dy){
        navigateModal(dx < 0 ? 1 : -1);
      }
    },{passive:true});
  }

  // ── TECLADO (Smart TV + Desktop) ──
  function initKeyboard(){
    if(window._modalKeyInit) return;
    window._modalKeyInit = true;
    document.addEventListener('keydown', e=>{
      const modal = document.getElementById('astral-modal');
      if(!modal.classList.contains('open')) return;
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown') navigateModal(1);
      if(e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   navigateModal(-1);
      if(e.key === 'Escape') closeAstralModal();
    });
  }

  // ── HOOK: conectar click de las cartas del carrusel ──
  // Sobrescribe selectCarouselCard del carrusel para abrir modal
  const _origSelect = window.selectCarouselCard;
  window.selectCarouselCard = function(i){
    if(_origSelect) _origSelect(i);
    openAstralModal(i);
  };

})(); // IIFE — no contamina el scope global
