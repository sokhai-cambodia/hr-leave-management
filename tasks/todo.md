# Todo: In-App Notifications

See `tasks/plan.md` for full detail/acceptance criteria per item.

## Backend
- [x] A1 — `Notification` model + Public/Public-list schemas (`leave_models/notification_model.py`)
- [x] A2 — Alembic migration (hand-written, NOT run — no local venv; verify with `alembic upgrade head` before merging)
- [x] A3 — `NotificationService` (`leave_services/notification_service.py`)
- [x] A4 — `notifications.py` routes (list, unread-count, mark-read, mark-all-read) + wire into `api/main.py`
- [x] A5 — Wire `NotificationService` into `leave_requests.py` (submit/approve/reject)
- [x] A6 — Wire `NotificationService` into `leave_plan_requests.py` (submit/approve/reject)
- [x] A7 — `test_notifications.py` written (NOT run — no local venv; run via `bash scripts/test.sh` or `docker compose exec backend bash scripts/tests-start.sh`)

## Frontend
- [x] B1 — Temporary `notificationsService.ts` (OpenAPI.BASE + fetch, per this repo's documented pattern) used instead — regenerate the real client and delete it once B5's environment is available
- [x] B2 — `NotificationBell.tsx`
- [x] B3 — `NotificationDropdown.tsx`
- [x] B4 — Wire `<NotificationBell />` into `Navbar.tsx`

## Verification (blocked — see below)
- [ ] B5 — Manual two-user browser walkthrough (submit → approve, submit → reject, mark-all-read, navigation)

## Environment blocker (2026-07-14)
This machine has no working backend venv (`uv sync` fails building `httptools`, needs MS C++ Build
Tools) and no `.env` at repo root (docker compose won't start). Nothing above was run — only
written, following existing patterns closely. Before merging: run the migration, run
`bash scripts/lint.sh` + `bash scripts/test.sh`, run `./scripts/generate-client.sh` against a live
backend and delete `notificationsService.ts` in favor of the generated client, then do the B5
walkthrough.

---

# Todo: Account & Identity Enhancements (backend-only; requested from the Flutter client repo)

See `tasks/plan.md` (same section) for full detail. Driven by
`hr-leave-management-flutter/tasks/plan.md` Phase 13 (13.2/13.3/13.4-backend) — that repo's Flutter
work is blocked on this landing first.

## Backend
- [x] C1 — `User.username` (unique, admin-only) + `User.phone_number` (self-editable via
      `UserUpdateMe`) added to `UserBase` (`app/models.py`)
- [x] C2 — Alembic migration `e91b6a2d5f3c_add_username_and_phone_number_to_user.py` (hand-written,
      NOT run — no local venv; verify with `alembic upgrade head` before merging)
- [x] C3 — `crud.get_user_by_username`, `crud.get_user_by_identifier`,
      `crud.authenticate_by_identifier` (existing `crud.authenticate`/`get_user_by_email` untouched,
      so existing tests calling them don't need changes)
- [x] C4 — `POST /login/access-token` now authenticates by username-or-email via
      `authenticate_by_identifier` (`app/api/routes/login.py`)
- [x] C5 — Username uniqueness checks on admin `POST /users/` and `PATCH /users/{id}`
      (`app/api/routes/users.py`), mirroring the existing email-uniqueness checks
- [x] C6 — `test_get_access_token_by_username` added to `tests/api/routes/test_login.py` (NOT run —
      same environment blocker as above)
- [x] C7 — `render.yaml`: Resend SMTP env vars added for real password-reset email delivery in
      production; `SMTP_PASSWORD` is `sync: false` (secret, not in git) — user signed up at
      resend.com; still needs to paste the API key into the Render dashboard for the
      `hr-leave-backend` service before this actually works
- **Decision (2026-07-14):** staying on Resend's sandbox address (`onboarding@resend.dev`) rather
  than verifying a custom domain — `hr-leave-frontend.onrender.com`/`hr-leave-backend.onrender.com`
  are Render-owned subdomains, not a domain the user controls DNS for, so they can't be verified
  with Resend. Sandbox mode only delivers to the Resend account owner's own email, **not** to
  teammates' or other users' real addresses — team members can't receive real forgot-password
  emails yet. Revisit by buying an actual domain (~$10/yr) if/when that becomes a real blocker.

## Environment blocker (same as above, 2026-07-14)
Same no-venv/no-.env situation - C1-C6 were only written, not run. Before merging: run the
migration, run `bash scripts/lint.sh` + `bash scripts/test.sh`, then manually verify (log in with a
test account's username instead of email; confirm an admin can set/edit a username and phone number
via the admin Users screen once the Flutter side lands).
