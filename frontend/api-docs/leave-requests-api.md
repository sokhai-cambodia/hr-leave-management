# Leave Requests API

## Endpoints

- GET `/api/v1/leave-requests/` — List leave requests (paginated)
- POST `/api/v1/leave-requests/` — Create a leave request
- GET `/api/v1/leave-requests/{id}` — Retrieve a leave request by ID
- PUT `/api/v1/leave-requests/{id}` — Update a leave request
- DELETE `/api/v1/leave-requests/{id}` — Delete a leave request
- PUT `/api/v1/leave-requests/{id}/submit` — Submit a draft request
- PUT `/api/v1/leave-requests/{id}/approve` — Approve a submitted request
- PUT `/api/v1/leave-requests/{id}/reject` — Reject a submitted request

All endpoints require authentication via `Authorization: Bearer <token>` unless otherwise noted.

---

## GET `/api/v1/leave-requests/`

Retrieve a paginated list of leave requests.

### Parameters

| Name | Type | In | Description | Default |
|------|------|----|-------------|---------|
| skip | integer | query | Number of items to skip | 0 |
| limit | integer | query | Maximum items to return | 100 |

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{
  "data": [
    {
      "start_date": "2025-12-06",
      "end_date": "2025-12-06",
      "description": "string",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "amount": 0,
      "status": "string",
      "requested_at": "2025-12-06T14:22:47.114Z",
      "submitted_at": "2025-12-06T14:22:47.114Z",
      "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "approval_at": "2025-12-06T14:22:47.114Z",
      "owner": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "full_name": "string",
        "email": "string"
      },
      "leave_type": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "code": "string",
        "name": "string"
      },
      "approver": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "full_name": "string",
        "email": "string"
      }
    }
  ],
  "count": 0
}
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## POST `/api/v1/leave-requests/`

Create a new leave request.

### Request Body

Content-Type: `application/json`

```json
{
  "start_date": "2025-12-05",
  "end_date": "2025-12-07",
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{
  "start_date": "2025-12-06",
  "end_date": "2025-12-06",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 0,
  "status": "string",
  "requested_at": "2025-12-06T14:22:47.114Z",
  "submitted_at": "2025-12-06T14:22:47.114Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approval_at": "2025-12-06T14:22:47.114Z",
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  },
  "approver": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  }
}
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## GET `/api/v1/leave-requests/{id}`

Retrieve a leave request by ID.

### Parameters

- `id` (string, path): UUID of the leave request

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{
  "start_date": "2025-12-06",
  "end_date": "2025-12-06",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 0,
  "status": "string",
  "requested_at": "2025-12-06T14:22:47.114Z",
  "submitted_at": "2025-12-06T14:22:47.114Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approval_at": "2025-12-06T14:22:47.114Z",
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  },
  "approver": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  }
}
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## PUT `/api/v1/leave-requests/{id}`

Update a leave request by ID.

### Parameters

- `id` (string, path): UUID of the leave request

### Request Body

Content-Type: `application/json`

```json
{
  "start_date": "2025-12-05",
  "end_date": "2025-12-07",
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{
  "start_date": "2025-12-06",
  "end_date": "2025-12-06",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 0,
  "status": "string",
  "requested_at": "2025-12-06T14:22:47.114Z",
  "submitted_at": "2025-12-06T14:22:47.114Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approval_at": "2025-12-06T14:22:47.114Z",
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  },
  "approver": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  }
}
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## DELETE `/api/v1/leave-requests/{id}`

Delete a leave request by ID.

### Parameters

- `id` (string, path): UUID of the leave request

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{ "message": "string" }
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## PUT `/api/v1/leave-requests/{id}/submit`

Submit a draft leave request.

### Parameters

- `id` (string, path): UUID of the leave request

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{
  "start_date": "2025-12-06",
  "end_date": "2025-12-06",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 0,
  "status": "string",
  "requested_at": "2025-12-06T14:22:47.114Z",
  "submitted_at": "2025-12-06T14:22:47.114Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approval_at": "2025-12-06T14:22:47.114Z",
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  },
  "approver": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  }
}
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## PUT `/api/v1/leave-requests/{id}/approve`

Approve a submitted leave request.

### Parameters

- `id` (string, path): UUID of the leave request

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{
  "start_date": "2025-12-06",
  "end_date": "2025-12-06",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 0,
  "status": "string",
  "requested_at": "2025-12-06T14:22:47.114Z",
  "submitted_at": "2025-12-06T14:22:47.114Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approval_at": "2025-12-06T14:22:47.114Z",
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  },
  "approver": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  }
}
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## PUT `/api/v1/leave-requests/{id}/reject`

Reject a submitted leave request.

### Parameters

- `id` (string, path): UUID of the leave request

### Successful Response

Status: 200 OK  
Content-Type: `application/json`

```json
{
  "start_date": "2025-12-06",
  "end_date": "2025-12-06",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "amount": 0,
  "status": "string",
  "requested_at": "2025-12-06T14:22:47.114Z",
  "submitted_at": "2025-12-06T14:22:47.114Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approval_at": "2025-12-06T14:22:47.114Z",
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "code": "string",
    "name": "string"
  },
  "approver": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  }
}
```

### Validation Error

Status: 422 Unprocessable Entity  
Content-Type: `application/json`

```json
{
  "detail": [
    { "loc": ["string"], "msg": "string", "type": "string" }
  ]
}
```

---

## Field Descriptions

- `start_date` (string, date): First day of the leave in `YYYY-MM-DD` format
- `end_date` (string, date): Last day of the leave in `YYYY-MM-DD` format
- `description` (string): Reason or additional information for the leave request
- `leave_type_id` (string, UUID): The leave type being requested
- `id` (string, UUID): Unique identifier of the request
- `owner_id` (string, UUID): User ID of the requester (server-assigned)
- `amount` (number): Number of leave days calculated by the system
- `status` (string): Current status. Expected lifecycle: draft → submitted → approved/rejected
- `requested_at` (string, date-time): When the request was created
- `submitted_at` (string, date-time | null): When the request was submitted
- `approver_id` (string, UUID | null): Approver's user ID (when assigned)
- `approval_at` (string, date-time | null): When the request was approved/rejected

### Expanded Fields (Response Only)
- `owner` (object): Owner/requester information
  - `id` (string, UUID): Owner user ID
  - `full_name` (string): Owner's full name
  - `email` (string): Owner's email address
- `leave_type` (object): Expanded leave type information
  - `id` (string, UUID): Leave type unique identifier
  - `code` (string): Leave type code
  - `name` (string): Leave type display name
- `approver` (object | null): Approver information (when assigned)
  - `id` (string, UUID): Approver user ID
  - `full_name` (string): Approver's full name
  - `email` (string): Approver's email address

## Notes

- Date fields use ISO 8601 format. Ensure `start_date` ≤ `end_date`.
- New requests are typically created in a "draft" state and should be submitted before approval.
- Submit/approve/reject endpoints mutate `status`, `approver_id`, and `approval_at` as appropriate.
- The `amount`, `owner`, `leave_type`, and `approver` fields are included in responses for display convenience but are not required in create/update requests.
- The `amount` field represents the calculated number of leave days based on `start_date` and `end_date`.
- Error responses follow FastAPI's validation error schema (422) as shown above.
