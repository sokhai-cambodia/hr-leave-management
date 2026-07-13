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
