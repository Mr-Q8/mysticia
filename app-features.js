// ═══ ALMA IA · FEATURES (tarot, natal, sueños, horo, clima, código vital, radiografía) ═══

// ── WEATHER ──
async function loadWeather(){
  if(!navigator.geolocation){setWeatherFallback();return;}
  navigator.geolocation.getCurrentPosition(async pos=>{
    try{
      const{latitude:lat,longitude:lon}=pos.coords;
      const[wx,geo]=await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`).then(r=>r.json()),
        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`).then(r=>r.json())
      ]);
      const cw=wx.current_weather;
      const code=cw.weathercode;const desc=WEATHER_CODES[code]||'🌡️ Variable';
      const city=geo.address?.city||geo.address?.town||geo.address?.village||'Tu ciudad';
      const icon=desc.split(' ')[0];const label=desc.split(' ').slice(1).join(' ');
      document.getElementById('weather-temp').textContent=`${Math.round(cw.temperature)}°C`;
      document.getElementById('weather-city').textContent=city;
      document.getElementById('weather-icon').textContent=icon;
      document.getElementById('weather-desc').textContent=label;
      document.getElementById('weather-day').textContent=new Date().toLocaleDateString('es',{weekday:'short'});
    }catch(e){setWeatherFallback();}
  },()=>setWeatherFallback());
}
function setWeatherFallback(){
  document.getElementById('weather-temp').textContent='--°C';
  document.getElementById('weather-city').textContent='Activa ubicación';
  document.getElementById('weather-icon').textContent='📍';
  document.getElementById('weather-desc').textContent='Sin datos';
}

// ── HORÓSCOPO AUTO-WIDGET ──
async function loadHoroscopeWidget(){
  if(!currentUser)return;
  const sign=currentUser.sign;const cacheKey=`horo_widget_${sign}_${today()}`;
  const widget=document.getElementById('horo-auto-widget');
  const signEl=document.getElementById('horo-auto-sign');
  const textEl=document.getElementById('horo-auto-text');
  const summaryEl=document.getElementById('horo-auto-summary');
  if(!widget)return;
  signEl.textContent=`${SIGNS[sign]||'⭐'} ${sign.toUpperCase()} · HOY`;
  widget.style.display='block';
  const cached=lsGet(cacheKey);
  if(cached){textEl.innerHTML=cached.text||cached;if(cached.summary)summaryEl.textContent=cached.summary;return;}
  textEl.textContent='Consultando las estrellas...';
  try{
    const reading=await callAI('Horóscopo',
      `Horóscopo BREVE para ${sign} hoy ${today()}. Máximo 3 párrafos cortos: 1) Energía y estado general del día. 2) Amor/relaciones o trabajo (el más relevante hoy). 3) Mensaje clave + número de la suerte. Al final, una frase resumen de máximo 10 palabras entre [RESUMEN] y [/RESUMEN].`);
    const summaryMatch=reading.match(/\[RESUMEN\](.*?)\[\/RESUMEN\]/s);
    const summary=summaryMatch?summaryMatch[1].trim():'';
    const cleanText=reading.replace(/\[RESUMEN\].*?\[\/RESUMEN\]/s,'').trim();
    textEl.innerHTML=cleanText;summaryEl.textContent=summary?`✨ ${summary}`:'';
    lsSave(cacheKey,{text:cleanText,summary});
  }catch(e){textEl.textContent='Las estrellas están en silencio ahora.';}
}

// ── TABS ──
function switchTab(name){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('panel-'+name).classList.add('active');
  document.getElementById('tab-'+name).classList.add('active');
  if(name==='natal')initNatal();
  if(name==='tarot')initTarot();
}

// ── TAROT ──
async function initTarot(){
  const saved=await getReading('tarot');
  if(saved&&saved.file){
    document.getElementById('card-img').src=`tarot/${saved.file}`;
    document.getElementById('card-name').textContent=saved.name;
    if(saved.reading){const r=document.getElementById('tarot-result');r.innerHTML=saved.reading;r.classList.add('show');}
    if(saved.summary){const s=document.getElementById('tarot-summary-box');if(s){s.textContent=`✨ "${saved.summary}"`;s.style.display='block';}}
    const btn=document.getElementById('tarot-btn');if(btn)btn.textContent='✨ Tu carta del día ya fue revelada';
  }
}
async function drawTarotCard(){
  const existing=await getReading('tarot');
  if(existing&&existing.file){toast('⏳ Ya consultaste el Tarot hoy. Regresa mañana.');return;}
  const card=CARDS[Math.floor(Math.random()*CARDS.length)];
  const cardImg=document.getElementById('card-img');const cardName=document.getElementById('card-name');
  const loader=document.getElementById('tarot-loader');const result=document.getElementById('tarot-result');const btn=document.getElementById('tarot-btn');
  cardImg.src=`tarot/${card.file}`;cardName.textContent=card.name;
  if(btn){btn.disabled=true;btn.textContent='Interpretando...';}
  loader.classList.add('show');result.classList.remove('show');
  try{
    const reading=await callAI('Tarot',
      `Carta obtenida: "${card.name}". Interpreta con MÁXIMO 5 párrafos cortos (2-3 líneas cada uno):
1. Hook emocional impactante — una verdad que golpea el alma.
2. Lo que esta carta revela sobre mi momento actual.
3. El mensaje central: lo que DEBO entender ahora mismo.
4. Un consejo práctico y accionable para las próximas 24 horas.
5. Cierre reflexivo breve con energía cabalística (una Sefirá relevante).
Al final escribe: [RESUMEN]frase de máximo 12 palabras que capture la esencia[/RESUMEN]
[ESCENA1]texto emocional corto · PALABRA_CLAVE[/ESCENA1]
[ESCENA2]texto emocional corto · PALABRA_CLAVE[/ESCENA2]
[ESCENA3]texto emocional corto · PALABRA_CLAVE[/ESCENA3]`);
    // Parse summary and scenes
    const sumMatch=reading.match(/\[RESUMEN\](.*?)\[\/RESUMEN\]/s);
    const summary=sumMatch?sumMatch[1].trim():'';
    const scenes=[];for(let i=1;i<=3;i++){const m=reading.match(new RegExp(`\\[ESCENA${i}\\](.*?)\\[\\/ESCENA${i}\\]`,'s'));if(m)scenes.push(m[1].trim());}
    const cleanReading=reading.replace(/\[RESUMEN\].*?\[\/RESUMEN\]/s,'').replace(/\[ESCENA\d\].*?\[\/ESCENA\d\]/gs,'').trim();
    result.innerHTML=cleanReading;result.classList.add('show');
    const sb=document.getElementById('tarot-summary-box');if(sb&&summary){sb.textContent=`✨ "${summary}"`;sb.style.display='block';}
    await saveReading('tarot',{...card,reading:cleanReading,summary,scenes,date:today()});
    if(btn)btn.textContent='✨ Tu carta del día ya fue revelada';
  }catch(e){result.innerHTML='Error de conexión. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='🔮 Consultar el Tarot';}}
  finally{loader.classList.remove('show');}
}

// ── NATAL ──
async function initNatal(){
  const container=document.getElementById('natal-content');if(!container||!currentUser)return;
  const moon=getMoon(currentUser.birthDate);const rising=getRising(currentUser.birthDate,currentUser.birthTime);
  const lp=getLifePath(currentUser.birthDate);const tikun=KABBALAH[lp]||'Keter - Corona';const elem=getElement(currentUser.sign);
  container.innerHTML=`<div class="natal-grid">
    <div class="natal-item"><div class="natal-symbol">☀️</div><div class="natal-label">Sol</div><div class="natal-value">${currentUser.sign}</div></div>
    <div class="natal-item"><div class="natal-symbol">🌙</div><div class="natal-label">Luna</div><div class="natal-value">${moon}</div></div>
    <div class="natal-item"><div class="natal-symbol">⬆️</div><div class="natal-label">Ascendente</div><div class="natal-value">${rising||'Con hora natal'}</div></div>
    <div class="natal-item"><div class="natal-symbol">🔢</div><div class="natal-label">Camino de Vida</div><div class="natal-value">${lp}</div></div>
    <div class="natal-item"><div class="natal-symbol">🌊</div><div class="natal-label">Elemento</div><div class="natal-value">${elem}</div></div>
    <div class="natal-item"><div class="natal-symbol">✡️</div><div class="natal-label">Tikún</div><div class="natal-value" style="font-size:11px">${tikun}</div></div>
  </div>`;
  let natalReading=null;
  if(currentUser.id){const r=await supaAuth('get_natal',{userId:currentUser.id});if(r.natal)natalReading=r.natal.reading;}
  if(!natalReading)natalReading=ls('alma_natal_reading');
  if(natalReading){const box=document.getElementById('natal-result');box.innerHTML=natalReading;box.classList.add('show');}
  else{const btn=document.getElementById('natal-btn');if(btn)btn.style.display='block';}
}
async function generateNatal(){
  const btn=document.getElementById('natal-btn');const loader=document.getElementById('natal-loader');const result=document.getElementById('natal-result');
  if(btn){btn.disabled=true;btn.textContent='Calculando tu mapa estelar...';}loader.classList.add('show');
  try{
    const moon=getMoon(currentUser.birthDate);const rising=getRising(currentUser.birthDate,currentUser.birthTime);const lp=getLifePath(currentUser.birthDate);const tikun=KABBALAH[lp]||'Keter';
    const reading=await callAI('Carta Natal',`Sol en ${currentUser.sign}, Luna en ${moon}${rising?', Ascendente en '+rising:''}, Camino de Vida ${lp} (${tikun}). Ciudad natal: ${currentUser.birthCity||'no especificada'}. Dame un análisis transformador: propósito de vida, patrones de sombra, dones del alma, integrando Astrología, Cábala (Sefirot, Zohar) y Psicología Sistémica. Máximo 6 párrafos claros y directos.`);
    result.innerHTML=reading;result.classList.add('show');lsSet('alma_natal_reading',reading);
    if(currentUser.id)await supaAuth('save_natal',{userId:currentUser.id,reading,sunSign:currentUser.sign,moonSign:moon,risingSign:rising,lifePath:lp,tikun});
    if(btn)btn.style.display='none';
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='⭐ Generar mi Carta Natal';}}
  finally{loader.classList.remove('show');}
}

// ── SUEÑOS ──
async function interpretDream(){
  const existing=await getReading('sueno');if(existing){toast('🌙 Ya interpretaste tu sueño hoy. Regresa mañana.');return;}
  const dreamText=document.getElementById('dream-text').value.trim();
  if(!dreamText||dreamText.length<10){toast('Describe tu sueño con más detalle 🌙');return;}
  const btn=document.getElementById('dream-btn');const loader=document.getElementById('dream-loader');const result=document.getElementById('dream-result');
  if(btn){btn.disabled=true;btn.textContent='Interpretando...';}loader.classList.add('show');result.classList.remove('show');
  try{
    const reading=await callAI('Sueños',`Mi sueño: "${dreamText}". Interpreta en máximo 5 párrafos claros: 1) Símbolo central y su significado. 2) Mensaje psicológico (Jung). 3) Mensaje cabalístico (sueños como 1/60 de profecía). 4) Conexión con mi momento de vida actual. 5) Acción concreta sugerida. Sé directo, cálido y revelador.`);
    result.innerHTML=reading;result.classList.add('show');
    await saveReading('sueno',{dream:dreamText,reading,date:today()});
    if(btn)btn.textContent='🌙 Sueño interpretado hoy';
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='🌙 Interpretar mi Sueño';}}
  finally{loader.classList.remove('show');}
}

// ── HORÓSCOPO (TAB COMPLETO) ──
async function getHoroscope(){
  const sign=document.getElementById('horo-sign').value;const cacheKey=`horoscopo_full_${sign}`;
  const result=document.getElementById('horo-result');const loader=document.getElementById('horo-loader');const btn=document.getElementById('horo-btn');
  const cached=await getReading(cacheKey);
  if(cached){result.innerHTML=cached.reading||cached;result.classList.add('show');toast('📖 Horóscopo de hoy');return;}
  if(btn){btn.disabled=true;btn.textContent='Consultando las estrellas...';}loader.classList.add('show');result.classList.remove('show');
  try{
    const reading=await callAI('Horóscopo',`Horóscopo diario completo para ${sign} hoy ${today()}. Incluye en párrafos claros: Energía del día · Amor y relaciones · Trabajo y finanzas · Salud y energía · Número de la suerte · Color del día · Cristal recomendado · Mensaje del Sefirot dominante. Máximo 6 párrafos directos y específicos.`);
    result.innerHTML=reading;result.classList.add('show');
    await saveReading(cacheKey,{reading,sign,date:today()});
    if(btn){btn.textContent='⭐ Horóscopo de hoy';btn.disabled=false;}
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='⭐ Ver mi Horóscopo';}}
  finally{loader.classList.remove('show');}
}

// ── CÓDIGO VITAL (GUÍA LIBRE) ──
async function askGuia(){
  const input=document.getElementById('guia-input').value.trim();
  if(!input||input.length<10){toast('Cuéntame más para poder guiarte 🔑');return;}
  const btn=document.getElementById('guia-btn');const loader=document.getElementById('guia-loader');const result=document.getElementById('guia-result');
  if(btn){btn.disabled=true;btn.textContent='Activando...';}loader.classList.add('show');result.classList.remove('show');
  try{
    const reading=await callAI('CodigoVital',`El consultante dice: "${input}". Responde como experta integradora en propósito de vida, relaciones, patrones de trauma y desarrollo humano. Usa perspectiva cabalística, astrológica y psicológica sistémica. Sé directa, empática y transformadora. Máximo 5 párrafos claros. Si detectas señales de crisis de salud mental o física, recomienda con amor buscar apoyo profesional certificado. Termina con 1 pregunta reflexiva poderosa que invite a la acción.`);
    result.innerHTML=reading;result.classList.add('show');
    if(btn){btn.disabled=false;btn.textContent='🔑 Activar mi Código Vital';}
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='🔑 Activar mi Código Vital';}}
  finally{loader.classList.remove('show');}
}

// ── RADIOGRAFÍA CABALÍSTICA ──
async function doRadiografia(){
  const nombre=document.getElementById('radio-name').value.trim();const birth=document.getElementById('radio-birth').value;
  if(!nombre||!birth){toast('Nombre y fecha son requeridos ✡️');return;}
  const btn=document.getElementById('radio-btn');const loader=document.getElementById('radio-loader');
  const numsEl=document.getElementById('radio-nums');const fieldsEl=document.getElementById('radio-fields');
  const result=document.getElementById('radio-result');const scenesEl=document.getElementById('radio-scenes');
  if(btn){btn.disabled=true;btn.textContent='Calculando...';}loader.classList.add('show');
  result.classList.remove('show');numsEl.style.display='none';fieldsEl.style.display='none';scenesEl.style.display='none';

  const lp=getLifePath(birth);const nn=calcNombreNum(nombre);
  let energy=lp+nn;while(energy>9&&energy!==11&&energy!==22&&energy!==33)energy=String(energy).split('').reduce((a,d)=>a+parseInt(d),0);
  const tikun=KABBALAH[lp]||'Keter';const nombreTikun=KABBALAH[nn]||'Tiferet';const energyTikun=KABBALAH[energy]||'Yesod';
  const tiempo=document.getElementById('radio-time').value;const lugar=document.getElementById('radio-place').value.trim();

  // Show numerology numbers
  numsEl.innerHTML=`
    <div class="radio-num"><div class="radio-num-label">Número de Vida</div><div class="radio-num-val">${lp}</div><div class="radio-num-desc">${tikun}</div></div>
    <div class="radio-num"><div class="radio-num-label">Número del Nombre</div><div class="radio-num-val">${nn}</div><div class="radio-num-desc">${nombreTikun}</div></div>
    <div class="radio-num"><div class="radio-num-label">Energía Actual</div><div class="radio-num-val">${energy}</div><div class="radio-num-desc">${energyTikun}</div></div>`;
  numsEl.style.display='grid';

  try{
    const reading=await callAI('Radiografia',
      `RADIOGRAFÍA CABALÍSTICA para ${nombre}. Datos: Número de Vida ${lp} (${tikun}), Número del Nombre ${nn} (${nombreTikun}), Energía Actual ${energy} (${energyTikun}). Fecha: ${birth}${tiempo?', Hora: '+tiempo:''}${lugar?', Lugar: '+lugar:''}.
      
Genera análisis estructurado con estas secciones exactas entre etiquetas:
[IDENTIDAD]2-3 líneas sobre quién es esta alma en esencia[/IDENTIDAD]
[ENERGIA]2-3 líneas sobre su energía actual y ciclo de vida[/ENERGIA]
[BLOQUEO]2-3 líneas sobre el principal patrón limitante a trabajar[/BLOQUEO]
[POTENCIAL]2-3 líneas sobre sus dones y potencial máximo[/POTENCIAL]
[CONSEJO]1 acción concreta y poderosa para los próximos 7 días[/CONSEJO]
[TEXTO]lectura completa e integradora de 4-5 párrafos[/TEXTO]
[ESCENA1]texto emocional corto · sombra[/ESCENA1]
[ESCENA2]texto emocional corto · luz[/ESCENA2]
[ESCENA3]texto emocional corto · transformación[/ESCENA3]
[ESCENA4]texto emocional corto · propósito[/ESCENA4]
[ESCENA5]texto emocional corto · acción[/ESCENA5]`);

    // Parse structured response
    function extract(tag){const m=reading.match(new RegExp(`\\[${tag}\\](.*?)\\[\\/${tag}\\]`,'s'));return m?m[1].trim():'';}
    const id=extract('IDENTIDAD');const en=extract('ENERGIA');const bl=extract('BLOQUEO');const po=extract('POTENCIAL');const co=extract('CONSEJO');const tx=extract('TEXTO');

    if(id||en||bl){
      fieldsEl.innerHTML=`
        ${id?`<div class="radio-field"><div class="radio-field-label">✨ Identidad</div><div class="radio-field-val">${id}</div></div>`:''}
        ${en?`<div class="radio-field"><div class="radio-field-label">⚡ Energía Actual</div><div class="radio-field-val">${en}</div></div>`:''}
        ${bl?`<div class="radio-field"><div class="radio-field-label">🔓 Bloqueo a Soltar</div><div class="radio-field-val">${bl}</div></div>`:''}
        ${po?`<div class="radio-field"><div class="radio-field-label">🌟 Tu Potencial</div><div class="radio-field-val">${po}</div></div>`:''}
        ${co?`<div class="radio-field" style="grid-column:1/-1"><div class="radio-field-label">🎯 Consejo Sagrado</div><div class="radio-field-val">${co}</div></div>`:''}`;
      fieldsEl.style.display='grid';
    }

    const cleanText=tx||reading.replace(/\[[A-Z0-9]+\].*?\[\/[A-Z0-9]+\]/gs,'').trim();
    result.innerHTML=cleanText;result.classList.add('show');

    // Render scenes
    const scenesTags=['ESCENA1','ESCENA2','ESCENA3','ESCENA4','ESCENA5'];const kwMap={ESCENA1:'sombra',ESCENA2:'luz',ESCENA3:'transformación',ESCENA4:'propósito',ESCENA5:'acción'};
    const scenesHtml=scenesTags.map(tag=>{const txt=extract(tag);if(!txt)return'';const[text,kw]=txt.split('·').map(s=>s.trim());return`<div class="scene-card"><div class="scene-kw">${kw||kwMap[tag]}</div><div class="scene-txt">${text}</div></div>`;}).join('');
    if(scenesHtml){scenesEl.innerHTML=scenesHtml;scenesEl.style.display='flex';}
    if(btn){btn.disabled=false;btn.textContent='✡️ Nueva Radiografía';}
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='✡️ Generar mi Radiografía';}}
  finally{loader.classList.remove('show');}
}

// ── INIT ──
window.addEventListener('DOMContentLoaded',()=>{
  initParticles();
  document.getElementById('btn-start').addEventListener('click',()=>{
    if(loadUser()){if(!checkTrial()){showScreen('s-expired');return;}enterApp();}
    else{showScreen('s-auth');showAuthTab('login');}
  });
});
