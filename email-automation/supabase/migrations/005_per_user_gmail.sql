-- ─────────────────────────────────────────────────────────────────────────────
-- 005 Per-user Gmail SMTP credentials (encrypted at rest)
-- ─────────────────────────────────────────────────────────────────────────────
-- Run in Supabase Dashboard → SQL Editor

alter table public.users
  add column if not exists sender_email           text,
  add column if not exists gmail_app_password_enc text;   -- Fernet-encrypted

-- Index for fast lookup
create index if not exists users_sender_email_idx on public.users (sender_email);
