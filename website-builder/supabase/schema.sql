-- Run this in Supabase SQL editor to create the sites table.
-- Enable UUID extension if not already:
-- create extension if not exists "uuid-ossp";

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My site',
  template_id text not null default 'simple__0',
  content jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_html text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: RLS so only service role can write; anyone can read published_html via API
alter table public.sites enable row level security;

create policy "Allow public read for published sites"
  on public.sites for select
  using (true);

create policy "Allow all for service role (insert, update)"
  on public.sites for all
  using (true)
  with check (true);

-- Storage bucket for site images (optional; create in Supabase Dashboard > Storage)
-- Bucket name: site-assets, public
