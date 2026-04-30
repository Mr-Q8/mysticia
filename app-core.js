// ═══ ALMA IA · CORE (auth, utils, particles) ═══
const TRIAL_DAYS=14;
const CARDS=[
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
const WEATHER_CODES={0:'☀️ Despejado',1:'🌤️ Mayormente despejado',2:'⛅ Parcialmente nublado',3:'☁️ Nublado',45:'🌫️ Niebla',48:'🌫️ Niebla',51:'🌦️ Llovizna',53:'🌦️ Llovizna',55:'🌧️ Llovizna intensa',61:'🌧️ Lluvia leve',63:'🌧️ Lluvia',65:'🌧️ Lluvia intensa',71:'🌨️ Nieve leve',73:'🌨️ Nieve',75:'❄️ Nieve intensa',80:'🌦️ Chubascos',81:'🌧️ Chubascos',82:'⛈️ Chubascos fuertes',95:'⛈️ Tormenta',99:'⛈️ Tormenta con granizo'};

// ── UTILS ──
function today(){return new Date().toISOString().split('T')[0];}
function ls(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsSet(k,v){try{localStorage.setItem(k,v);}catch(e){}}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k));}catch(e){return null;}}
function lsSave(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function getMoonPhase(){
  const known=new Date('2000-01-06');const now=new Date();
  const days=Math.floor((now-known)/864e5);const cycle=29.53;
  const phase=((days%cycle)+cycle)%cycle;
  if(phase<1.85)return'🌑 Nueva';if(phase<7.38)return'🌒 Creciente';
  if(phase<11.07)return'🌓 Cuarto C.';if(phase<14.77)return'🌔 Gibosa C.';
  if(phase<16.62)return'🌕 Llena';if(phase<22.15)return'🌖 Gibosa M.';
  if(phase<25.84)return'🌗 Cuarto M.';return'🌘 Menguante';
}

// ── SUPABASE VIA BACKEND ──
async function supaAuth(action,payload){
  try{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...payload})});return await r.json();}
  catch(e){return{error:'Sin conexión. Modo local activo.'};}
}

// ── PARTICLES ──
function initParticles(){
  const c=document.getElementById('cosmos');if(!c)return;
  const ctx=c.getContext('2d');let W,H,stars=[],shooters=[];
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight;}
  resize();window.addEventListener('resize',resize);
  for(let i=0;i<200;i++)stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.4+0.2,a:Math.random(),da:Math.random()*0.007+0.002,color:Math.random()>.8?'#ffd700':Math.random()>.6?'#bb88ff':'#fff'});
  function addShooter(){shooters.push({x:Math.random()*W,y:Math.random()*H*.4,vx:Math.random()*7+4,vy:Math.random()*3+2,a:1,tail:[]});}
  function draw(){
    ctx.clearRect(0,0,W,H);
    const g=ctx.createRadialGradient(W*.2,H*.3,0,W*.2,H*.3,W*.4);g.addColorStop(0,'rgba(80,0,160,0.07)');g.addColorStop(1,'transparent');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    stars.forEach(s=>{s.a+=s.da;if(s.a>1||s.a<.1)s.da=-s.da;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle=s.color;ctx.globalAlpha=s.a;ctx.fill();});ctx.globalAlpha=1;
    shooters.forEach((s,i)=>{s.tail.push({x:s.x,y:s.y});if(s.tail.length>18)s.tail.shift();s.x+=s.vx;s.y+=s.vy;s.a-=.028;s.tail.forEach((p,j)=>{ctx.beginPath();ctx.arc(p.x,p.y,.9,0,Math.PI*2);ctx.fillStyle='#fff';ctx.globalAlpha=s.a*(j/s.tail.length)*.5;ctx.fill();});ctx.globalAlpha=1;if(s.a<=0||s.x>W)shooters.splice(i,1);});
    requestAnimationFrame(draw);
  }
  draw();setInterval(addShooter,3800);
}

// ── SCREEN ──
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');window.scrollTo(0,0);}

// ── ASTROLOGY ──
function getSign(d,m){if((m==3&&d>=21)||(m==4&&d<=19))return'Aries';if((m==4&&d>=20)||(m==5&&d<=20))return'Tauro';if((m==5&&d>=21)||(m==6&&d<=20))return'Géminis';if((m==6&&d>=21)||(m==7&&d<=22))return'Cáncer';if((m==7&&d>=23)||(m==8&&d<=22))return'Leo';if((m==8&&d>=23)||(m==9&&d<=22))return'Virgo';if((m==9&&d>=23)||(m==10&&d<=22))return'Libra';if((m==10&&d>=23)||(m==11&&d<=21))return'Escorpio';if((m==11&&d>=22)||(m==12&&d<=21))return'Sagitario';if((m==12&&d>=22)||(m==1&&d<=19))return'Capricornio';if((m==1&&d>=20)||(m==2&&d<=18))return'Acuario';return'Piscis';}
function getMoon(bd){const sn=['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];const days=Math.floor((new Date(bd)-new Date('2000-01-06'))/864e5);return sn[Math.floor(((days%27.32)+27.32)%27.32/(27.32/12))];}
function getRising(bd,bt){if(!bt)return null;const sn=['Aries','Tauro','Géminis','Cáncer','Leo','Virgo','Libra','Escorpio','Sagitario','Capricornio','Acuario','Piscis'];const[h,m]=bt.split(':').map(Number);return sn[Math.floor((h*60+(m||0))/120)%12];}
function getLifePath(bd){let n=bd.replace(/-/g,'').split('').reduce((a,d)=>a+parseInt(d),0);while(n>9&&n!==11&&n!==22&&n!==33)n=String(n).split('').reduce((a,d)=>a+parseInt(d),0);return n;}
function getElement(s){if(['Aries','Leo','Sagitario'].includes(s))return'🔥 Fuego';if(['Tauro','Virgo','Capricornio'].includes(s))return'🌍 Tierra';if(['Géminis','Libra','Acuario'].includes(s))return'💨 Aire';return'💧 Agua';}
function calcNombreNum(nombre){const clean=nombre.toUpperCase().replace(/[^A-Z]/g,'');let sum=clean.split('').reduce((a,c)=>a+(c.charCodeAt(0)-64),0);while(sum>9&&sum!==11&&sum!==22&&sum!==33)sum=String(sum).split('').reduce((a,d)=>a+parseInt(d),0);return sum;}

// ── AUTH ──
let currentUser=null;
function loadUser(){const u=lsGet('alma_user');if(u){currentUser=u;return true;}return false;}
function getDaysLeft(){if(!currentUser)return 0;return Math.max(0,TRIAL_DAYS-Math.floor((new Date()-new Date(currentUser.registrationDate))/864e5));}
function checkTrial(){return getDaysLeft()>0;}

async function login(email,pass){
  const r=await supaAuth('login',{email,password:pass});
  if(r.user){currentUser=r.user;lsSave('alma_user',r.user);return null;}
  const accounts=lsGet('alma_accounts')||{};const u=accounts[email.toLowerCase()];
  if(!u)return r.error||'Usuario no encontrado.';
  if(u.password!==btoa(pass))return'Contraseña incorrecta.';
  currentUser=u;lsSave('alma_user',u);return null;
}
async function register(data){
  const[y,m,d]=data.birthDate.split('-').map(Number);const sign=getSign(d,m);
  const r=await supaAuth('register',{...data,sign});
  if(r.user){currentUser=r.user;lsSave('alma_user',r.user);const acc=lsGet('alma_accounts')||{};acc[r.user.email]={...r.user,password:btoa(data.password)};lsSave('alma_accounts',acc);return null;}
  if(r.error&&!r.error.includes('Sin conexión'))return r.error;
  const acc=lsGet('alma_accounts')||{};const key=data.email.toLowerCase();
  if(acc[key])return'Email ya registrado.';
  const user={name:data.name,email:key,password:btoa(data.password),birthDate:data.birthDate,birthTime:data.birthTime||'',birthCity:data.birthCity||'',sign,registrationDate:new Date().toISOString()};
  acc[key]=user;lsSave('alma_accounts',acc);currentUser=user;lsSave('alma_user',user);return null;
}
function logout(){currentUser=null;localStorage.removeItem('alma_user');showScreen('s-auth');showAuthTab('login');}

// ── TOAST ──
function toast(msg){let t=document.getElementById('toast-el');if(!t){t=document.createElement('div');t.id='toast-el';t.className='toast';document.body.appendChild(t);}t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),3500);}

// ── AI CALL ──
async function callAI(type,prompt){
  const profile=currentUser?{name:currentUser.name,birthDate:currentUser.birthDate,sign:currentUser.sign,birthCity:currentUser.birthCity,birthTime:currentUser.birthTime}:null;
  const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,prompt,userProfile:profile})});
  if(!r.ok)throw new Error('Error de red');
  const data=await r.json();return data.response||'Sin respuesta.';
}

// ── READING CACHE ──
async function getReading(tipo){
  const k=`alma_${tipo}_${today()}`;const c=lsGet(k);if(c)return c;
  if(currentUser?.id){const r=await supaAuth('get_reading',{userId:currentUser.id,fecha:today(),tipo});if(r.reading){lsSave(k,r.reading);return r.reading;}}
  return null;
}
async function saveReading(tipo,contenido){
  lsSave(`alma_${tipo}_${today()}`,contenido);
  if(currentUser?.id)await supaAuth('save_reading',{userId:currentUser.id,fecha:today(),tipo,contenido});
}

// ── AUTH UI ──
function showAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
  document.getElementById('auth-tab-'+tab).classList.add('active');
  document.getElementById('login-form').style.display=tab==='login'?'block':'none';
  document.getElementById('register-form').style.display=tab==='register'?'block':'none';
}
async function doLogin(){
  const email=document.getElementById('login-email').value.trim();const pass=document.getElementById('login-pass').value;
  const err=document.getElementById('login-error');err.style.display='none';
  if(!email||!pass){err.textContent='Completa todos los campos.';err.style.display='block';return;}
  const btn=document.querySelector('#login-form .btn-main');if(btn){btn.disabled=true;btn.textContent='Accediendo...';}
  const e=await login(email,pass);if(btn){btn.disabled=false;btn.textContent='ENTRAR AL ORÁCULO';}
  if(e){err.textContent=e;err.style.display='block';return;}
  if(!checkTrial()){showScreen('s-expired');return;}enterApp();
}
async function doRegister(){
  const name=document.getElementById('reg-name').value.trim();const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value;const birthDate=document.getElementById('reg-birth').value;
  const birthTime=document.getElementById('reg-time').value;const birthCity=document.getElementById('reg-city').value.trim();
  const err=document.getElementById('register-error');err.style.display='none';
  if(!name||!email||!pass||!birthDate){err.textContent='Completa los campos requeridos.';err.style.display='block';return;}
  if(pass.length<6){err.textContent='Contraseña mínimo 6 caracteres.';err.style.display='block';return;}
  const btn=document.querySelector('#register-form .btn-main');if(btn){btn.disabled=true;btn.textContent='Creando tu perfil...';}
  const e=await register({name,email,password:pass,birthDate,birthTime,birthCity});
  if(btn){btn.disabled=false;btn.textContent='INICIAR MI DESPERTAR';}
  if(e){err.textContent=e;err.style.display='block';return;}enterApp();
}
function enterApp(){
  const h=document.getElementById('user-name-header');if(h)h.textContent=`✨ ${currentUser.name}`;
  const t=document.getElementById('trial-info');if(t)t.textContent=`🌟 Acceso Astral: ${getDaysLeft()} días restantes`;
  const sb=document.getElementById('user-sign-badge');if(sb)sb.innerHTML=`<span class="sign-badge-symbol">${SIGNS[currentUser.sign]||'⭐'}</span><span class="sign-badge-name">${currentUser.sign}</span>`;
  const mp=document.getElementById('moon-phase-wdg');if(mp)mp.textContent=getMoonPhase();
  const hs=document.getElementById('horo-sign');if(hs)for(let i=0;i<hs.options.length;i++){if(hs.options[i].value===currentUser.sign){hs.selectedIndex=i;break;}}
  // Pre-fill radiografía with user data
  const rn=document.getElementById('radio-name');if(rn&&currentUser.name)rn.value=currentUser.name;
  const rb=document.getElementById('radio-birth');if(rb&&currentUser.birthDate)rb.value=currentUser.birthDate;
  const rt=document.getElementById('radio-time');if(rt&&currentUser.birthTime)rt.value=currentUser.birthTime;
  const rp=document.getElementById('radio-place');if(rp&&currentUser.birthCity)rp.value=currentUser.birthCity;
  showScreen('s-main');
  loadWeather();
  loadHoroscopeWidget();
  switchTab('tarot');
}
