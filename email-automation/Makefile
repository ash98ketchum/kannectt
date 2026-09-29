# ─────────────────────────────────────────────────────────────────────────────
# Makefile — kannectt / email-automation
#
# Usage:
#   make dev          Start API + Web in parallel (no Docker)
#   make docker       Start everything via Docker Compose
#   make stripe       Forward Stripe webhooks to local API (requires Stripe CLI)
#   make dev-all      API + Web + Stripe CLI all at once (tmux or background)
#   make test         Run all tests
#   make test-api     Run only backend pytest
#   make test-web     Run only frontend jest
#   make lint         Lint Python + TypeScript
#   make typecheck    TypeScript type check only
#   make install      Install all dependencies
#   make seed         Seed the recruiter directory with sample contacts
# ─────────────────────────────────────────────────────────────────────────────

.PHONY: help dev docker stripe dev-all test test-api test-web lint typecheck install seed clean

API_DIR   := apps/api
WEB_DIR   := apps/web
VENV      := $(API_DIR)/.venv
PYTHON    := $(VENV)/bin/python
PIP       := $(VENV)/bin/pip
PYTEST    := PYTHONPATH=$(API_DIR) $(VENV)/bin/pytest

# Detect webhook URL from env or default
STRIPE_WEBHOOK_URL ?= http://localhost:8000/api/webhooks/stripe

# ── Default ──────────────────────────────────────────────────────────────────
help:
	@grep -E '^[a-zA-Z_-]+:.*##' Makefile | awk -F':.*## ' '{printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "  Run \033[1mmake dev\033[0m to get started."

# ── Install ───────────────────────────────────────────────────────────────────
install: ## Install Python venv + Node deps
	@echo "→ Creating Python venv..."
	python3 -m venv $(VENV)
	$(PIP) install --upgrade pip -q
	$(PIP) install -r $(API_DIR)/requirements.txt -q
	@echo "→ Installing Node deps..."
	cd $(WEB_DIR) && npm install
	@echo "✓ Dependencies installed."

# ── Dev servers ───────────────────────────────────────────────────────────────
dev: ## Start API (port 8000) + Web (port 3000) in parallel
	@echo "→ Starting API + Web..."
	@trap 'kill 0' INT; \
	  (cd $(API_DIR) && PYTHONPATH=. $(VENV)/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload) & \
	  (cd $(WEB_DIR) && npm run dev) & \
	  wait

dev-api: ## Start only the FastAPI server
	cd $(API_DIR) && PYTHONPATH=. $(VENV)/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

dev-web: ## Start only the Next.js dev server
	cd $(WEB_DIR) && npm run dev

dev-all: ## Start API + Web + Stripe CLI webhook forwarding (requires tmux)
	@command -v tmux >/dev/null 2>&1 || { echo "tmux not found. Run 'brew install tmux' then retry."; exit 1; }
	@echo "→ Starting dev-all in tmux session 'kannectt'..."
	tmux new-session -d -s kannectt -n api  "cd $(API_DIR) && PYTHONPATH=. $(VENV)/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
	tmux new-window   -t kannectt    -n web  "cd $(WEB_DIR) && npm run dev"
	tmux new-window   -t kannectt    -n stripe "bash scripts/stripe-dev.sh"
	tmux attach -t kannectt

# ── Docker ────────────────────────────────────────────────────────────────────
docker: ## Start all services via Docker Compose (includes Stripe CLI)
	docker compose up --build

docker-down: ## Stop all Docker services
	docker compose down

# ── Stripe local testing ──────────────────────────────────────────────────────
stripe: ## Forward Stripe webhooks to local API (runs scripts/stripe-dev.sh)
	@bash scripts/stripe-dev.sh

# ── Tests ─────────────────────────────────────────────────────────────────────
test: test-api test-web ## Run all tests

test-api: ## Run backend pytest suite
	@echo "→ Running API tests..."
	$(PYTEST) $(API_DIR)/tests/ -v --tb=short

test-web: ## Run frontend Jest suite
	@echo "→ Running Web tests..."
	cd $(WEB_DIR) && npm test

# ── Lint ──────────────────────────────────────────────────────────────────────
lint: ## Lint Python (ruff) + TypeScript (eslint)
	@echo "→ Python lint..."
	$(VENV)/bin/ruff check $(API_DIR)/app/ $(API_DIR)/tests/
	@echo "→ TypeScript lint..."
	cd $(WEB_DIR) && npm run lint

typecheck: ## TypeScript type check only
	cd $(WEB_DIR) && npx tsc --noEmit

# ── Database / Seed ───────────────────────────────────────────────────────────
seed: ## Seed the recruiter directory with sample contacts (needs SUPABASE_URL + SERVICE_KEY in .env)
	$(PYTHON) scripts/seed_contacts.py

# ── Cleanup ───────────────────────────────────────────────────────────────────
clean: ## Remove build artifacts and caches
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf $(WEB_DIR)/.next
	@echo "✓ Cleaned."
