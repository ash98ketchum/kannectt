# Architecture

## Overview

```
Browser
  │
  ▼
Next.js 14 (Vercel)        ← UI, auth, routing
  │  REST / fetch
  ▼
FastAPI (Railway)           ← business logic, email sending, LLM
  │
  ├── Supabase (PostgreSQL) ← users, credits, directory, send log
  ├── Groq API              ← LLM personalisation
  ├── Gmail SMTP            ← email delivery
  └── Stripe                ← payment / credit top-up
```

## Key Flows

### Send Email Flow
1. User uploads resume + template (stored in Supabase Storage)
2. User adds targets (recruiter emails or picks from directory)
3. POST `/api/send/dry-run` → LLM personalises, returns preview (no email sent, no credits charged)
4. User confirms → POST `/api/send/execute`
5. API checks credit balance → deducts 3 credits/email → sends via Gmail SMTP → logs result

### Directory Unlock Flow
1. User browses contacts (masked emails)
2. Adds to cart → POST `/api/directory/unlock`
3. API deducts credits → decrypts email → stores in `user_unlocks`
4. Unlocked contacts feed directly into the send flow

### Credit Purchase Flow
1. User picks package → POST `/api/credits/checkout` → Stripe Checkout Session
2. Stripe redirects back → webhook POST `/api/webhooks/stripe`
3. Webhook verifies signature → credits added to `users.credits_balance`

## Database Schema
See `supabase/migrations/001_initial_schema.sql`
