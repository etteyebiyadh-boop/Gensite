-- Run this in Supabase SQL editor to create the sites table.
-- Enable UUID extension if not already:
-- create extension if not exists "uuid-ossp";

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null default 'My site',
  template_id text not null default 'simple__0',
  content jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_html text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.sites enable row level security;

-- Drop existing policies if they exist (to cleanly apply new ones)
drop policy if exists "Allow public read for published sites" on public.sites;
drop policy if exists "Allow all for service role (insert, update)" on public.sites;
drop policy if exists "Allow owners to manage their sites" on public.sites;

create policy "Allow public read for published sites"
  on public.sites for select
  using (status = 'published');

create policy "Allow owners to manage their sites"
  on public.sites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Storage bucket for site images (optional; create in Supabase Dashboard > Storage)
-- Bucket name: site-assets, public
