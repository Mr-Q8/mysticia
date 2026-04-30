// ALMA IA - App con Supabase sync
const TRIAL_DAYS = 14;
const CARDS = [
  {name:'El Loco',file:'tarot_0_fool_1777262262513.png'},
  {name:'El Mago',file:'tarot_1_magician_1777262277403.png'},
  {name:'La Sacerdotisa',file:'tarot_2_high_priestess_1777262293152.png'},
  {name:'La Emperatriz',file:'tarot_3_empress_1777262342839.png'},
  {name:'El Emperador',file:'tarot_4_emperor_1777262356267.png'},
  {name:'El Hierofante',file:'tarot_5_hierophant_1777262368723.png'},
  {name:'Los Amantes',file:'tarot_6_lovers_1777262379590.png'},
  {name:'El Carro',file:'tarot_7_chariot_1777262393083.png'},
  {name:'La Fuerza',file:'tarot_8_strength_1777262408007.png'},
  {name:'El Ermitaño',file:'tarot_9_hermit_1777262423381.png'},
  {name:'La Rueda',file:'tarot_10_wheel_1777262437123.png'},
  {name:'La Justicia',file:'tarot_11_justice_1777262465572.png'},
  {name:'El Colgado',file:'tarot_12_hanged_man_1777262477701.png'},
  {name:'La Muerte',file:'tarot_13_death_1777262493171.png'},
  {name:'La Templanza',file:'tarot_14_temperance_1777262506968.png'},
  {name:'El Sol',file:'tarot_the_sun_1777262078595.png'}
];
const SIGNS={Aries:'♈',Tauro:'♉','Géminis':'♊','Cáncer':'♋',Leo:'♌',Virgo:'♍',Libra:'♎',Escorpio:'♏',Sagitario:'♐',Capricornio:'♑',Acuario:'♒',Piscis:'♓'};
const KABBALAH={1:'Keter - Corona',2:'Chokhmah - Sabiduría',3:'Binah - Comprensión',4:'Chesed - Amor',5:'Gevurah - Fuerza',6:'Tiferet - Belleza',7:'Netzach - Victoria',8:'Hod - Esplendor',9:'Yesod - Fundamento',11:'Camino Maestro 11',22:'Constructor Maestro 22',33:'Maestro Sanador 33'};

// ── UTILS ──
function today(){return new Date().toISOString().split('T')[0];}
function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
function lsSave(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}

// ── SUPABASE VIA BACKEND ──
async function supaAuth(action, payload){
  try{
    const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload})});
    return await r.json();
  }catch(e){return {error:'Sin conexión. Usando modo local.'};}
}

// ── PARTICLES ──
function initParticles(){
  const c=document.getElementById('cosmos');
  if(!c)return;
  const ctx=c.getContext('2d');
  let W,H,stars=[],shooters=[];
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  for(let i=0;i<200;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+0.2,a:Math.random(),da:Math.random()*0.007+0.002,color:Math.random()>.8?'#ffd700':Math.random()>.6?'#bb88ff':'#fff'});
  function addShooter(){shooters.push({x:Math.random()*W,y:Math.random()*H*.4,vx:Math.random()*7+4,vy:Math.random()*3+2,a:1,tail:[]});}
  function draw(){
    ctx.clearRect(0,0,W,H);
    const g1=ctx.createRadialGradient(W*.2,H*.3,0,W*.2,H*.3,W*.4);
    g1.addColorStop(0,'rgba(80,0,160,0.07)');g1.addColorStop(1,'transparent');
    ctx.fillStyle=g1;ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{s.a+=s.da;if(s.a>1||s.a<.1)s.da=-s.da;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=s.color;ctx.globalAlpha=s.a;ctx.fill();});
    ctx.globalAlpha=1;
    shooters.forEach((s,i)=>{s.tail.push({x:s.x,y:s.y});if(s.tail.length>18)s.tail.shift();s.x+=s.vx;s.y+=s.vy;s.a-=.028;s.tail.forEach((p,j)=>{ctx.beginPath();ctx.arc(p.x,p.y,.9,0,Math.PI*2);ctx.fillStyle='#fff';ctx.globalAlpha=s.a*(j/s.tail.length)*.5;ctx.fill();});ctx.globalAlpha=1;if(s.a<=0||s.x>W)shooters.splice(i,1);});
    requestAnimationFrame(draw);
  }
  draw();setInterval(addShooter,3800);
}

// ── SCREEN ──
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);}

// ── ASTROLOGY ──
function getSign(d,m){if((m==3&&d>=21)||(m==4&&d<=19))return'Aries';if((m==4&&d>=20)||(m==5&&d<=20))return'Tauro';if((m==5&&d>=21)||(m==6&&d<=20))return'Géminis';if((m==6&&d>=21)||(m==7&&d<=22))return'Cáncer';if((m==7&&d>=23)||(m==8&&d<=22))return'Leo';if((m==8&&d>=23)||(m==9&&d<=22))return'Virgo';if((m==9&&d>=23)||(m==10&&d<=22))return'Libra';if((m==10&&d>=23)||(m==11&&d<=21))return'Escorpio';if((m==11&&d>=22)||(m==12&&d<=21))return'Sagitario';if((m==12&&d>=22)||(m==1&&d<=19))return'Capricornio';if((m==1&&d>=20)||(m==2&&d<=18))return'Acuario';return'Piscis';}
function getMoon(bd){const sn=['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];const ref=new Date('2000-01-06');const days=Math.floor((new Date(bd)-ref)/864e5);return sn[Math.floor(((days%27.32)+27.32)%27.32/(27.32/12))];}
function getRising(bd,bt){if(!bt)return null;const sn=['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];const[h,m]=bt.split(':').map(Number);return sn[Math.floor((h*60+(m||0))/120)%12];}
function getLifePath(bd){let n=bd.replace(/-/g,'').split('').reduce((a,d)=>a+parseInt(d),0);while(n>9&&n!==11&&n!==22&&n!==33)n=String(n).split('').reduce((a,d)=>a+parseInt(d),0);return n;}
function getElement(s){if(['Aries','Leo','Sagitario'].includes(s))return'🔥 Fuego';if(['Tauro','Virgo','Capricornio'].includes(s))return'🌍 Tierra';if(['Géminis','Libra','Acuario'].includes(s))return'💨 Aire';return'💧 Agua';}

// ── AUTH ──
let currentUser=null;

function loadUser(){const u=lsGet('alma_user');if(u){currentUser=u;return true;}return false;}
function getDaysLeft(){if(!currentUser)return 0;const elapsed=Math.floor((new Date()-new Date(currentUser.registrationDate))/864e5);return Math.max(0,TRIAL_DAYS-elapsed);}
function checkTrial(){return getDaysLeft()>0;}

async function login(email,pass){
  // Intentar Supabase primero
  const r=await supaAuth('login',{email,password:pass});
  if(r.user){currentUser=r.user;lsSave('alma_user',r.user);return null;}
  // Fallback localStorage
  const accounts=lsGet('alma_accounts')||{};
  const u=accounts[email.toLowerCase()];
  if(!u)return r.error||'Usuario no encontrado.';
  if(u.password!==btoa(pass))return'Contraseña incorrecta.';
  currentUser=u;lsSave('alma_user',u);return null;
}

async function register(data){
  const[y,m,d]=data.birthDate.split('-').map(Number);
  const sign=getSign(d,m);
  // Intentar Supabase
  const r=await supaAuth('register',{...data,sign});
  if(r.user){currentUser=r.user;lsSave('alma_user',r.user);// también guardar local
    const accounts=lsGet('alma_accounts')||{};accounts[r.user.email]={...r.user,password:btoa(data.password)};lsSave('alma_accounts',accounts);return null;}
  if(r.error&&!r.error.includes('Sin conexión'))return r.error;
  // Fallback localStorage
  const accounts=lsGet('alma_accounts')||{};
  const key=data.email.toLowerCase();
  if(accounts[key])return'Este email ya está registrado.';
  const user={name:data.name,email:key,password:btoa(data.password),birthDate:data.birthDate,birthTime:data.birthTime||'',birthCity:data.birthCity||'',sign,registrationDate:new Date().toISOString()};
  accounts[key]=user;lsSave('alma_accounts',accounts);currentUser=user;lsSave('alma_user',user);return null;
}

function logout(){currentUser=null;localStorage.removeItem('alma_user');showScreen('s-auth');showAuthTab('login');}

// ── TOAST ──
function toast(msg){let t=document.getElementById('toast-el');if(!t){t=document.createElement('div');t.id='toast-el';t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}

// ── AI CALL ──
async function callAI(type,prompt){
  const profile=currentUser?{name:currentUser.name,birthDate:currentUser.birthDate,sign:currentUser.sign,birthCity:currentUser.birthCity,birthTime:currentUser.birthTime}:null;
  const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,prompt,userProfile:profile})});
  if(!r.ok)throw new Error('Error de red');
  const data=await r.json();return data.response||'Sin respuesta. Intenta de nuevo.';
}

// ── READING CACHE (local + supabase) ──
async function getReading(tipo){
  const localKey=`alma_${tipo}_${today()}`;
  const cached=lsGet(localKey);if(cached)return cached;
  if(currentUser?.id){
    const r=await supaAuth('get_reading',{userId:currentUser.id,fecha:today(),tipo});
    if(r.reading){lsSave(localKey,r.reading);return r.reading;}
  }
  return null;
}
async function saveReading(tipo,contenido){
  const localKey=`alma_${tipo}_${today()}`;
  lsSave(localKey,contenido);
  if(currentUser?.id)await supaAuth('save_reading',{userId:currentUser.id,fecha:today(),tipo,contenido});
}

// ── TAROT ──
async function initTarot(){
  const saved=await getReading('tarot');
  if(saved&&saved.file){
    document.getElementById('card-img').src=`tarot/${saved.file}`;
    document.getElementById('card-name').textContent=saved.name;
    if(saved.reading){const r=document.getElementById('tarot-result');r.innerHTML=saved.reading;r.classList.add('show');}
    const btn=document.getElementById('tarot-btn');if(btn)btn.textContent='✨ Tu carta del día ya fue revelada';
  }
}

async function drawTarotCard(){
  const existing=await getReading('tarot');
  if(existing&&existing.file){toast('⏳ Ya consultaste el Tarot hoy. Regresa mañana.');return;}
  const card=CARDS[Math.floor(Math.random()*CARDS.length)];
  const cardImg=document.getElementById('card-img');
  const cardName=document.getElementById('card-name');
  const loader=document.getElementById('tarot-loader');
  const result=document.getElementById('tarot-result');
  const btn=document.getElementById('tarot-btn');
  cardImg.src=`tarot/${card.file}`;cardName.textContent=card.name;
  if(btn){btn.disabled=true;btn.textContent='Interpretando...';}
  loader.classList.add('show');result.classList.remove('show');
  try{
    const reading=await callAI('Tarot',`He sacado la carta "${card.name}". Dame una lectura profunda y transformadora integrando Cábala y astrología. Habla directamente a mi alma.`);
    result.innerHTML=reading;result.classList.add('show');
    await saveReading('tarot',{...card,reading,date:today()});
    if(btn)btn.textContent='✨ Tu carta del día ya fue revelada';
  }catch(e){result.innerHTML='Error de conexión. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='🔮 Consultar el Tarot';}}
  finally{loader.classList.remove('show');}
}

// ── NATAL ──
async function initNatal(){
  const container=document.getElementById('natal-content');if(!container||!currentUser)return;
  const moon=getMoon(currentUser.birthDate);
  const rising=getRising(currentUser.birthDate,currentUser.birthTime);
  const lp=getLifePath(currentUser.birthDate);
  const tikun=KABBALAH[lp]||'Keter - Corona';
  const elem=getElement(currentUser.sign);
  container.innerHTML=`<div class="natal-grid">
    <div class="natal-item"><div class="natal-symbol">☀️</div><div class="natal-label">Sol</div><div class="natal-value">${currentUser.sign}</div></div>
    <div class="natal-item"><div class="natal-symbol">🌙</div><div class="natal-label">Luna</div><div class="natal-value">${moon}</div></div>
    <div class="natal-item"><div class="natal-symbol">⬆️</div><div class="natal-label">Ascendente</div><div class="natal-value">${rising||'Con hora'}</div></div>
    <div class="natal-item"><div class="natal-symbol">🔢</div><div class="natal-label">Camino de Vida</div><div class="natal-value">${lp}</div></div>
    <div class="natal-item"><div class="natal-symbol">🌊</div><div class="natal-label">Elemento</div><div class="natal-value">${elem}</div></div>
    <div class="natal-item"><div class="natal-symbol">✡️</div><div class="natal-label">Tikún</div><div class="natal-value" style="font-size:11px">${tikun}</div></div>
  </div>`;
  // Check if natal reading already exists
  let natalData=null;
  if(currentUser.id){const r=await supaAuth('get_natal',{userId:currentUser.id});if(r.natal)natalData=r.natal;}
  if(!natalData){const localNatal=ls('alma_natal_reading');if(localNatal)natalData={reading:localNatal};}
  if(natalData){const box=document.getElementById('natal-result');box.innerHTML=natalData.reading;box.classList.add('show');}
  else{const btn=document.getElementById('natal-btn');if(btn)btn.style.display='block';}
}

async function generateNatal(){
  const btn=document.getElementById('natal-btn');const loader=document.getElementById('natal-loader');const result=document.getElementById('natal-result');
  if(btn){btn.disabled=true;btn.textContent='Calculando tu mapa estelar...';}
  loader.classList.add('show');
  try{
    const moon=getMoon(currentUser.birthDate);const rising=getRising(currentUser.birthDate,currentUser.birthTime);const lp=getLifePath(currentUser.birthDate);const tikun=KABBALAH[lp]||'Keter';
    const reading=await callAI('Carta Natal',`Genera mi Carta Natal completa. Sol en ${currentUser.sign}, Luna en ${moon}${rising?', Ascendente en '+rising:''}, Camino de Vida ${lp} (${tikun}), Ciudad: ${currentUser.birthCity||'no especificada'}. Dame un análisis transformador integrando Astrología, Cábala (Zohar, Sefirot) y Psicología. Revela mi propósito de vida, sombras y dones del alma.`);
    result.innerHTML=reading;result.classList.add('show');
    lsSet('alma_natal_reading',reading);
    if(currentUser.id)await supaAuth('save_natal',{userId:currentUser.id,reading,sunSign:currentUser.sign,moonSign:moon,risingSign:rising,lifePath:lp,tikun});
    if(btn)btn.style.display='none';
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='⭐ Generar mi Carta Natal';}}
  finally{loader.classList.remove('show');}
}

// ── SUEÑOS ──
async function interpretDream(){
  const existing=await getReading('sueno');
  if(existing){toast('🌙 Ya interpretaste tu sueño hoy. Regresa mañana.');return;}
  const dreamText=document.getElementById('dream-text').value.trim();
  if(!dreamText||dreamText.length<10){toast('Describe tu sueño con más detalle 🌙');return;}
  const btn=document.getElementById('dream-btn');const loader=document.getElementById('dream-loader');const result=document.getElementById('dream-result');
  if(btn){btn.disabled=true;btn.textContent='Interpretando...';}
  loader.classList.add('show');result.classList.remove('show');
  try{
    const reading=await callAI('Sueños',`Mi sueño fue: "${dreamText}". Dame una interpretación profunda desde la Psicología Jungiana, Cábala (sueños como mensajes proféticos) y Astrología. ¿Qué revela sobre mi alma, miedos ocultos y camino de vida?`);
    result.innerHTML=reading;result.classList.add('show');
    await saveReading('sueno',{dream:dreamText,reading,date:today()});
    if(btn)btn.textContent='🌙 Sueño interpretado hoy';
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='🌙 Interpretar mi Sueño';}}
  finally{loader.classList.remove('show');}
}

// ── HORÓSCOPO ──
async function getHoroscope(){
  const sign=document.getElementById('horo-sign').value;
  const cacheKey=`horoscopo_${sign}`;
  const result=document.getElementById('horo-result');const loader=document.getElementById('horo-loader');const btn=document.getElementById('horo-btn');
  const cached=await getReading(cacheKey);
  if(cached){result.innerHTML=cached.reading||cached;result.classList.add('show');toast('📖 Mostrando tu horóscopo de hoy');return;}
  if(btn){btn.disabled=true;btn.textContent='Consultando las estrellas...';}
  loader.classList.add('show');result.classList.remove('show');
  try{
    const reading=await callAI('Horóscopo',`Genera el horóscopo diario completo para ${sign} hoy ${today()}. Incluye: energía del día, amor y relaciones, trabajo y finanzas, salud, número de la suerte, color del día, cristal recomendado. Integra posición de Venus, Marte, Júpiter y Saturno. Añade mensaje del Sefirot dominante hoy. Sé específico, poderoso y transformador.`);
    result.innerHTML=reading;result.classList.add('show');
    await saveReading(cacheKey,{reading,sign,date:today()});
    if(btn){btn.textContent='⭐ Horóscopo de hoy';btn.disabled=false;}
  }catch(e){result.innerHTML='Error. Intenta de nuevo.';result.classList.add('show');if(btn){btn.disabled=false;btn.textContent='⭐ Ver mi Horóscopo';}}
  finally{loader.classList.remove('show');}
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

// ── AUTH UI ──
function showAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('auth-tab-'+tab).classList.add('active');
  document.getElementById('login-form').style.display=tab==='login'?'block':'none';
  document.getElementById('register-form').style.display=tab==='register'?'block':'none';
}

async function doLogin(){
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-pass').value;
  const err=document.getElementById('login-error');err.style.display='none';
  if(!email||!pass){err.textContent='Completa todos los campos.';err.style.display='block';return;}
  const btn=document.querySelector('#login-form .btn-main');
  if(btn){btn.disabled=true;btn.textContent='Accediendo...';}
  const e=await login(email,pass);
  if(btn){btn.disabled=false;btn.textContent='ENTRAR AL ORÁCULO';}
  if(e){err.textContent=e;err.style.display='block';return;}
  if(!checkTrial()){showScreen('s-expired');return;}
  enterApp();
}

async function doRegister(){
  const name=document.getElementById('reg-name').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;
  const birthDate=document.getElementById('reg-birth').value;
  const birthTime=document.getElementById('reg-time').value;
  const birthCity=document.getElementById('reg-city').value.trim();
  const err=document.getElementById('register-error');err.style.display='none';
  if(!name||!email||!pass||!birthDate){err.textContent='Completa los campos requeridos.';err.style.display='block';return;}
  if(pass.length<6){err.textContent='Contraseña mínimo 6 caracteres.';err.style.display='block';return;}
  const btn=document.querySelector('#register-form .btn-main');
  if(btn){btn.disabled=true;btn.textContent='Creando tu perfil astral...';}
  const e=await register({name,email,password:pass,birthDate,birthTime,birthCity});
  if(btn){btn.disabled=false;btn.textContent='INICIAR MI DESPERTAR';}
  if(e){err.textContent=e;err.style.display='block';return;}
  enterApp();
}

function enterApp(){
  const h=document.getElementById('user-name-header');if(h)h.textContent=`✨ ${currentUser.name}`;
  const t=document.getElementById('trial-info');if(t)t.textContent=`🌟 Acceso Astral: ${getDaysLeft()} días restantes`;
  const sb=document.getElementById('user-sign-badge');if(sb)sb.innerHTML=`<span class="sign-badge-symbol">${SIGNS[currentUser.sign]||'⭐'}</span><span class="sign-badge-name">${currentUser.sign}</span>`;
  const hs=document.getElementById('horo-sign');
  if(hs)for(let i=0;i<hs.options.length;i++){if(hs.options[i].value===currentUser.sign){hs.selectedIndex=i;break;}}
  showScreen('s-main');switchTab('tarot');
}

// ── INIT ──
window.addEventListener('DOMContentLoaded',()=>{
  initParticles();
  document.getElementById('btn-start').addEventListener('click',()=>{
    if(loadUser()){if(!checkTrial()){showScreen('s-expired');return;}enterApp();}
    else{showScreen('s-auth');showAuthTab('login');}
  });
});
