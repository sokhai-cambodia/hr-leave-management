# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

An HR leave-management system built on the `fastapi/full-stack-fastapi-template` scaffold (FastAPI + SQLModel + PostgreSQL backend, React + TypeScript frontend). It extends the template's generic Users/Items demo with a full leave-management domain: Teams, Leave Types, Public Holidays, Policies, Leave Balances, Leave Requests, Leave Plan Requests, and an AI-driven leave-date recommendation engine. `PROJECT_FEATURES.md` at the repo root is the consolidated API reference (written for reusing the backend from a Flutter/Android client) — read it first for endpoint shapes, auth, and business rules instead of re-deriving them from routes.

## Commands

### Backend (`backend/`, Python, managed with `uv`)

```bash
uv sync                              # install deps into backend/.venv
source .venv/bin/activate            # activate venv (from backend/)
fastapi dev app/main.py              # run dev server locally (localhost:8000)

bash scripts/test.sh                 # run full pytest suite with coverage (from backend/)
docker compose exec backend bash scripts/tests-start.sh   # run tests against the running stack
docker compose exec backend bash scripts/tests-start.sh -x -k test_name  # single test, stop on first failure

bash scripts/lint.sh                 # mypy + ruff check + ruff format --check
bash scripts/format.sh               # ruff check --fix + ruff format (auto-fix)

alembic revision --autogenerate -m "..."   # create a migration after changing SQLModel models
alembic upgrade head                       # apply migrations (run inside the backend container)
```

Tests live in `backend/tests/` (pytest, e.g. `backend/tests/api/routes/test_users.py`). Run a single test file with `pytest tests/api/routes/test_users.py` or a single test with `-k`.

### Frontend (`frontend/`)

```bash
npm install
npm run dev              # Vite dev server (localhost:5173)
npm run build             # tsc -p tsconfig.build.json && vite build
npm run lint               # Biome check --write (NOT ESLint/Prettier)
npm run generate-client    # regenerate frontend/src/client from the backend's OpenAPI schema

npx playwright test        # E2E tests (requires backend running: docker compose up -d --wait backend)
npx playwright test --ui   # interactive test debugging
```

### Whole stack

```bash
docker compose watch       # start db/backend/frontend/adminer/traefik with live reload
./scripts/generate-client.sh   # regenerate the frontend OpenAPI client from a running backend (repo root)
```

`docker-compose.override.yml` supplies local-dev-only overrides (source mounted as a volume, `mailcatcher` for SMTP capture, exposed Traefik/Adminer ports); `docker-compose.yml` is the base stack used in all environments; `docker-compose.traefik.yml` is the shared public-facing Traefik proxy used only in staging/production (see `deployment.md`).

Pre-commit (`.pre-commit-config.yaml`) runs ruff, ruff-format, and `cd frontend && npm run lint` (Biome) — install with `uv run pre-commit install` from `backend/`. `frontend/src/client/**` is excluded from formatting hooks since it's generated code.

## Architecture

### Backend domain layout

The template's original `app/models.py` still holds `User`/`Item` plus shared response wrappers (`Message`, `Token`, `LeaveRecommendation(s)`), but all leave-management SQLModel tables live in **`app/leave_models/`** (one file per entity: `team_model.py`, `leave_type_model.py`, `leave_policy_model.py`, `public_holiday_model.py`, `leave_balance_model.py`, `leave_request_model.py`, `leave_plan_request_model.py`, plus `presentable_model.py` for the trimmed nested-object shapes used in API responses, e.g. `TeamPresentable`). `User` imports and relates to all of them.

Business logic that doesn't belong in a route handler lives in **`app/leave_services/`**:
- `approval_service.py` — shared draft→submit→approve/reject authorization rules (`can_submit`, `can_approve`, `can_reject`, `get_line_approver`), used identically by both `leave_requests.py` and `leave_plan_requests.py`.
- `leave_service.py` / `leave_plan_service.py` — date validation and leave-day calculation.
- `balance_service.py` — debits/credits `LeaveBalance` rows on submit/reject.
- `team_service.py` — team membership lookups.

API routes live in `app/api/routes/` (one file per resource) and are wired up in `app/api/main.py`. The `private.py` router (internal/test-only user creation) is only mounted `if settings.ENVIRONMENT == "local"`. The original template's `items.py` router is defined but **commented out** in `api_router.include_router(...)` — Items still exists in the DB/frontend as reference/demo scaffolding but is not a live API route.

Auth follows the template's standard pattern: `app/api/deps.py` defines `SessionDep`/`CurrentUser`/`TokenDep` (OAuth2 bearer JWT, 8-day expiry) and `get_current_active_superuser`; route handlers depend on these rather than re-implementing auth. `app/core/config.py` (`Settings`, pydantic-settings) reads from the top-level `.env`; it raises on default `changethis` secrets outside `ENVIRONMENT=local`.

**Approval workflow** (shared by Leave Requests and Leave Plan Requests): `draft` → (owner submits, requires a `team.team_owner` as line approver) → `pending` → (approver approves/rejects) → `approved`/`rejected`. Leave Requests debit the balance on submit and credit it back on reject; Leave Plan Requests only touch balances via the recommendation engine, not on submit/reject. See `PROJECT_FEATURES.md` §1 for the full rule table.

**AI recommendation engine** (`app/api/routes/recommends.py`): builds a synthetic 365-day dataset per request (weekday, holiday, bridge-day, team workload from teammates' approved plan dates), scores it using the active `Policy` rows (DB-configured `code`/`operation`/`value`/`score` rules — no code changes needed to tune behavior), trains a `RandomForestRegressor` on the fly, and returns the top-N predicted days where N = the user's remaining leave balance. See `PROJECT_FEATURES.md` §11 for the full algorithm.

Demo/seed data: `app/initial_data.py` calls `init_db()` then, only when `ENVIRONMENT == "local"`, seeds a full demo dataset via `app/seed_data.py` (teams, users, leave types, balances, policies) keyed off the superuser account.

Alembic migrations (`app/alembic/versions/`) are the source of truth for schema history — always generate a new revision after changing a model in `app/models.py` or `app/leave_models/`, never hand-edit applied migrations.

### Frontend structure

TanStack Router file-based routing: `frontend/src/routes/_layout/*.tsx` are authenticated pages (wrapped by `_layout.tsx`'s auth guard); `login.tsx`, `signup.tsx`, `recover-password.tsx`, `reset-password.tsx` are public. Each domain has a `frontend/src/components/{Entity}/` folder (`Add{Entity}.tsx`, `Edit{Entity}.tsx`, `Delete{Entity}.tsx`) plus a `Common/{Entity}ActionsMenu.tsx` and a `Pending/Pending{Entities}.tsx` skeleton — see the **CRUD Page Creation Guide** in `frontend/.github/copilot-instructions.md` for the exact pattern to follow (including the "temporary service using `OpenAPI.BASE`" workaround used for domains added before their OpenAPI client was regenerated, and the `mode: "onChange"` react-hook-form + `checked === true` checkbox-coercion gotchas).

`frontend/src/client/` is entirely auto-generated by `npm run generate-client` (`@hey-api/openapi-ts`, configured in `frontend/openapi-ts.config.ts`) from the backend's live OpenAPI schema — never hand-edit it; it and `src/components/ui/**` and `routeTree.gen.ts` are excluded from Biome. Auth token lives in `localStorage` (`access_token`); `OpenAPI.TOKEN` reads it and a global handler in `src/main.tsx` redirects to `/login` on 401/403. `handleError()` / `useCustomToast()` (`src/utils.ts`, `src/hooks/useCustomToast.ts`) are the standard error/toast plumbing used by nearly every mutation — the two highest-fan-out functions in the codebase.

### Knowledge graph

This repo has a graphify knowledge graph in `graphify-out/` (see the `## graphify` section below) — prefer `graphify query "<question>"` / `graphify path` / `graphify explain` over broad grepping for architecture questions, and run `graphify update .` after non-trivial code changes to keep it current.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
