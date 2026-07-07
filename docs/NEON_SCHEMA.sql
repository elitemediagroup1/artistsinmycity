-- ArtistsInMyCity Neon Postgres schema placeholder
-- Run in Neon SQL editor after replacing/expanding for production policies.

create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,
  email text unique not null,
  role text not null check (role in ('artist','fan','creator','admin')),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists artist_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  slug text unique not null,
  artist_name text not null,
  city text,
  category text,
  bio text,
  hero_image_url text,
  theme text default 'museum-dark',
  booking_url text,
  contact_email text,
  published boolean not null default false,
  seo_title text,
  seo_description text,
  aeo_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists media_assets (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  type text not null check (type in ('image','video','audio','document','merch','ticket')),
  title text,
  url text not null,
  alt_text text,
  sort_order int default 0,
  created_at timestamptz not null default now()
);

create table if not exists follows (
  fan_user_id uuid references users(id) on delete cascade,
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (fan_user_id, artist_profile_id)
);

create table if not exists favorites (
  fan_user_id uuid references users(id) on delete cascade,
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (fan_user_id, artist_profile_id)
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  fan_user_id uuid references users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender_user_id uuid references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists merch_items (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  stripe_price_id text,
  title text not null,
  description text,
  price_cents int not null default 0,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists ticketed_events (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  stripe_price_id text,
  title text not null,
  city text,
  venue text,
  starts_at timestamptz,
  price_cents int default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists page_versions (
  id uuid primary key default gen_random_uuid(),
  artist_profile_id uuid references artist_profiles(id) on delete cascade,
  github_commit_sha text,
  netlify_deploy_id text,
  snapshot_json jsonb not null default '{}'::jsonb,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists loop_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  platform_id text not null default 'artistsinmycity',
  user_id uuid references users(id),
  artist_profile_id uuid references artist_profiles(id),
  payload jsonb not null default '{}'::jsonb,
  delivered_to_loop boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_artist_profiles_city on artist_profiles(city);
create index if not exists idx_artist_profiles_category on artist_profiles(category);
create index if not exists idx_loop_events_type on loop_events(event_type);
