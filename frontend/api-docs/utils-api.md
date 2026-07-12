# Utils API Reference

## Base URL
```
http://localhost:8000
```

## Utils API

### Health Check
Check the health status of the API.

**Endpoint:** `GET /api/v1/utils/health-check`

**Authentication:** Not required

#### Parameters

No parameters required.

#### Request Body

No request body required.

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
true
```

**Response Fields:**

- Returns a boolean value `true` indicating the API is healthy and operational

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/v1/utils/health-check"
```

#### Example Response

```json
true
```

#### Notes

- This endpoint is used for health checks and monitoring.
- No authentication required - this is a public endpoint.
- Typically used by load balancers, monitoring systems, and orchestration tools.
- A successful response indicates the API is running and can accept requests.
- Can be used for readiness and liveness probes in containerized environments.

---

### Test Email
Test email functionality by sending a test email to a specified recipient.

**Endpoint:** `POST /api/v1/utils/test-email`

**Authentication:** Not specified

#### Parameters

**Query Parameters:**

| Parameter  | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| email_to  | string | Yes      | Email address to send the test email to |

#### Request Body

No request body required.

#### Response

**Success Response (201)**

Content-Type: `application/json`

```json
{
  "message": "string"
}
```

**Response Fields:**

- `message` (string): Confirmation message indicating the test email was sent successfully

**Error Response (422 Unprocessable Entity)**

Content-Type: `application/json`

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

**Error Fields:**

- `detail` (array): Array of validation error objects
  - `loc` (array): Location of the error (e.g., ["query", "email_to"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X POST "http://localhost:8000/api/v1/utils/test-email?email_to=test@example.com" \
  -H "Content-Type: application/json"
```

#### Example Response

```json
{
  "message": "Test email sent successfully"
}
```

#### Notes

- This endpoint is used for testing email functionality in the system.
- Ensure that email configuration is properly set up before using this endpoint.
- The email_to parameter must be a valid email address format.
- This is typically used for development and testing purposes.
- Consider restricting access to this endpoint in production environments.

---

## Error Codes

| Status Code | Description                                      |
|-------------|--------------------------------------------------|
| 201         | Successful operation - Test email sent           |
| 422         | Validation Error - Invalid email parameter       |
| 500         | Internal Server Error                            |
