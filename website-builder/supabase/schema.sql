-- Run this in Supabase SQL editor to create the SaaS tables.
-- Enable UUID extension if not already:
-- create extension if not exists "uuid-ossp";

-- ============================================
-- SAAS TABLES
-- ============================================

-- Pricing Plans
create table if not exists public.plans (
  id text primary key,
  name text not null,
  description text,
  price_monthly decimal not null default 0,
  price_yearly decimal not null default 0,
  site_limit integer not null default 1,
  published_site_limit integer not null default 0,
  storage_mb integer not null default 100,
  bandwidth_gb integer not null default 1,
  custom_domain boolean not null default false,
  analytics boolean not null default false,
  priority_support boolean not null default false,
  team_members integer not null default 1,
  published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Insert default plans
insert into public.plans (id, name, description, price_monthly, price_yearly, site_limit, published_site_limit, storage_mb, bandwidth_gb, custom_domain, analytics, priority_support, team_members, display_order) values
('free', 'Free', 'Perfect for trying out', 0, 0, 3, 1, 100, 1, false, false, false, 1, 1),
('starter', 'Starter', 'For personal websites', 9, 90, 10, 5, 500, 10, true, true, false, 1, 2),
('pro', 'Pro', 'For small businesses', 29, 290, 50, 25, 2000, 50, true, true, true, 5, 3),
('enterprise', 'Enterprise', 'For agencies', 99, 990, -1, -1, 10000, 500, true, true, true, -1, 4)
on conflict (id) do nothing;

-- User Subscriptions
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id text references public.plans(id) not null default 'free',
  status text not null default 'active' check (status in ('active', 'trialing', 'canceled', 'past_due', 'unpaid')),
  billing_cycle text not null default 'monthly' check (billing_cycle in ('monthly', 'yearly')),
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  stripe_subscription_id text,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

-- Site Usage Tracking
create table if not exists public.usage_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  site_id uuid references public.sites(id) on delete cascade,
  metric_type text not null,
  metric_value integer not null default 0,
  period_start timestamptz not null,
  period_end timestamptz not null,
  created_at timestamptz not null default now()
);

-- Site custom domains
create table if not exists public.custom_domains (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade not null,
  domain text not null,
  ssl_enabled boolean not null default false,
  ssl_cert_arn text,
  verification_token text,
  status text not null default 'pending' check (status in ('pending', 'verifying', 'active', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(site_id, domain)
);

-- Team members (collaboration)
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'editor' check (role in ('owner', 'admin', 'editor', 'viewer')),
  invited_by uuid references auth.users(id),
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  unique(site_id, user_id)
);

-- Analytics for published sites
create table if not exists public.site_analytics (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade not null,
  visitor_token uuid not null,
  page_path text not null,
  referrer text,
  user_agent text,
  country text,
  city text,
  device_type text,
  browser text,
  operating_system text,
  screen_width integer,
  screen_height integer,
  visit_duration_seconds integer,
  created_at timestamptz not null default now()
);

-- Create indexes for performance
create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_usage_records_user_id on public.usage_records(user_id);
create index if not exists idx_usage_records_site_id on public.usage_records(site_id);
create index if not exists idx_custom_domains_site_id on public.custom_domains(site_id);
create index if not exists idx_team_members_site_id on public.team_members(site_id);
create index if not exists idx_site_analytics_site_id on public.site_analytics(site_id);
create index if not exists idx_site_analytics_created_at on public.site_analytics(created_at);

-- ============================================
-- RLS POLICIES
-- ============================================

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_records enable row level security;
alter table public.custom_domains enable row level security;
alter table public.team_members enable row level security;
alter table public.site_analytics enable row level security;

-- Plans: public read
drop policy if exists "Plans are viewable by everyone" on public.plans;
create policy "Plans are viewable by everyone" on public.plans for select using (published = true);

-- Subscriptions: users can view their own
drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription" on public.subscriptions for all using (auth.uid() = user_id);

-- Usage records: users can view own
drop policy if exists "Users can view own usage" on public.usage_records;
create policy "Users can view own usage" on public.usage_records for all using (auth.uid() = user_id);

-- Custom domains: site owner only
drop policy if exists "Site owners can manage domains" on public.custom_domains;
create policy "Site owners can manage domains" on public.custom_domains for all 
  using (site_id in (select id from public.sites where user_id = auth.uid()));

-- Team members: site collaborators
drop policy if exists "Team can manage members" on public.team_members;
create policy "Team can manage members" on public.team_members for all 
  using (site_id in (select id from public.sites where user_id = auth.uid()) 
         or user_id = auth.uid());

-- Site analytics: site owner only
drop policy if exists "Site owners can view analytics" on public.site_analytics;
create policy "Site owners can view analytics" on public.site_analytics for select
  using (site_id in (select id from public.sites where user_id = auth.uid()));

-- ============================================
-- EXISTING SITES TABLE (updated)
-- ============================================

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  name text not null default 'My site',
  template_id text not null default 'simple__0',
  content jsonb not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_html text,
  published_at timestamptz,
  favicon text,
  seo_title text,
  seo_description text,
  custom_domain text,
  view_count integer not null default 0,
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
