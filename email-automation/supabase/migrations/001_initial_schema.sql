-- ─────────────────────────────────────────────────────────────────────────────
-- 001 Initial schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Users (extends Supabase auth.users)
create table if not exists public.users (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            text not null,
  credits_balance  int  not null default 1,  -- 1 free send on signup
  created_at       timestamptz not null default now()
);

-- Email send log
create table if not exists public.email_sends (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  to_email   text not null,
  company    text,
  subject    text,
  status     text not null check (status in ('sent','failed','preview')),
  sent_at    timestamptz not null default now()
);

-- Credit purchase orders
create table if not exists public.credit_orders (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  stripe_session_id  text unique,
  package            text not null,
  credits            int  not null,
  amount_usd_cents   int  not null,
  status             text not null check (status in ('pending','completed','failed')),
  created_at         timestamptz not null default now()
);

-- Recruiter / contacts directory (encrypted emails)
create table if not exists public.contacts (
  id                uuid primary key default gen_random_uuid(),
  first_name        text not null,
  last_name         text not null,
  title             text,
  company_name      text not null,
  company_domain    text,
  department        text,
  seniority         text,
  location          text,
  linkedin_url      text,
  email_encrypted   text not null,  -- Fernet-encrypted, server-side only
  email_hash        text not null,  -- SHA-256 for dedup (no decryption needed)
  verified_at       timestamptz,
  unlock_count      int not null default 0,
  source            text,
  created_at        timestamptz not null default now()
);

-- Contacts unlocked by users
create table if not exists public.user_unlocks (
  user_id    uuid not null references public.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  credits_spent int not null,
  unlocked_at   timestamptz not null default now(),
  primary key (user_id, contact_id)
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.users        enable row level security;
alter table public.email_sends  enable row level security;
alter table public.credit_orders enable row level security;
alter table public.user_unlocks  enable row level security;

-- Users can only read/write their own row
create policy "users: own row" on public.users
  for all using (auth.uid() = id);

create policy "email_sends: own rows" on public.email_sends
  for all using (auth.uid() = user_id);

create policy "credit_orders: own rows" on public.credit_orders
  for all using (auth.uid() = user_id);

create policy "user_unlocks: own rows" on public.user_unlocks
  for all using (auth.uid() = user_id);

-- Contacts are readable by all authenticated users (masked), never writable from client
create policy "contacts: read authenticated" on public.contacts
  for select using (auth.role() = 'authenticated');

-- ─── Trigger: new user → create credits row ──────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email) values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
