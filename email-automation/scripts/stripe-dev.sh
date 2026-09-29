#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# scripts/stripe-dev.sh
#
# Forwards Stripe webhook events to your local FastAPI server so you can test
# the full payment loop (checkout → webhook → credit top-up) without deploying.
#
# Usage:
#   bash scripts/stripe-dev.sh            # auto-login + forward
#   STRIPE_WEBHOOK_URL=http://... bash scripts/stripe-dev.sh
#
# Prerequisites:
#   1. Stripe CLI installed (brew install stripe/stripe-cli/stripe)
#   2. A Stripe account (free)
#   3. apps/api/.env has STRIPE_SECRET_KEY set to your sk_test_... key
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

API_ENV="$(cd "$(dirname "$0")/.." && pwd)/apps/api/.env"
WEBHOOK_URL="${STRIPE_WEBHOOK_URL:-http://localhost:8000/api/webhooks/stripe}"

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}→${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
error() { echo -e "${RED}✗${NC} $*" >&2; exit 1; }

# ── 1. Check Stripe CLI is installed ─────────────────────────────────────────
if ! command -v stripe &>/dev/null; then
  warn "Stripe CLI not found."
  echo ""
  echo "  Install it with one of:"
  echo "    macOS:   brew install stripe/stripe-cli/stripe"
  echo "    Linux:   https://docs.stripe.com/stripe-cli#install"
  echo "    Windows: scoop install stripe"
  echo ""
  error "Please install Stripe CLI and re-run this script."
fi
ok "Stripe CLI found: $(stripe version)"

# ── 2. Log in if needed ───────────────────────────────────────────────────────
if ! stripe config --list 2>/dev/null | grep -q "api_key"; then
  info "Not logged in — opening Stripe login..."
  stripe login
fi
ok "Stripe CLI authenticated."

# ── 3. Verify API is running ──────────────────────────────────────────────────
info "Checking if FastAPI is running at http://localhost:8000/health ..."
for i in 1 2 3 4 5; do
  if curl -sf http://localhost:8000/health >/dev/null 2>&1; then
    ok "FastAPI is up."
    break
  fi
  if [ "$i" -eq 5 ]; then
    warn "FastAPI not responding at localhost:8000."
    warn "Start it first with: make dev-api"
    echo -n "Continue anyway? [y/N] "
    read -r ans
    [[ "$ans" =~ ^[Yy]$ ]] || exit 1
  fi
  sleep 1
done

# ── 4. Extract STRIPE_WEBHOOK_SECRET from forwarding ─────────────────────────
info "Starting webhook forwarding to ${WEBHOOK_URL}"
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  Stripe will print a webhook signing secret below.        ${NC}"
echo -e "${YELLOW}  Copy the 'whsec_...' value into apps/api/.env as:        ${NC}"
echo -e "${YELLOW}  STRIPE_WEBHOOK_SECRET=whsec_...                          ${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════════${NC}"
echo ""

# Forward events — listen for all checkout events
stripe listen \
  --forward-to "${WEBHOOK_URL}" \
  --events checkout.session.completed,checkout.session.expired,payment_intent.succeeded,payment_intent.payment_failed

# Note: stripe listen blocks until Ctrl+C — the lines below are for reference only
# The webhook secret is printed in the stripe listen output as:
#   > Ready! Your webhook signing secret is 'whsec_...' (^C to quit)
