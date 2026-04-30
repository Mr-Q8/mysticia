-- ╔══════════════════════════════════════╗
-- ║   ALMA IA — Schema Supabase          ║
-- ║   Ejecutar en: Supabase > SQL Editor ║
-- ╚══════════════════════════════════════╝

-- Extensión UUID
create extension if not exists "uuid-ossp";

-- ─── TABLA: usuarios ────────────────────────────
create table if not exists public.usuarios (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  password_hash text not null,
  name          text not null,
  birth_date    date not null,
  birth_time    text,
  birth_city    text,
  sign          text not null,
  registration_date timestamptz default now(),
  created_at    timestamptz default now()
);

-- ─── TABLA: carta_natal ─────────────────────────
create table if not exists public.carta_natal (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.usuarios(id) on delete cascade,
  reading     text not null,
  sun_sign    text,
  moon_sign   text,
  rising_sign text,
  life_path   int,
  tikun       text,
  created_at  timestamptz default now(),
  unique(user_id)
);

-- ─── TABLA: lecturas_diarias ────────────────────
create table if not exists public.lecturas_diarias (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.usuarios(id) on delete cascade,
  fecha       date not null default current_date,
  tipo        text not null, -- 'tarot' | 'sueno' | 'horoscopo'
  contenido   jsonb not null default '{}',
  created_at  timestamptz default now(),
  unique(user_id, fecha, tipo)
);

-- ─── RLS (Row Level Security) ───────────────────
alter table public.usuarios enable row level security;
alter table public.carta_natal enable row level security;
alter table public.lecturas_diarias enable row level security;

-- Políticas abiertas para la anon key (el app maneja auth propio)
create policy "allow_all_usuarios" on public.usuarios for all using (true) with check (true);
create policy "allow_all_natal" on public.carta_natal for all using (true) with check (true);
create policy "allow_all_lecturas" on public.lecturas_diarias for all using (true) with check (true);

-- ─── ÍNDICES ────────────────────────────────────
create index if not exists idx_lecturas_user_fecha on public.lecturas_diarias(user_id, fecha, tipo);
create index if not exists idx_usuarios_email on public.usuarios(email);
