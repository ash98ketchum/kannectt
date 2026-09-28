-- ─────────────────────────────────────────────────────────────────────────────
-- 002 Resume storage + order history
-- ─────────────────────────────────────────────────────────────────────────────

-- Track last-uploaded resume path per user (Supabase Storage key)
alter table public.users
  add column if not exists resume_path text;       -- e.g. resumes/<user_id>/resume.pdf
alter table public.users
  add column if not exists resume_filename text;   -- original filename for display

-- Credit order history (previously only had stripe_session_id in credit_orders)
-- Add stripe_payment_intent_id for webhook idempotency
alter table public.credit_orders
  add column if not exists stripe_payment_intent_id text;

-- Index for fast webhook dedup lookup
create index if not exists credit_orders_session_idx
  on public.credit_orders (stripe_session_id);

-- Storage bucket: resumes (private, served via signed URLs)
-- Run this in Supabase dashboard → Storage → New bucket
-- bucket name: "resumes", public: false
-- OR via Supabase CLI:
--   supabase storage create resumes --private

-- RLS policy: users can only read/write their own resume folder
-- (Applied on the storage.objects table by Supabase automatically
--  when using service-role key on the backend, anon key reads are blocked)
