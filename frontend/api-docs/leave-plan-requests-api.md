# Leave Plan Requests API

## Endpoints

### GET `/api/v1/leave-plan-requests/`

Retrieve a paginated list of leave plan requests.

#### Parameters

| Name | Type   | In    | Description                 | Default |
|------|--------|-------|-----------------------------|---------|
| skip | integer| query | Number of items to skip     | 0       |
| limit| integer| query | Maximum items to return     | 100     |

#### Successful Response

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "data": [
    {
      "description": "string",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "requested_at": "2025-12-05T12:10:46.073Z",
      "submitted_at": "2025-12-05T12:10:46.073Z",
      "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "approved_at": "2025-12-05T12:10:46.073Z",
      "status": "string",
      "amount": 0,
      "details": [],
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

##### Response Fields

- `data`: Array of leave plan request objects
  - `id`: string — Unique identifier (UUID)
  - `description`: string — Reason or description for the leave request
  - `owner_id`: string — UUID of the requester
  - `leave_type_id`: string — UUID of the leave type
  - `requested_at`: string(date-time) — When the request was created
  - `submitted_at`: string(date-time) — When the request was formally submitted
  - `approver_id`: string | null — UUID of the approver (if assigned)
  - `approved_at`: string(date-time | null) — When the request was approved (if applicable)
  - `status`: string — Current status (e.g., "draft", "pending", "approved", "rejected")
  - `amount`: number — Total amount of leave days (supports half-day with 0.5)
  - `details`: array — Per-date details
  - `owner`: object — Owner user details
    - `id`: string — User UUID
    - `full_name`: string — User's full name
    - `email`: string — User's email
  - `leave_type`: object — Leave type details
    - `id`: string — Leave type UUID
    - `code`: string — Leave type code
    - `name`: string — Leave type name
  - `approver`: object | null — Approver user details (null if not assigned)
    - `id`: string — User UUID
    - `full_name`: string — User's full name
    - `email`: string — User's email
- `count`: integer — Total number of requests

#### Validation Error

**Status:** 422 Unprocessable Entity  
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### POST `/api/v1/leave-plan-requests/`

Create a new leave plan request.

#### Request Body

**Content-Type:** application/json

```json
{
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "details": [
    {
      "leave_date": "2025-11-15"
    }
  ]
}
```

##### Request Fields

- `description`: string — Reason or description for the leave request (required)
- `leave_type_id`: string — UUID of the leave type (required)
- `details`: array — List of dates to take leave on; each item has `leave_date` in `YYYY-MM-DD` format (at least one item required)

#### Successful Response

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-11-15T10:27:57.140Z",
  "submitted_at": "2025-11-15T10:27:57.140Z",
  "approved_at": null,
  "approver_id": null,
  "status": "draft",
  "details": [],
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  },
  "leave_type": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  },
  "approver": null
}
```

#### Validation Error

**Status:** 422 Unprocessable Entity  
**Content-Type:** application/json

```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### Get Leave Plan Request by ID
```
GET /api/v1/leave-plan-requests/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Response (200 Successful Response):**
```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-12-05T12:11:25.639Z",
  "submitted_at": "2025-12-05T12:11:25.639Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": "2025-12-05T12:11:25.639Z",
  "status": "string",
  "amount": 0,
  "details": [],
  "owner": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "full_name": "string",
    "email": "string"
  }
}
```

**Validation Error (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### PUT `/api/v1/leave-plan-requests/{id}`

Update a leave plan request by ID.

**Parameters:**
- `id` (path, required): string($uuid)

**Request Body:**

**Content-Type:** application/json

```json
{
  "description": "string",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "details": [
    {
      "leave_date": "2025-11-15"
    }
  ]
}
```

**Response (200 Successful Response):**
```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-12-05T12:11:48.883Z",
  "submitted_at": "2025-12-05T12:11:48.883Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": "2025-12-05T12:11:48.883Z",
  "status": "string",
  "amount": 0,
  "details": [],
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

**Validation Error (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### Delete Leave Plan Request
```
DELETE /api/v1/leave-plan-requests/{id}
```

**Parameters:**
- `id` (path, required): string($uuid)

**Response (200 Successful Response):**
```json
{
  "message": "string"
}
```

**Validation Error (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### PUT `/api/v1/leave-plan-requests/{id}/submit`

Submit a leave plan request for approval.

**Parameters:**
- `id` (path, required): string($uuid)

**Successful Response**

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-12-05T12:12:23.036Z",
  "submitted_at": "2025-12-05T12:12:23.036Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": null,
  "status": "pending",
  "amount": 0,
  "details": [],
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

**Validation Error (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### PUT `/api/v1/leave-plan-requests/{id}/approve`

Approve a leave plan request.

**Parameters:**
- `id` (path, required): string($uuid)

**Successful Response**

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-12-05T12:12:35.886Z",
  "submitted_at": "2025-12-05T12:12:35.886Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": "2025-12-05T12:12:35.886Z",
  "status": "approved",
  "amount": 0,
  "details": [],
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

**Validation Error (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

### PUT `/api/v1/leave-plan-requests/{id}/reject`

Reject a leave plan request.

**Parameters:**
- `id` (path, required): string($uuid)

**Successful Response**

**Status:** 200 OK  
**Content-Type:** application/json

```json
{
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "owner_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "leave_type_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "requested_at": "2025-12-05T12:12:47.003Z",
  "submitted_at": "2025-12-05T12:12:47.003Z",
  "approver_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "approved_at": "2025-12-05T12:12:47.003Z",
  "status": "rejected",
  "amount": 0,
  "details": [],
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

**Validation Error (422 Unprocessable Entity):**
```json
{
  "detail": [
    {
      "loc": ["string"],
      "msg": "string",
      "type": "string"
    }
  ]
}
```

## Field Descriptions

- `description`: Reason or description for the leave request
- `leave_type_id`: UUID of the leave type being requested
- `owner_id`: UUID of the user who created the request (auto-assigned)
- `approver_id`: UUID of the user responsible for approving the request (null if not assigned)
- `requested_at`: Timestamp when the request was created
- `submitted_at`: Timestamp when the request was submitted for approval
- `approved_at`: Timestamp when the request was approved (null if pending or rejected)
- `status`: Current status of the request (e.g., "draft", "pending", "approved", "rejected")
- `amount`: Total amount of leave days requested (supports half-day with 0.5)
- `details`: Array of leave date details, each containing a `leave_date` field
- `owner`: Nested object containing owner user details (id, full_name, email)
- `leave_type`: Nested object containing leave type details (id, code, name)
- `approver`: Nested object containing approver user details (id, full_name, email), or null if not assigned

## Status Values

- `draft`: Request is created but not yet submitted
- `pending`: Request is submitted and awaiting approval
- `approved`: Request has been approved
- `rejected`: Request has been rejected

## Notes

- The `owner_id` is automatically set to the authenticated user when creating a request
- The `details` array contains objects with `leave_date` field in ISO 8601 format (YYYY-MM-DD)
- Only the request owner can update/delete the request when status is "draft"
- Use the submit endpoint to change status from "draft" to "pending"
- Use the approve/reject endpoints to finalize the request
