# Local Development Guide

This guide covers getting the full kannectt stack running on your machine, including **live Stripe webhook testing** without any deployment.

---

## Prerequisites

| Tool | Version | Install |
|---|---|---|
| Python | 3.12+ | `brew install python@3.12` |
| Node.js | 20+ | `brew install node` |
| Stripe CLI | latest | `brew install stripe/stripe-cli/stripe` |
| tmux *(optional)* | any | `brew install tmux` |
| Docker *(optional)* | any | [docker.com](https://docker.com) |

---

## 1. Clone & install

```bash
git clone git@github.com:ash98ketchum/kannectt.git
cd kannectt/email-automation
make install
```

This creates `apps/api/.venv` and runs `npm install` in `apps/web`.

---

## 2. Configure environment

### Backend — `apps/api/.env`

```bash
cp apps/api/.env.example apps/api/.env
```

Fill in:

```dotenv
# Required for local dev
GROQ_API_KEY=gsk_...
SUPABASE_URL=https://<ref>.supabase.co
SUPABASE_SERVICE_KEY=<service-role-key>
SENDER_EMAIL=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Generate once and keep it — changing this breaks encrypted contacts
CONTACT_ENCRYPTION_KEY=<run: python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())">

# Stripe (add after step 4)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...   ← printed by Stripe CLI in step 4
```

### Frontend — `apps/web/.env.local`

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 3. Run the database migrations

Open your [Supabase SQL editor](https://supabase.com/dashboard/project/_/sql) and run both migration files in order:

```sql
-- Paste and run:
-- supabase/migrations/001_initial_schema.sql
-- supabase/migrations/002_resume_and_order_history.sql
```

Then create the Storage bucket:

1. Supabase dashboard → **Storage**
2. Click **New bucket**
3. Name: `resumes`, toggle **Private** on → Create

---

## 4. Seed the recruiter directory

```bash
make seed
```

This inserts 20 sample recruiter contacts with encrypted emails.

---

## 5. Start the dev servers

### Option A — Single command (recommended)

```bash
make dev          # API on :8000 + Web on :3000, Ctrl+C stops both
```

### Option B — All panes in tmux (API + Web + Stripe)

```bash
make dev-all      # requires tmux
```

Three panes open automatically:
- `api` — FastAPI with hot reload
- `web` — Next.js with hot reload
- `stripe` — Stripe CLI webhook forwarding

### Option C — Docker Compose

```bash
# Base stack (API + Web)
docker compose up --build

# With Stripe CLI webhook forwarding
docker compose --profile stripe up --build
```

---

## 6. Test the full Stripe payment loop

### Step 1 — Start Stripe webhook forwarding

```bash
make stripe
# or
bash scripts/stripe-dev.sh
```

The CLI prints:

```
> Ready! Your webhook signing secret is 'whsec_abc123...' (^C to quit)
```

Copy that value into `apps/api/.env` as `STRIPE_WEBHOOK_SECRET=whsec_abc123...` and restart the API.

### Step 2 — Trigger a test checkout

1. Open http://localhost:3000/credits
2. Click **Buy 60 credits** (Pro package)
3. You'll be redirected to Stripe's hosted checkout page

### Step 3 — Complete with test card

Use Stripe's test card details:

| Field | Value |
|---|---|
| Card number | `4242 4242 4242 4242` |
| Expiry | any future date, e.g. `12/30` |
| CVC | any 3 digits, e.g. `123` |
| Name | anything |

### Step 4 — Verify credits were added

After completing payment:
- You're redirected to `/credits?success=1`
- Your balance increases immediately
- The order appears in the **Purchase history** table with status **Completed**
- The Stripe CLI terminal shows the forwarded `checkout.session.completed` event

### Stripe CLI trigger (no browser needed)

To test the webhook handler without going through the UI:

```bash
stripe trigger checkout.session.completed \
  --override checkout_session:metadata.user_id=<your-supabase-user-id> \
  --override checkout_session:metadata.credits=60 \
  --override checkout_session:metadata.package=pro
```

---

## 7. Running tests

```bash
make test         # all tests
make test-api     # backend only  (30 tests)
make test-web     # frontend only (15 tests)
```

Tests run with zero real credentials — `tests/conftest.py` stubs all env vars.

---

## 8. Useful commands

```bash
# Restart just the API (after .env changes)
make dev-api

# Lint everything
make lint

# TypeScript type check
make typecheck

# Clean build artefacts
make clean

# Re-seed contacts (after schema wipe)
make seed
```

---

## Architecture overview

```
localhost:3000  (Next.js)
      │
      │  fetch /api/*
      ▼
localhost:8000  (FastAPI)
      │
      ├── Supabase (DB + Storage)
      ├── Groq API (LLM)
      ├── Gmail SMTP (email)
      └── Stripe (payments)
            ▲
            │  stripe listen --forward-to
     Stripe CLI (local)
```

---

## Common issues

| Problem | Fix |
|---|---|
| `CONTACT_ENCRYPTION_KEY` missing | Generate with `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| Credits not updating after payment | Make sure `STRIPE_WEBHOOK_SECRET` in `.env` matches the `whsec_...` from Stripe CLI |
| `No resume uploaded yet` (404) | Upload a PDF on the **Send** page first; it gets saved to Supabase Storage |
| `Payments not configured` on credits page | Add `STRIPE_SECRET_KEY=sk_test_...` to `apps/api/.env` |
| Dashboard shows no data | Run the SQL migrations + `make seed` |
