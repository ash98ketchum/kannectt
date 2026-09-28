# email-automation

> AI-powered personalised job application email automation — part of the [Kannectt](https://github.com/ash98ketchum/kannectt) product suite.

## What it does
- Upload your resume + template once
- Paste recruiter / careers emails
- Groq LLM personalises each email per company
- One-click send with resume attached
- Credit-based SaaS with a verified recruiter directory

## Stack
| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind + shadcn/ui |
| Backend | FastAPI (Python 3.12) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| LLM | Groq (`qwen/qwen3.8-27b`) |
| CI/CD | GitHub Actions |

## Local Development

### Prerequisites
- Node.js 20+
- Python 3.12+
- Docker (for local Supabase)

### Setup

```bash
# Clone
git clone https://github.com/ash98ketchum/email-automation.git
cd email-automation

# API
cd apps/api
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in values

# Web
cd apps/web
npm install
cp .env.local.example .env.local   # fill in values

# Full stack (Docker)
docker-compose up
```

### Running
```bash
# API (from apps/api)
uvicorn app.main:app --reload --port 8000

# Web (from apps/web)
npm run dev
```

## Branching & Contributing
See [docs/contributing.md](docs/contributing.md).

- `main` → production (protected, PRs only)
- `dev` → staging (protected, PRs only)
- `feat/*` → feature branches
- `fix/*` → bug fixes

## License
MIT
