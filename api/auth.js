// api/auth.js - Auth con Supabase (usa service_role para bypass RLS en servidor)
const SUPA_URL = process.env.SUPABASE_URL || 'https://onslntmfignxllxmcsyk.supabase.co';
const SUPA_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uc2xudG1maWdueGxseG1jc3lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzUxMDc2MCwiZXhwIjoyMDkzMDg2NzYwfQ.HNKllt_hLRCG9z9eXo7PiNp_VP9xoRx8PRRJUydtdgc';

async function supa(path, method='GET', body=null) {
  const opts = {
    method,
    headers: {
      'apikey': SUPA_KEY,
      'Authorization': `Bearer ${SUPA_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': method==='POST' ? 'return=representation' : ''
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${SUPA_URL}/rest/v1${path}`, opts);
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { action, ...payload } = req.body;

  // ── REGISTER ──────────────────────────────────
  if (action === 'register') {
    const { email, password, name, birthDate, birthTime, birthCity, sign } = payload;
    const passHash = Buffer.from(password).toString('base64');

    // Verificar si ya existe
    const check = await supa(`/usuarios?email=eq.${encodeURIComponent(email)}&select=id`);
    if (check.ok && check.data.length > 0) {
      return res.status(409).json({ error: 'Este email ya está registrado.' });
    }

    const insert = await supa('/usuarios', 'POST', {
      email: email.toLowerCase(),
      password_hash: passHash,
      name, birth_date: birthDate,
      birth_time: birthTime || null,
      birth_city: birthCity || null,
      sign
    });

    if (!insert.ok) {
      return res.status(500).json({ error: 'Error al crear el usuario.' });
    }

    const user = insert.data[0];
    return res.status(200).json({
      user: {
        id: user.id, email: user.email, name: user.name,
        birthDate: user.birth_date, birthTime: user.birth_time,
        birthCity: user.birth_city, sign: user.sign,
        registrationDate: user.registration_date
      }
    });
  }

  // ── LOGIN ─────────────────────────────────────
  if (action === 'login') {
    const { email, password } = payload;
    const passHash = Buffer.from(password).toString('base64');
    const result = await supa(`/usuarios?email=eq.${encodeURIComponent(email.toLowerCase())}&select=*`);

    if (!result.ok || result.data.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const user = result.data[0];
    if (user.password_hash !== passHash) {
      return res.status(401).json({ error: 'Contraseña incorrecta.' });
    }

    return res.status(200).json({
      user: {
        id: user.id, email: user.email, name: user.name,
        birthDate: user.birth_date, birthTime: user.birth_time,
        birthCity: user.birth_city, sign: user.sign,
        registrationDate: user.registration_date
      }
    });
  }

  // ── SAVE READING ──────────────────────────────
  if (action === 'save_reading') {
    const { userId, fecha, tipo, contenido } = payload;
    const upsert = await supa('/lecturas_diarias', 'POST', {
      user_id: userId, fecha, tipo, contenido
    });
    return res.status(upsert.ok ? 200 : 500).json({ ok: upsert.ok });
  }

  // ── GET READING ───────────────────────────────
  if (action === 'get_reading') {
    const { userId, fecha, tipo } = payload;
    const result = await supa(`/lecturas_diarias?user_id=eq.${userId}&fecha=eq.${fecha}&tipo=eq.${tipo}&select=contenido`);
    if (result.ok && result.data.length > 0) {
      return res.status(200).json({ reading: result.data[0].contenido });
    }
    return res.status(200).json({ reading: null });
  }

  // ── SAVE NATAL ────────────────────────────────
  if (action === 'save_natal') {
    const { userId, reading, sunSign, moonSign, risingSign, lifePath, tikun } = payload;
    const upsert = await supa('/carta_natal', 'POST', {
      user_id: userId, reading,
      sun_sign: sunSign, moon_sign: moonSign,
      rising_sign: risingSign, life_path: lifePath, tikun
    });
    // Si ya existe, hacer PATCH
    if (!upsert.ok) {
      await supa(`/carta_natal?user_id=eq.${userId}`, 'PATCH', { reading });
    }
    return res.status(200).json({ ok: true });
  }

  // ── GET NATAL ─────────────────────────────────
  if (action === 'get_natal') {
    const { userId } = payload;
    const result = await supa(`/carta_natal?user_id=eq.${userId}&select=*`);
    if (result.ok && result.data.length > 0) {
      return res.status(200).json({ natal: result.data[0] });
    }
    return res.status(200).json({ natal: null });
  }

  return res.status(400).json({ error: 'Acción no reconocida.' });
}
