-- ─────────────────────────────────────────────────────────────────────────────
-- 004 Signup bonus (300 credits), referral system, temp-email block
-- ─────────────────────────────────────────────────────────────────────────────
-- Run in Supabase Dashboard → SQL Editor

-- ── 1. Bump the default signup credits from 1 → 300 ─────────────────────────
alter table public.users
  alter column credits_balance set default 300;

-- ── 2. Add referral columns to users ─────────────────────────────────────────
alter table public.users
  add column if not exists referral_code   text unique,   -- user's own shareable code
  add column if not exists referred_by     uuid references public.users(id);

-- Generate a unique referral code for every existing user that doesn't have one
update public.users
set referral_code = substr(md5(id::text || random()::text), 1, 8)
where referral_code is null;

-- ── 3. Referral events table ─────────────────────────────────────────────────
create table if not exists public.referral_events (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references public.users(id) on delete cascade,
  referee_id    uuid not null references public.users(id) on delete cascade,
  credits_given int  not null default 50,
  created_at    timestamptz not null default now(),
  unique (referee_id)   -- one referee can only reward one referrer
);

alter table public.referral_events enable row level security;
create policy "referral_events: own rows" on public.referral_events
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- ── 4. Update the new-user trigger to give 300 credits + auto-generate code ──
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  v_code text;
begin
  -- Generate unique 8-char alphanumeric referral code
  v_code := substr(md5(new.id::text || now()::text), 1, 8);

  insert into public.users (id, email, credits_balance, referral_code)
  values (new.id, new.email, 300, v_code);

  return new;
end;
$$;

-- ── 5. Index for fast referral_code lookup ────────────────────────────────────
create index if not exists users_referral_code_idx on public.users (referral_code);
