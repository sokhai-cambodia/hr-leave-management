# SPEC: In-App Notifications (Leave Requests & Leave Plan Requests)

## 1. Objective

Notify users in-app when leave/leave-plan-request lifecycle events happen, so approvers know when
something needs their attention and owners know when a decision was made — without leaving the app
or relying on email.

**Target users:** all authenticated users of the HR leave-management app — both requesters (owners)
and line approvers (`team.team_owner`).

**Events covered** (both `LeaveRequest` and `LeavePlanRequest`, same rules for each):

| Event    | Recipient                          | Message shape                                      |
|----------|-------------------------------------|-----------------------------------------------------|
| Submit   | the row's `approver_id` (line approver) | "{owner.full_name} submitted a {leave_type.name} request" |
| Approve  | the row's `owner_id`                | "Your {leave_type.name} request was approved"       |
| Reject   | the row's `owner_id`                | "Your {leave_type.name} request was rejected"        |

No self-notification on submit (owner does not get a "you submitted" receipt). No email — in-app only.

## 2. Backend design

### 2.1 New model — `app/leave_models/notification_model.py`

Generic/polymorphic table so one model covers both `LeaveRequest` and `LeavePlanRequest` (and any
future notifiable entity) without duplicating schema:

```python
class Notification(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    recipient_id: uuid.UUID = Field(foreign_key="user.id", nullable=False, ondelete="CASCADE")
    actor_id: uuid.UUID | None = Field(default=None, foreign_key="user.id", ondelete="SET NULL")
    event_type: str = Field(max_length=50)   # "leave_request.submitted" | "leave_request.approved" |
                                              # "leave_request.rejected" | "leave_plan_request.submitted" |
                                              # "leave_plan_request.approved" | "leave_plan_request.rejected"
    entity_type: str = Field(max_length=30)  # "leave_request" | "leave_plan_request"
    entity_id: uuid.UUID
    message: str = Field(max_length=255)     # precomputed human-readable text, not re-derived client-side
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)

    recipient: "User" = Relationship(...)
    actor: "User" = Relationship(...)
```

`message` is precomputed server-side at creation time (not templated client-side) so historical
notifications stay stable even if e.g. a leave type is later renamed.

`NotificationPublic` includes `actor: UserPresentable | None`; `NotificationsPublic` wraps
`data: list[NotificationPublic]`, `count: int` (matches this repo's existing list-response pattern).

### 2.2 New service — `app/leave_services/notification_service.py`

One `NotificationService(session)` with three methods mirroring the approval lifecycle:

- `notify_submitted(row, entity_type, current_user)` — recipient = `row.approver_id`
- `notify_approved(row, entity_type, current_user)` — recipient = `row.owner_id`
- `notify_rejected(row, entity_type, current_user)` — recipient = `row.owner_id`

Each builds the `message` string (needs `leave_type.name` and `owner.full_name`, already loaded via
existing relationships on `row`), creates one `Notification` row, and `session.add()`s it — **no
separate commit**; it rides in the same DB transaction as the status-change commit already in the
route handler, so a notification never exists for a state change that didn't actually persist.

### 2.3 Wire into existing route handlers

In `app/api/routes/leave_requests.py` and `app/api/routes/leave_plan_requests.py`, call the matching
`NotificationService` method inside `submit`/`approve`/`reject`, right before `session.commit()`.
`approval_service.py` itself is not touched — it stays a pure authorization-rule module.

### 2.4 New routes — `app/api/routes/notifications.py`

All scoped to `current_user` as recipient; no cross-user access, no superuser override (a superuser's
notifications are their own, not everyone's).

| Method | Path                          | Purpose |
|--------|--------------------------------|---------|
| GET    | `/notifications/`              | List current user's notifications, newest first. Params: `is_read: bool \| None`, `skip`, `limit`. Returns `NotificationsPublic` (`data`, `count`) — also always includes `unread_count` (total unread regardless of filter) for the badge. |
| GET    | `/notifications/unread-count`  | Cheap `{count: int}` — what the bell badge polls, so the poll loop doesn't pull full rows every tick. |
| PUT    | `/notifications/{id}/read`     | Mark one as read. 403 if `current_user.id != recipient_id`. Idempotent. |
| PUT    | `/notifications/mark-all-read` | Mark all of current user's unread rows read; returns count updated. |

Registered in `app/api/main.py` alongside the other routers.

### 2.5 Migration

`alembic revision --autogenerate -m "add notification table"` after the model is added, then
`alembic upgrade head`.

## 3. Frontend design

### 3.1 Client regen

After the backend changes land and the dev stack is running, run
`./scripts/generate-client.sh` (repo root) to regenerate `frontend/src/client` — this produces the
`NotificationsService` methods and types used below; nothing under `src/client` is hand-written.

### 3.2 Components — `frontend/src/components/Notification/`

- **`NotificationBell.tsx`** — bell icon + unread-count badge, added into `Navbar.tsx` next to
  `UserMenu`. Polls `GET /notifications/unread-count` via TanStack Query
  (`refetchInterval`, e.g. 30s) — matches this app's existing REST-only stack, no websocket infra
  exists anywhere in this codebase today.
- **`NotificationDropdown.tsx`** — opens on bell click, fetches `GET /notifications/?limit=10` on
  open (not on a timer), lists recent notifications, and:
  - a "Mark all as read" action → `PUT /notifications/mark-all-read`, invalidates both queries
  - clicking a single unread notification → `PUT /notifications/{id}/read`, then navigates

No dedicated `/notifications` page or sidebar entry — bell + dropdown is the entire surface, per
scope decision.

### 3.3 Click-through target

There are no per-id detail routes for leave requests today (only list pages: `leave-requests.tsx`,
`leave-plan-requests.tsx`, no `approvals.tsx` route yet). So a notification click navigates to:

- `entity_type: "leave_request"` → `/leave-requests`
- `entity_type: "leave_plan_request"` → `/leave-plan-requests`

(Not deep-linking to the specific row — that list page doesn't currently support a highlight/filter
param. If a future Approvals page or per-id view lands, this is the one place to update.)

## 4. Testing strategy

- Backend: `backend/tests/api/routes/test_notifications.py` — list/filter/unread-count/mark-read/
  mark-all-read, including the 403-on-not-recipient case. Extend
  `test_leave_requests.py`/`test_leave_plan_requests.py` (or add focused tests) asserting a
  `Notification` row is created with the right `recipient_id`/`event_type` on submit/approve/reject.
- Frontend: no existing component-test pattern in this repo for Common/ components (checked — none
  found) — skip unit tests for the bell/dropdown, rely on manual verification (`npx playwright test`
  scope not extended for this feature) unless the user wants Playwright coverage added.

## 5. Boundaries

**Always do:**
- Create the notification in the same DB transaction as the triggering status change.
- Keep `approval_service.py` free of notification logic (pure authorization rules).
- Follow the existing `{Entity}Public`/`{Entities}Public` + presentable-model conventions.

**Ask first:**
- Any change to `approval_service.py`'s existing functions.
- Adding a websocket/SSE layer instead of polling (out of scope per this spec; would need its own
  design pass).
- Extending scope to email delivery (explicitly excluded by the user for this feature).

**Never do:**
- Notify the owner on their own submit (no self-notification), per confirmed scope.
- Let a non-recipient read or mark another user's notification.
- Hand-edit `frontend/src/client/**` — always regenerate from the OpenAPI schema.
