-- ─────────────────────────────────────────────────────────────────────────────
-- 003 Razorpay — replace Stripe columns with Razorpay equivalents
-- ─────────────────────────────────────────────────────────────────────────────
-- Run in Supabase Dashboard → SQL Editor

-- Add Razorpay columns
alter table public.credit_orders
  add column if not exists razorpay_order_id   text,
  add column if not exists razorpay_payment_id text,
  add column if not exists amount_inr_paise     integer default 0;

-- Fast lookup by Razorpay order ID (used for idempotency in verify-payment)
create index if not exists credit_orders_rzp_order_idx
  on public.credit_orders (razorpay_order_id);

-- NOTE: Old Stripe columns (stripe_session_id, stripe_payment_intent_id,
-- amount_usd_cents) are kept as nullable so existing rows are not broken.
-- You can drop them later with:
--   alter table public.credit_orders
--     drop column if exists stripe_session_id,
--     drop column if exists stripe_payment_intent_id,
--     drop column if exists amount_usd_cents;
