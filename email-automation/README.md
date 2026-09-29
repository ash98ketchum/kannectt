# kannectt / email-automation

> AI-powered personalised job application email automation — part of the [kannectt](https://github.com/ash98ketchum/kannectt) product suite.

## What it does

- **300 free credits on signup** — no card needed
- Upload your resume once → AI personalises every email per company
- Verified recruiter directory — browse & unlock hiring manager contacts
- Bulk send with natural delays to avoid spam filters
- Credit-based pricing via **Razorpay** (UPI / GPay / PhonePe / card)
- Referral system — earn 50 credits per friend you invite
- Full send history & dashboard

---

## Stack

| Layer      | Tech                                        |
|------------|---------------------------------------------|
| Frontend   | Next.js 14 (App Router) · Tailwind CSS      |
| Backend    | FastAPI (Python 3.12+)                      |
| Database   | Supabase (PostgreSQL + Auth + Storage)      |
| Payments   | Razorpay (UPI / GPay / card)                |
| LLM        | Groq (`qwen/qwen3.8-27b`)                   |
| Email      | Gmail SMTP (your own account)               |
| Encryption | Fernet (recruiter contact emails)           |

---

## Local Development

### Prerequisites

- **Node.js** 20+
- **Python** 3.12+
- A [Supabase](https://supabase.com) project (free tier works)
- A [Groq](https://console.groq.com) API key (free)
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords)
- A [Razorpay](https://dashboard.razorpay.com) test account (free)

---

### 1. Clone the repo

```bash
git clone https://github.com/ash98ketchum/kannectt.git
cd kannectt/email-automation
```

---

### 2. Backend setup (`apps/api`)

```bash
cd apps/api

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Copy env file and fill in values
cp .env.example .env
```

Edit `apps/api/.env`:

```dotenv
ENVIRONMENT=development
ALLOWED_ORIGINS=["http://localhost:3000"]

# Groq
GROQ_API_KEY=gsk_...
GROQ_MODEL=qwen/qwen3.8-27b

# Gmail SMTP (your real Gmail + App Password)
SENDER_EMAIL=you@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# Supabase (Settings → API)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Razorpay (Dashboard → Settings → API Keys)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...

# Encryption key for recruiter contacts
# Generate once: python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
CONTACT_ENCRYPTION_KEY=...
```

---

### 3. Frontend setup (`apps/web`)

```bash
cd apps/web

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.local.example .env.local
```

Edit `apps/web/.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

---

### 4. Run database migrations

In [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard), run each file in order:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_resume_and_order_history.sql
supabase/migrations/003_razorpay.sql
supabase/migrations/004_signup_bonus_referral.sql
```

Also create a **private** Storage bucket named `resumes`:
> Supabase Dashboard → Storage → New bucket → Name: `resumes` → Public: **off**

---

### 5. Seed recruiter contacts (optional)

```bash
cd apps/api
.venv/bin/python ../../scripts/seed_contacts.py
```

---

### 6. Run locally

Open **two terminals**:

**Terminal 1 — API (FastAPI)**

```bash
cd apps/api
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

API is live at → `http://localhost:8000`
Swagger docs → `http://localhost:8000/docs`

**Terminal 2 — Web (Next.js)**

```bash
cd apps/web
npm run dev
```

App is live at → `http://localhost:3000`

---

### 7. Run tests

**Backend (pytest)**

```bash
cd apps/api
PYTHONPATH=. .venv/bin/pytest -v
```

**Frontend (jest)**

```bash
cd apps/web
npm test
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/api/send/dry-run` | Preview emails without sending |
| `POST` | `/api/send/execute` | Send personalised emails |
| `GET`  | `/api/credits/balance/:user_id` | Get credit balance |
| `POST` | `/api/credits/create-order` | Create Razorpay order |
| `GET`  | `/api/credits/orders/:user_id` | Purchase history |
| `POST` | `/api/payments/verify` | Verify Razorpay payment signature |
| `GET`  | `/api/directory/` | Browse recruiter contacts (masked) |
| `POST` | `/api/directory/unlock` | Unlock contact emails |
| `GET`  | `/api/profile/resume` | Get uploaded resume metadata |
| `POST` | `/api/profile/resume` | Upload resume PDF |
| `DELETE` | `/api/profile/resume` | Delete resume |
| `GET`  | `/api/referral/:user_id` | Get referral code + stats |
| `POST` | `/api/referral/claim` | Claim referral bonus |

---

## Credit System

| Action | Cost |
|--------|------|
| Send 1 personalised email | 3 credits |
| Generate template from resume | 4 credits |
| Unlock 1 recruiter contact | 3–5 credits |
| Bulk send (10 emails) | 25 credits |
| **Signup bonus** | **300 credits free** |
| **Referral bonus** | **+50 credits per friend** |

---

## Branching

| Branch | Purpose |
|--------|---------|
| `main` | Production — PRs only |
| `dev` | Staging — PRs only |
| `feat/*` | Feature branches |
| `fix/*` | Bug fixes |

See [docs/contributing.md](docs/contributing.md) for the full workflow.

---

## Testing Razorpay Payments

Use these test credentials in the Razorpay modal:

| Method | Test value |
|--------|-----------|
| Card | `4111 1111 1111 1111` · any future expiry · any CVV |
| UPI success | `success@razorpay` |
| UPI failure | `failure@razorpay` |

---

## License

MIT
