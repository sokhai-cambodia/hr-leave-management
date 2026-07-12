# Public Holidays API Reference

## Overview
API endpoints for managing public holidays in the system.

---

## Endpoints

### List Public Holidays

Retrieve a paginated list of public holidays.

**Endpoint:** `GET /api/v1/public-holidays/`

**Authentication:** Required (Bearer Token)

#### Parameters

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `skip` | integer | No | 0 | Number of records to skip for pagination |
| `limit` | integer | No | 100 | Maximum number of records to return |

#### Response

**Status Code:** `200 OK`

**Response Schema:**

```json
{
  "data": [
    {
      "name": "string",
      "date": "YYYY-MM-DD",
      "description": "string",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
  ],
  "count": 0
}
```

**Fields:**

- `data` (array): List of public holiday objects
  - `name` (string): Name of the holiday
  - `date` (string): Date of the holiday in ISO format (YYYY-MM-DD)
  - `description` (string): Description of the holiday
  - `id` (string): Unique identifier (UUID format)
- `count` (integer): Total number of public holidays

#### Example Request

```bash
curl -X GET "http://localhost/api/v1/public-holidays/?skip=0&limit=100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "data": [
    {
      "name": "Christmas",
      "date": "2025-12-25",
      "description": "Christmas Day",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
    }
  ],
  "count": 1
}
```

#### Error Responses

**Status Code:** `422 Unprocessable Entity`

Validation error occurred.

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

---

### Create Public Holiday

Create a new public holiday.

**Endpoint:** `POST /api/v1/public-holidays/`

**Authentication:** Required (Bearer Token)

#### Parameters

No query parameters.

#### Request Body

**Required**

**Content Type:** `application/json`

**Schema:**

```json
{
  "date": "YYYY-MM-DD",
  "name": "string",
  "description": "string"
}
```

**Fields:**

- `date` (string, required): Date of the holiday in ISO format (YYYY-MM-DD)
- `name` (string, required): Name of the holiday
- `description` (string, required): Description of the holiday

#### Response

**Status Code:** `200 OK`

**Response Schema:**

```json
{
  "date": "string",
  "name": "Untitled",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Fields:**

- `date` (string): Date of the created holiday in ISO format (YYYY-MM-DD)
- `name` (string): Name of the holiday
- `description` (string): Description of the holiday
- `id` (string): Unique identifier (UUID format)

#### Example Request

```bash
curl -X POST "http://localhost/api/v1/public-holidays/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-11-09",
    "name": "Independence Day",
    "description": "Cambodia Independence Day"
  }'
```

#### Example Response

```json
{
  "date": "2025-11-09",
  "name": "Independence Day",
  "description": "Cambodia Independence Day",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

#### Error Responses

**Status Code:** `422 Unprocessable Entity`

Validation error occurred (e.g., missing required fields, invalid date format).

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

---

### Retrieve Public Holiday by ID

Retrieve details of a specific public holiday by its unique identifier.

**Endpoint:** `GET /api/v1/public-holidays/{id}`

**Authentication:** Required (Bearer Token)

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier of the public holiday |

#### Response

**Status Code:** `200 OK`

**Response Schema:**

```json
{
  "date": "string",
  "name": "Untitled",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Fields:**

- `date` (string): Date of the holiday in ISO format (YYYY-MM-DD)
- `name` (string): Name of the holiday
- `description` (string): Description of the holiday
- `id` (string): Unique identifier (UUID format)

#### Example Request

```bash
curl -X GET "http://localhost/api/v1/public-holidays/{id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "date": "2025-12-25",
  "name": "Christmas",
  "description": "Christmas Day",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

#### Error Responses

**Status Code:** `422 Unprocessable Entity`

Validation error occurred (e.g., invalid UUID format).

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

---

### Update Public Holiday

Update details of an existing public holiday.

**Endpoint:** `PUT /api/v1/public-holidays/{id}`

**Authentication:** Required (Bearer Token)

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier of the public holiday |

#### Request Body

**Required**

**Content Type:** `application/json`

**Schema:**

```json
{
  "date": "YYYY-MM-DD",
  "name": "string",
  "description": "string"
}
```

**Fields:**

- `date` (string, required): Date of the holiday in ISO format (YYYY-MM-DD)
- `name` (string, required): Name of the holiday
- `description` (string, required): Description of the holiday

#### Response

**Status Code:** `200 OK`

**Response Schema:**

```json
{
  "date": "string",
  "name": "Untitled",
  "description": "string",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Fields:**

- `date` (string): Updated date of the holiday in ISO format (YYYY-MM-DD)
- `name` (string): Updated name of the holiday
- `description` (string): Updated description of the holiday
- `id` (string): Unique identifier (UUID format)

#### Example Request

```bash
curl -X PUT "http://localhost/api/v1/public-holidays/{id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2025-12-31",
    "name": "Updated Holiday",
    "description": "Updated description"
  }'
```

#### Example Response

```json
{
  "date": "2025-12-31",
  "name": "Updated Holiday",
  "description": "Updated description",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

#### Error Responses

**Status Code:** `422 Unprocessable Entity`

Validation error occurred (e.g., missing required fields, invalid date format).

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

---

### Delete Public Holiday

Delete an existing public holiday by its unique identifier.

**Endpoint:** `DELETE /api/v1/public-holidays/{id}`

**Authentication:** Required (Bearer Token)

#### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier of the public holiday |

#### Response

**Status Code:** `200 OK`

**Response Schema:**

```json
{
  "message": "string"
}
```

**Fields:**

- `message` (string): Confirmation message indicating successful deletion

#### Example Request

```bash
curl -X DELETE "http://localhost/api/v1/public-holidays/{id}" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "message": "Public holiday deleted successfully"
}
```

#### Error Responses

**Status Code:** `422 Unprocessable Entity`

Validation error occurred (e.g., invalid UUID format).

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

---

## Common Use Cases

### Get All Public Holidays

To retrieve all public holidays without pagination:

```bash
GET /api/v1/public-holidays/?limit=1000
```

### Paginate Through Public Holidays

To get the first 10 holidays:

```bash
GET /api/v1/public-holidays/?skip=0&limit=10
```

To get the next 10 holidays:

```bash
GET /api/v1/public-holidays/?skip=10&limit=10
```

### Create a New Public Holiday

To add a new public holiday to the system:

```bash
POST /api/v1/public-holidays/
Content-Type: application/json

{
  "date": "2026-01-01",
  "name": "New Year's Day",
  "description": "First day of the year"
}
```

---

## Notes

- All dates are in ISO 8601 format (`YYYY-MM-DD`)
- The `id` field uses UUID v4 format
- Default pagination returns up to 100 records
- Authentication is required for all endpoints
