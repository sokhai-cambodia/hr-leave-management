# Leave Plan Recommendation — Project Features & API Spec

Reference doc for reusing the existing FastAPI backend from the Flutter / Android app.
Base URL: `http://<host>:8000` · API prefix: `/api/v1` · Auth: OAuth2 Bearer JWT.

---

## 1. Feature Overview

| Area | What it does |
|---|---|
| **Auth & Users** | Signup, login (OAuth2 password flow), password reset via email, profile self-service, superuser user management |
| **Teams** | Group users under a team with a line approver (`team_owner`) |
| **Leave Types** | Configurable leave categories (e.g. Annual, Sick), each with an entitlement and a flag for whether it's plannable by the AI recommender |
| **Public Holidays** | Holiday calendar, used to detect holidays and "bridge days" (single working day between two off-days) |
| **Policies** | Dynamic, DB-configured scoring rules (`code`/`operation`/`value`/`score`) that drive the AI recommender's day scoring — no code changes needed to tune behavior |
| **Leave Balances** | Per-user, per-leave-type, per-year balance tracking (`balance`, `taken_balance`, computed `available_balance`) |
| **Leave Requests** | Single date-range (start/end) leave request with draft → submit → approve/reject workflow; debits/credits balance automatically |
| **Leave Plan Requests** | Multi-date leave request (a set of individual dates) with the same workflow; designed to consume the AI recommender's output directly |
| **AI Recommendation Engine** | `GET /recommends/leave-plan` — trains a `RandomForestRegressor` per request on a generated yearly dataset (weekday, holiday, bridge-day, team workload, policy-driven preference score) and returns the top N recommended leave dates, where N = the user's remaining entitlement |
| **Utils** | Health check, transactional test email (superuser) |

### Approval rules (shared by Leave Requests & Leave Plan Requests)
- **Submit**: only the owner, only while `status == "draft"`, and only if they have a line approver (`current_user.team.team_owner`). Submitting assigns `approver_id` and sets `status = "pending"`.
- **Approve / Reject**: only the assigned `approver_id`, only while `status == "pending"`.
- **Leave Requests only**: submitting debits the leave balance; rejecting credits it back. (Leave Plan Requests do not currently touch balances on submit/reject — only checked at recommendation time.)
- Superusers can list all records; regular users only see records where they are `owner` or `approver`.

---

## 2. Authentication

### `POST /api/v1/login/access-token`
OAuth2 password flow. Body is `application/x-www-form-urlencoded` (standard OAuth2 form, not JSON):
```
username=<email>&password=<password>
```
Response:
```json
{ "access_token": "<jwt>", "token_type": "bearer" }
```
Token expiry: **8 days** (`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 8`).

All authenticated endpoints require:
```
Authorization: Bearer <access_token>
```

### `POST /api/v1/login/test-token`
Validates the current token, returns `UserPublic`.

### `POST /api/v1/password-recovery/{email}`
Sends password-reset email. Returns `Message`.

### `POST /api/v1/reset-password/`
Body: `{ "token": "...", "new_password": "..." }` → `Message`.

---

## 3. Users — `/api/v1/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/signup` | none | Self-registration (`UserRegister`: email, password, full_name) |
| GET | `/me` | user | Current user profile |
| PATCH | `/me` | user | Update own `full_name` / `email` |
| PATCH | `/me/password` | user | Change own password (`current_password`, `new_password`) |
| DELETE | `/me` | user | Delete own account (blocked for superusers) |
| GET | `/` | superuser | List all users (paginated: `skip`, `limit`) |
| POST | `/` | superuser | Create user |
| GET | `/{user_id}` | user | Get user by id (self or superuser) |
| PATCH | `/{user_id}` | superuser | Update any user |
| DELETE | `/{user_id}` | superuser | Delete any user |

**UserPublic**
```json
{
  "email": "string", "is_active": true, "is_superuser": false,
  "full_name": "string|null", "team_id": "uuid|null", "id": "uuid",
  "team": { "id": "uuid", "name": "string", "team_owner": { "id": "uuid", "full_name": "string", "email": "string" } } | null
}
```

---

## 4. Teams — `/api/v1/teams`

Standard CRUD (`GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`).

**TeamCreate/Update**: `name`, `description?`, `team_owner_id` (uuid), `is_active`
**TeamPublic**: adds `id`, `team_members: UserPresentable[]`, `team_owner: UserPresentable | null`

---

## 5. Leave Types — `/api/v1/leave-types`

Standard CRUD.

**LeaveTypeCreate/Update**: `code`, `name`, `entitlement` (int), `description?`, `is_allow_plan` (bool — whether this type feeds the AI recommender), `is_active`
**LeaveTypePublic**: adds `id`

---

## 6. Public Holidays — `/api/v1/public-holidays`

Standard CRUD.

**PublicHolidayCreate/Update**: `date` (string, `YYYY-MM-DD`), `name`, `description?`
**PublicHolidayPublic**: adds `id`

---

## 7. Policies — `/api/v1/policies`

Standard CRUD. Drives the AI recommender's scoring (see §11).

**PolicyCreate/Update**:
```json
{
  "code": "weekday | bridge_holiday | team_workload",
  "name": "string",
  "operation": "in | > | < | >= | <= | ==",
  "value": "string (e.g. \"[0,4]\", \"True\", \"50%\")",
  "score": 0,
  "description": "string|null",
  "is_active": true
}
```
**PolicyPublic**: adds `id`

---

## 8. Leave Balances — `/api/v1/leave-balances`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all balances (paginated) |
| GET | `/me` | Current user's balances |
| GET | `/{id}` | Get by id |
| POST | `/` | Create |
| PUT | `/{id}` | Update |
| DELETE | `/{id}` | Delete |

**LeaveBalanceCreate/Update**: `year` (string, 4 chars), `balance` (float, default 18), `leave_type_id` (uuid), `owner_id` (uuid)
**LeaveBalancePublic**: adds `id`, `taken_balance`, `available_balance` (computed = `balance - taken_balance`), nested `owner` and `leave_type` (presentable)

---

## 9. Leave Requests — `/api/v1/leave-requests`

Single date-range leave.

| Method | Path | Description |
|---|---|---|
| GET | `/` | List (own + approver rows, or all if superuser) — optional `status`, `owner_id`, `approver_id` query params narrow further (see below) |
| GET | `/{id}` | Get by id |
| POST | `/` | Create (status starts `draft`) |
| PUT | `/{id}` | Update (owner only, `draft` only) |
| DELETE | `/{id}` | Delete (owner only, `draft` only) |
| PUT | `/{id}/submit` | Owner submits → `pending`, assigns approver, **debits balance** |
| PUT | `/{id}/approve` | Approver approves → `approved` |
| PUT | `/{id}/reject` | Approver rejects → `rejected`, **credits balance back** |

**`GET /` query params:** `skip`, `limit` (pagination), plus optional `status` (exact match, e.g. `?status=pending`), `owner_id`, `approver_id` (uuid) to narrow the result. These AND onto the base visibility scope (own + approver rows for non-superusers) rather than replacing it — a non-superuser passing an `owner_id`/`approver_id` that isn't their own `id` has it silently ignored, not rejected. Examples: `?owner_id=<me>&status=pending` (my own pending submissions), `?approver_id=<me>&status=pending` (items awaiting my approval).

**LeaveRequestCreate**: `start_date`, `end_date` (dates), `description?`, `leave_type_id` (uuid)
Validation on create/update: dates must resolve to a positive day count, and the user must have sufficient leave balance — otherwise `400`.

**LeaveRequestPublic**:
```json
{
  "start_date": "date", "end_date": "date", "description": "string|null",
  "id": "uuid", "owner_id": "uuid", "leave_type_id": "uuid",
  "amount": 0, "status": "draft|pending|approved|rejected",
  "requested_at": "datetime", "submitted_at": "datetime|null",
  "approver_id": "uuid|null", "approval_at": "datetime|null",
  "owner": { "id", "full_name", "email" },
  "leave_type": { "id", "code", "name" },
  "approver": { "id", "full_name", "email" } | null
}
```

---

## 10. Leave Plan Requests — `/api/v1/leave-plan-requests`

Multi-date leave (a set of individual `details` dates), designed to be populated from `/recommends/leave-plan` output. Same lifecycle shape as Leave Requests (`GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`, `PUT /{id}/submit`, `PUT /{id}/approve`, `PUT /{id}/reject`), including the same `status`/`owner_id`/`approver_id` optional query params on `GET /` (identical semantics to Leave Requests above).

**LeavePlanRequestCreate/Update**:
```json
{
  "description": "string|null",
  "leave_type_id": "uuid",
  "details": [ { "leave_date": "date" }, ... ]   // duplicate dates rejected with 422
}
```
`amount` is server-computed as `len(details)`.

**LeavePlanRequestPublic**:
```json
{
  "description": "string|null", "id": "uuid", "owner_id": "uuid",
  "leave_type_id": "uuid", "requested_at": "datetime",
  "submitted_at": "datetime|null", "approver_id": "uuid|null",
  "approval_at": "datetime|null", "status": "draft|pending|approved|rejected",
  "amount": 0,
  "details": [ { "id": "uuid", "leave_date": "date" } ],
  "owner": { "id", "full_name", "email" },
  "leave_type": { "id", "code", "name" },
  "approver": { "id", "full_name", "email" } | null
}
```

---

## 11. AI Recommendation Engine — `/api/v1/recommends`

### `GET /recommends/leave-plan?year=<int>`
Auth required. `year` defaults to the current year.

**How it works:**
1. Finds the active leave type with `is_allow_plan == true`, and the current user's remaining balance for it/year (`404` if none, or if balance is `0`).
2. Builds a 365-row dataset for the year: `day_of_year`, `date`, `weekday`, `is_holiday` (weekend or matches `public_holidays`), `bridge_holiday` (single working day flanked by two off-days), `team_workload` (count of teammates' approved plan-detail dates on that day, from `leave_plan_requests` in the same team/year).
3. Applies all active `Policy` rows as scoring rules against the dataset to compute `preference_score` (e.g. weekday in `[0,4]` → `+1`; `bridge_holiday == True` → `+2`; `team_workload > 50%` of team size → `-2`).
4. Trains a `RandomForestRegressor(n_estimators=50)` on `[day_of_year, team_workload] → preference_score` and predicts `predicted_score` for every day.
5. Sorts by `predicted_score` descending and takes the top *N* days, where *N* = the user's available leave balance (entitlement remaining).

**Response — `LeaveRecommendations`:**
```json
{
  "leave_type_id": "uuid",
  "year": 2026,
  "data": [
    {
      "leave_date": "2026-01-02",
      "bridge_holiday": true,
      "team_workload": 2,
      "preference_score": 3,
      "predicted_score": 2.87
    }
  ]
}
```
Sorted by `day_of_year` ascending (chronological) in the final response.

**Error cases:**
- `404` — no active/plannable leave type configured
- `404` — no remaining balance for that leave type/year

**Typical mobile flow:** call this endpoint → present recommended dates to the user → user selects some/all → `POST /leave-plan-requests` with those dates as `details` → `PUT /{id}/submit`.

---

## 12. Approvals — `/api/v1/approvals`

### `GET /approvals/pending-count`
Auth required. Cheap combined count (no row hydration) of pending items assigned to the caller as approver — for a nav badge, not the queue itself (use `GET /leave-requests/?approver_id=<me>&status=pending` + the leave-plan equivalent for the actual list).

**Response:**
```json
{ "leave_requests": 3, "leave_plan_requests": 1, "total": 4 }
```

---

## 13. Schedule — `/api/v1/schedule`

### `GET /schedule/?year=<int>&month=<int 1-12>`
Auth required. Combines public holidays and the caller's team's approved leave into one payload for a month calendar view.

- `public_holidays`: `PublicHolidayPublic` rows whose `date` falls in the given month.
- `team_leave`: unifies `LeaveRequest` (a real date range) and `LeavePlanRequest` (one entry per detail date) into one flat shape, filtered to `status == "approved"` and `team_id == current_user.team_id`. Empty list (not an error) if the caller has no team. Entries whose range *overlaps* the queried month are included, not just ones starting inside it (e.g. a request spanning Jun 29–Jul 2 appears when querying July too).

**Response:**
```json
{
  "year": 2026,
  "month": 7,
  "public_holidays": [
    { "id": "uuid", "date": "2026-07-04", "name": "Independence Day", "description": null }
  ],
  "team_leave": [
    {
      "id": "uuid",
      "source": "leave_request",
      "owner": { "id", "full_name", "email" },
      "leave_type": { "id", "code", "name" },
      "start_date": "2026-07-10",
      "end_date": "2026-07-12"
    },
    {
      "id": "uuid",
      "source": "leave_plan_request",
      "owner": { "id", "full_name", "email" },
      "leave_type": { "id", "code", "name" },
      "start_date": "2026-07-20",
      "end_date": "2026-07-20"
    }
  ]
}
```

---

## 14. Utils — `/api/v1/utils`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health-check/` | none | Returns `true` |
| POST | `/test-email/` | superuser | Sends a test email |

---

## 15. Common Error Codes

| Status | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad request (e.g. invalid dates, insufficient balance) |
| 401 | Missing/invalid token |
| 403 | Insufficient permissions |
| 404 | Not found |
| 422 | Validation error (bad payload, duplicate dates, etc.) |
| 500 | Server error |

---

## 16. Notes for Flutter / Android Integration

- Reuse the OAuth2 bearer flow as-is — no changes needed server-side for native clients.
- An OpenAPI schema is already generated for the React frontend (see `frontend/openapi-ts.config.ts` and `scripts/generate-client.sh`); pulling `http://<host>:8000/api/v1/openapi.json` is the fastest way to generate typed Dart models instead of hand-writing them.
- Per-resource docs with example cURL requests/responses already exist in `frontend/api-docs/*.md` — this file consolidates them into one spec; refer to those for extra request/response examples if needed.
- Nested `owner`/`approver`/`leave_type`/`team` objects in responses use trimmed "presentable" shapes (`id`, `full_name`, `email` / `id`, `code`, `name`), not the full resource — don't expect every field there.
