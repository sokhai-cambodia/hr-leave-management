# Plan: In-App Notifications (Leave Requests & Leave Plan Requests)

Source spec: `SPEC.md` (repo root). This plan slices that spec into ordered, independently
verifiable tasks.

## Dependency graph

```
A1 Notification model
  └─ A2 Migration (needs A1)
       └─ A3 NotificationService (needs A1)
            ├─ A4 notifications.py routes + main.py wiring (needs A3)
            ├─ A5 Wire into leave_requests.py submit/approve/reject (needs A3)
            └─ A6 Wire into leave_plan_requests.py submit/approve/reject (needs A3)
                 └─ A7 Backend tests (needs A4, A5, A6)
                      └─ B1 Frontend client regen (needs A4 live on a running backend)
                           └─ B2 NotificationBell.tsx (needs B1)
                                └─ B3 NotificationDropdown.tsx (needs B1)
                                     └─ B4 Wire bell into Navbar.tsx (needs B2, B3)
                                          └─ B5 Manual browser verification (needs B4)
```

No horizontal "do all models, then all services, then all routes" split — each backend task ends
in something runnable/testable (`alembic upgrade head` succeeds, a route returns real data), and
the frontend doesn't start until the backend surface it depends on actually exists.

## Checkpoints

- **After A2**: `alembic upgrade head` applies cleanly against the local DB; `alembic downgrade -1`
  then re-`upgrade head` round-trips without error.
- **After A6**: manually exercise submit → approve and submit → reject once each (via
  `fastapi dev` + curl/HTTPie or the existing frontend forms) and confirm rows land in the
  `notification` table with correct `recipient_id`/`event_type`/`message`.
- **After A7**: `bash scripts/test.sh` green.
- **After B1**: `frontend/src/client` contains generated `NotificationsService` methods — spot
  check, don't hand-edit.
- **After B5**: stop and report back before considering the feature done — this is the point
  where "looks right in code" gets confirmed against "works in the browser."

---

## A1 — Notification model

**File:** `backend/app/leave_models/notification_model.py` (new)

Add `Notification` (table), `NotificationPublic`, `NotificationsPublic`, per SPEC.md §2.1. No
`back_populates` needed on `app/models.py`'s `User` — `recipient`/`actor` relationships on
`Notification` use `sa_relationship_kwargs={"foreign_keys": ...}` only, so `User` itself is not
touched (avoids risk of colliding with its existing `leave_requests`/`approved_leave_requests`
etc. relationship set).

Export it from `backend/app/leave_models/__init__.py` alongside the other leave models (check the
existing file first — some models are exported there, confirm the pattern before adding).

**Acceptance criteria:**
- `Notification` importable from `app.leave_models.notification_model`.
- `NotificationPublic.actor` is `UserPresentable | None`; `entity_id` typed `uuid.UUID`.
- `mypy`/`ruff` clean (`bash scripts/lint.sh`).

## A2 — Migration

`alembic revision --autogenerate -m "add notification table"` from `backend/`, then inspect the
generated file (autogenerate sometimes misses `ondelete`/`nullable` nuances — verify against the
model by hand), then `alembic upgrade head`.

**Acceptance criteria:**
- New file in `backend/app/alembic/versions/`.
- `upgrade()`/`downgrade()` both present and correct (downgrade drops the table).
- Applies cleanly to local DB; round-trips (down then up) without error.

## A3 — NotificationService

**File:** `backend/app/leave_services/notification_service.py` (new)

`NotificationService(session)` with `notify_submitted`, `notify_approved`, `notify_rejected` per
SPEC.md §2.2. Takes the already-loaded `row` (has `.owner`, `.leave_type`, `.approver_id` /
`.owner_id` populated via existing relationships — no extra queries needed), `entity_type: str`,
and `current_user` (the actor). Builds `message`, does `session.add(Notification(...))` — **does
not call `session.commit()`** (caller's existing commit covers it).

**Acceptance criteria:**
- No commit/refresh inside the service — verified by reading the diff, not just tests.
- Message strings match SPEC.md §1 table exactly (used by A7 tests).

## A4 — `notifications.py` routes

**File:** `backend/app/api/routes/notifications.py` (new)

`GET /notifications/`, `GET /notifications/unread-count`, `PUT /notifications/{id}/read`,
`PUT /notifications/mark-all-read` per SPEC.md §2.4. Register in `app/api/main.py`.

**Acceptance criteria:**
- All four endpoints scoped to `current_user.id == recipient_id`; no superuser bypass (confirm by
  reading the handler, this is a deliberate deviation from this repo's usual superuser-sees-all
  pattern used in `leave_requests.py`).
- `PUT /notifications/{id}/read` on someone else's notification → 403.
- `GET /notifications/` response includes `unread_count` unaffected by the `is_read` filter param.

## A5 — Wire into `leave_requests.py`

Add `NotificationService` calls in `submit` (→ `notify_submitted`), `approve`
(→ `notify_approved`), `reject` (→ `notify_reject`ed), each placed right before the existing
`session.commit()` in that handler (see `backend/app/api/routes/leave_requests.py:198-299`).

**Acceptance criteria:** one extra `session.add()` per handler, zero new commits, existing
behavior (balance debit/credit, status transitions) unchanged — diff should be additive only.

## A6 — Wire into `leave_plan_requests.py`

Same as A5, mirrored for `backend/app/api/routes/leave_plan_requests.py`'s submit/approve/reject
handlers (confirm their exact structure first — read the file, don't assume it's identical to
`leave_requests.py`; leave plan requests don't touch balances on submit/reject per CLAUDE.md, so
there may be fewer surrounding lines).

**Acceptance criteria:** same as A5.

## A7 — Backend tests

**File:** `backend/tests/api/routes/test_notifications.py` (new), following the structure of
`backend/tests/api/routes/test_items.py` (existing pattern: fixtures from `conftest.py`, TestClient
against `settings.API_V1_STR`).

No existing test files for `leave_requests`/`leave_plan_requests` to extend, so notification
creation is verified end-to-end within this one new file: create a leave request via the API,
submit it (as owner), assert a `Notification` row exists for the approver with the right
`event_type`/`message`; then approve/reject (as approver) and assert the owner-side notification.
Plus direct endpoint tests: list, `is_read` filter, `unread-count`, mark-one-read (incl. 403 for
non-recipient), mark-all-read.

**Acceptance criteria:** `bash scripts/test.sh` passes; coverage includes at least one submit,
one approve, one reject path for each of `leave_request` and `leave_plan_request`.

## B1 — Frontend client regen

With the backend running (`docker compose watch` or `fastapi dev`), run
`./scripts/generate-client.sh` from repo root.

**Acceptance criteria:** `frontend/src/client` contains `NotificationsService` (or equivalent
generated name) with methods for all four endpoints; `git diff --stat frontend/src/client` shows
only generated changes, nothing hand-edited.

## B2 — `NotificationBell.tsx`

**File:** `frontend/src/components/Notification/NotificationBell.tsx` (new)

Bell icon (react-icons, matching `UserMenu.tsx`'s `FaUserAstronaut`/`FiUser` import style) +
unread-count badge. `useQuery` on the unread-count endpoint with `refetchInterval: 30_000`. Badge
hidden when count is 0.

**Acceptance criteria:** renders standalone (Storybook-less repo, so verify via B5 in-browser);
badge count matches DB state after a manual submit/approve/reject cycle.

## B3 — `NotificationDropdown.tsx`

**File:** `frontend/src/components/Notification/NotificationDropdown.tsx` (new)

Opens from `NotificationBell`'s click (reuse `MenuRoot`/`MenuTrigger`/`MenuContent` from
`frontend/src/components/ui/menu.tsx`, same primitives `UserMenu.tsx` uses). Fetches
`GET /notifications/?limit=10` on open (React Query `enabled`/`refetch` on open, not polled).
Each row: unread rows visually distinct, click → `PUT /notifications/{id}/read` then
`navigate({ to: entity_type === "leave_request" ? "/leave-requests" : "/leave-plan-requests" })`.
Header action: "Mark all as read" → `PUT /notifications/mark-all-read`, invalidates both the list
and unread-count queries.

**Acceptance criteria:** clicking an item marks it read and navigates; mark-all-read zeroes the
badge without a page reload.

## B4 — Wire into `Navbar.tsx`

Add `<NotificationBell />` next to `<UserMenu />` in `frontend/src/components/Common/Navbar.tsx:26`.

**Acceptance criteria:** bell renders in the top nav at the same breakpoint `UserMenu` does
(`Navbar.tsx` currently hides the whole bar below `md` — confirm whether notifications should also
be reachable on mobile via `Sidebar.tsx`/`UserMenu`'s mobile path; flag this to the user rather
than silently deciding).

## B5 — Manual browser verification

Run `docker compose watch` (or `fastapi dev` + `npm run dev`), log in as two users where one is the
other's team owner, drive: submit → approver sees badge/dropdown entry → approve → owner sees
badge/dropdown entry. Repeat once for reject. Confirm mark-all-read and navigation both work.
Report results in chat; do not mark the feature done without this pass per CLAUDE.md's UI-change
testing requirement.

---

# Plan: Account & Identity Enhancements (backend-only)

Source: `hr-leave-management-flutter/tasks/plan.md` Phase 13 (13.2-backend, 13.3-backend, 13.4) —
three features requested from the Flutter client that need backend changes here first. No frontend
(React) work in this pass; the Flutter side is the consumer and stays blocked until this lands.

## Dependency graph

```
C1 User.username + User.phone_number on UserBase/UserUpdateMe
  └─ C2 Migration (needs C1)
       └─ C3 crud.get_user_by_username / get_user_by_identifier / authenticate_by_identifier
            ├─ C4 login.py uses authenticate_by_identifier (needs C3)
            ├─ C5 users.py username-uniqueness checks on admin create/update (needs C3)
            └─ C6 test_login.py: username-login test (needs C4)
C7 render.yaml SMTP env vars (independent - infra only, no code dependency)
```

## C1 — `User.username` + `User.phone_number`

**File:** `backend/app/models.py`

`username: str | None` added to `UserBase` (unique, indexed, max 64) — lands in `UserCreate`,
`UserUpdate` (both admin-facing schemas already inherit `UserBase`) and `UserPublic`
automatically, but deliberately **not** added to `UserUpdateMe` (own separate field list, not
`UserBase`-derived) so it stays admin-only, matching how `team_id` already works.

`phone_number: str | None` also added to `UserBase` (max 32, no uniqueness) for the same
admin-editable-by-default reasoning, **and** explicitly added to `UserUpdateMe` too so the user can
self-edit their own phone number (needed for the Flutter QR business-card feature).

**Acceptance criteria:** both fields optional/nullable (no backfill required for existing rows);
`username` has a unique index; `phone_number` does not.

## C2 — Alembic migration

**File:** `backend/app/alembic/versions/e91b6a2d5f3c_add_username_and_phone_number_to_user.py`

Chains off `b7f3a9d21c44` (the notification-model migration, current head at time of writing) —
adds both columns nullable, plus a unique index on `username` (mirrors the `ix_user_email` pattern
from `e2412789c190_initialize_models.py`). Hand-written, **not run** (see environment blocker in
`tasks/todo.md`) — verify with `alembic upgrade head` / `alembic downgrade -1` round-trip before
merging.

## C3 — `crud.py` additions

**File:** `backend/app/crud.py`

New `get_user_by_username`, `get_user_by_identifier` (tries username first, falls back to email),
and `authenticate_by_identifier` — all additive. The existing `authenticate`/`get_user_by_email`
are untouched on purpose, so `tests/crud/test_user.py` (which calls `crud.authenticate(email=...)`
directly) doesn't need to change.

## C4 — Login route uses identifier-based auth

**File:** `backend/app/api/routes/login.py`

`POST /login/access-token` now calls `crud.authenticate_by_identifier` instead of
`crud.authenticate`, passing `form_data.username` (the OAuth2 form field, semantically "whatever
the client typed") straight through — no client-side hint needed about which one it is.

**Acceptance criteria:** logging in with either a user's email or their username succeeds;
incorrect credentials still 400 with a (now slightly reworded) "Incorrect email/username or
password".

## C5 — Username uniqueness on admin routes

**File:** `backend/app/api/routes/users.py`

`create_user`/`update_user` (both superuser-only) gain a username-uniqueness pre-check mirroring
the existing email one — 400 on create-conflict, 409 on update-conflict, matching the existing
email-conflict status codes exactly so client error handling doesn't need special-casing.

## C6 — Test coverage

**File:** `backend/tests/api/routes/test_login.py`

`test_get_access_token_by_username` — creates a user with both `email` and `username` set, logs in
using only the username, asserts a token comes back. Hand-written, not run (same environment
blocker).

## C7 — Real SMTP via Resend (infra, not code)

**File:** `render.yaml`

Adds `SMTP_HOST`/`SMTP_PORT`/`SMTP_TLS`/`SMTP_USER`/`EMAILS_FROM_EMAIL`/`EMAILS_FROM_NAME` for
Resend's SMTP relay (`smtp.resend.com:587`) — no backend code changes needed, `app/utils.py`'s
`send_email()` already reads these via `app/core/config.py`. `SMTP_PASSWORD` is `sync: false`
(Render prompts for it in the dashboard, never stored in git) — **a human still needs to** sign up
at resend.com, generate an API key, and paste it in. `EMAILS_FROM_EMAIL` defaults to Resend's
sandbox address (`onboarding@resend.dev`), which only delivers in Resend's test mode — swap to a
verified sending domain for real delivery to arbitrary recipients.

**Acceptance criteria:** once the API key is set, a forgot-password request against the deployed
backend delivers a real email with a working reset link (manual verify, can't be done from this
environment).
