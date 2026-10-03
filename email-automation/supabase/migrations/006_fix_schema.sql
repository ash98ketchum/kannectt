-- ─────────────────────────────────────────────────────────────────────────────
-- 006 Fix schema — add missing Razorpay columns and remove Stripe constraints
-- ─────────────────────────────────────────────────────────────────────────────
-- Run in Supabase Dashboard → SQL Editor

-- 1. Add missing Razorpay columns to credit_orders
alter table public.credit_orders
  add column if not exists razorpay_order_id   text,
  add column if not exists razorpay_payment_id text,
  add column if not exists amount_inr_paise    integer default 0;

-- 2. Remove NOT NULL constraints from old Stripe columns (if they exist)
alter table public.credit_orders 
  alter column amount_usd_cents drop not null;
alter table public.credit_orders 
  alter column stripe_session_id drop not null;

-- 2. Index for fast lookup by Razorpay order ID
create index if not exists credit_orders_rzp_order_idx
  on public.credit_orders (razorpay_order_id);

-- 3. Make email nullable (fallback for manual user creation)
alter table public.users
  alter column email drop not null;

-- 4. Add referral columns if missing
alter table public.users
  add column if not exists referral_code text unique,
  add column if not exists referred_by   uuid references public.users(id);

-- 5. Add Gmail columns if missing
alter table public.users
  add column if not exists sender_email           text,
  add column if not exists gmail_app_password_enc text;

-- 6. Add resume columns if missing
alter table public.users
  add column if not exists resume_path     text,
  add column if not exists resume_filename text;

-- 7. Create referral_events table if missing
create table if not exists public.referral_events (
  id            uuid primary key default gen_random_uuid(),
  referrer_id   uuid not null references public.users(id) on delete cascade,
  referee_id    uuid not null references public.users(id) on delete cascade,
  credits_given int  not null default 50,
  created_at    timestamptz not null default now(),
  unique (referee_id)
);

-- 8. Enable RLS on referral_events
alter table public.referral_events enable row level security;

-- 9. Create RLS policy for referral_events (drop first if exists)
drop policy if exists "referral_events: own" on public.referral_events;
create policy "referral_events: own" on public.referral_events
  for select using (auth.uid() = referrer_id or auth.uid() = referee_id);

-- 10. Generate referral codes for existing users without one
update public.users
  set referral_code = substr(md5(id::text || random()::text), 1, 8)
  where referral_code is null;

-- 11. Create indexes
create index if not exists users_referral_code_idx on public.users (referral_code);
create index if not exists users_sender_email_idx  on public.users (sender_email);

-- 12. Update default credits to 300 for new users
alter table public.users
  alter column credits_balance set default 300;

-- 13. Give existing users 300 credits if they have less
update public.users
  set credits_balance = 300
  where credits_balance < 300;
