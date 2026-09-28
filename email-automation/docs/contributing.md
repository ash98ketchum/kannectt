# Contributing Guide

## Branch Strategy

```
main    ← production (protected)
dev     ← staging (protected)
feat/*  ← new features
fix/*   ← bug fixes
chore/* ← deps, infra, config
```

**Never push directly to `main` or `dev`.** Always open a PR.

## Commit Convention (Conventional Commits)

```
feat: add directory unlock flow
fix: dry-run writes to sent_log
chore: upgrade groq to 1.8
docs: add API spec for /send endpoint
refactor: extract llm service from send_emails
test: add credit deduction unit tests
```

## PR Process

1. Branch off `dev`: `git checkout -b feat/my-feature dev`
2. Make changes, commit with conventional commits
3. Push and open PR → `dev`
4. CI must pass (lint + tests + build)
5. 1 approval required
6. Squash merge into `dev`
7. `dev` → `main` via release PR (no squash, preserve history)

## Code Style

- **Python**: `ruff` for linting, `black` for formatting (`line-length = 100`)
- **TypeScript**: ESLint + Prettier (`printWidth: 100`)
- **No `any` types** in TypeScript without a comment explaining why

## Running Tests

```bash
# API tests
cd apps/api
pytest tests/ -v

# Web type check
cd apps/web
npx tsc --noEmit
npm run lint
```
