# API Reference Documentation

## Base URL
```
http://localhost:8000
```

## Users API

### Register User
Create new user without the need to be logged in.

**Endpoint:** `POST /api/v1/users/signup`

**Authentication:** Not required (Public endpoint)

#### Parameters

No parameters required.

#### Request Body (Required)

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "password": "string",
  "full_name": "string"
}
```

**Request Fields:**

- `email` (string, required): User's email address
- `password` (string, required): User's password
- `full_name` (string, optional): User's full name

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  }
}
```

**Response Fields:**

- `email` (string): User's email address
- `is_active` (boolean): Whether the user account is active (default: true)
- `is_superuser` (boolean): Whether the user has superuser privileges (default: false)
- `full_name` (string): User's full name
- `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
- `id` (string): Unique identifier (UUID format)
- `team` (object, nullable): Team information
  - `id` (string): Team's unique identifier (UUID format)
  - `name` (string): Team's name

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
  - `loc` (array): Location of the error (e.g., ["body", "email"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X POST "http://localhost:8000/api/v1/users/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123!",
    "full_name": "New User"
  }'
```

#### Example Response

```json
{
  "email": "newuser@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "New User",
  "team_id": null,
  "id": "9ba85f64-5717-4562-b3fc-2c963f66afa9",
  "team": null
}
```

#### Notes

- This is a public endpoint - no authentication required.
- Users can self-register through this endpoint.
- New users are created with `is_active: true` and `is_superuser: false` by default.
- Email must be unique in the system.
- Password should meet security requirements (minimum length, complexity, etc.).
- Consider implementing rate limiting to prevent abuse.
- May require email verification before account activation (depending on implementation).

---

## Private API

### Create User (Private)
Create a new user via the private API endpoint.

**Endpoint:** `POST /api/v1/private/users/`

**Authentication:** Not required (Internal/Private endpoint - typically used for testing or internal services)

#### Parameters

No parameters required.

#### Request Body (Required)

Content-Type: `application/json`

```json
{
  "email": "string",
  "password": "string",
  "full_name": "string",
  "is_verified": false
}
```

**Request Fields:**

- `email` (string, required): User's email address
- `password` (string, required): User's password
- `full_name` (string, required): User's full name
- `is_verified` (boolean, optional): Whether the user's email is verified (default: false)

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  }
}
```

**Response Fields:**

- `email` (string): User's email address
- `is_active` (boolean): Whether the user account is active (default: true)
- `is_superuser` (boolean): Whether the user has superuser privileges (default: false)
- `full_name` (string): User's full name
- `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
- `id` (string): Unique identifier (UUID format)
- `team` (object, nullable): Team information
  - `id` (string): Team's unique identifier (UUID format)
  - `name` (string): Team's name

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
  - `loc` (array): Location of the error (e.g., ["body", "email"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X POST "http://localhost:8000/api/v1/private/users/" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "SecurePassword123!",
    "full_name": "Test User",
    "is_verified": true
  }'
```

#### Example Response

```json
{
  "email": "testuser@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "Test User",
  "team_id": null,
  "id": "9ba85f64-5717-4562-b3fc-2c963f66afa9",
  "team": null
}
```

#### Notes

- This is a **private/internal** endpoint intended for testing and internal services.
- This endpoint should NOT be exposed in production environments.
- Unlike the public signup endpoint, this allows setting `is_verified` directly.
- The `full_name` field is **required** (unlike public signup where it's optional).
- New users are created with `is_active: true` and `is_superuser: false` by default.
- Email must be unique in the system.
- Password should meet security requirements (minimum length, complexity, etc.).

---

## Users API

### Create User
Create a new user.

**Endpoint:** `POST /api/v1/users/`

**Authentication:** Required (Superuser only)

#### Request Body (Required)

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "password": "string"
}
```

**Request Fields:**

- `email` (string, required): User's email address
- `is_active` (boolean, optional): Whether the user account is active (default: true)
- `is_superuser` (boolean, optional): Whether the user has superuser privileges (default: false)
- `full_name` (string, optional): User's full name
- `team_id` (string, optional): ID of the team the user belongs to (UUID format)
- `password` (string, required): User's password

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  }
}
```

**Response Fields:**

- `email` (string): User's email address
- `is_active` (boolean): Whether the user account is active
- `is_superuser` (boolean): Whether the user has superuser privileges
- `full_name` (string): User's full name
- `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
- `id` (string): Unique identifier (UUID format)
- `team` (object, nullable): Team information
  - `id` (string): Team's unique identifier (UUID format)
  - `name` (string): Team's name

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
  - `loc` (array): Location of the error (e.g., ["body", "email"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X POST "http://localhost:8000/api/v1/users/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "is_active": true,
    "is_superuser": false,
    "full_name": "New User",
    "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "password": "SecurePassword123!"
  }'
```

#### Example Response

```json
{
  "email": "newuser@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "New User",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "9ba85f64-5717-4562-b3fc-2c963f66afa9",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Engineering Team"
  }
}
```

#### Notes

- This endpoint requires superuser authentication.
- The password is not returned in the response for security reasons.
- Email must be unique in the system.
- Password should meet security requirements (minimum length, complexity, etc.).

---

### Read User Me
Get current authenticated user.

**Endpoint:** `GET /api/v1/users/me`

**Authentication:** Required

#### Parameters

No parameters required.

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  }
}
```

**Response Fields:**

- `email` (string): User's email address
- `is_active` (boolean): Whether the user account is active
- `is_superuser` (boolean): Whether the user has superuser privileges
- `full_name` (string): User's full name
- `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
- `id` (string): Unique identifier (UUID format)
- `team` (object, nullable): Team information
  - `id` (string): Team's unique identifier (UUID format)
  - `name` (string): Team's name

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "email": "john.doe@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "John Doe",
  "team_id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
  "id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
  "team": {
    "id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
    "name": "Engineering Team"
  }
}
```

#### Notes

- This endpoint returns information about the currently authenticated user based on the access token.
- No user ID parameter is needed - the user is identified from the authentication token.
- Commonly used for profile pages and user-specific functionality.

---

### Delete User Me
Delete own user account.

**Endpoint:** `DELETE /api/v1/users/me`

**Authentication:** Required

#### Parameters

No parameters required.

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "message": "string"
}
```

**Response Fields:**

- `message` (string): Confirmation message indicating successful deletion

#### Example Request

```bash
curl -X DELETE "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "message": "User account successfully deleted"
}
```

#### Notes

- This endpoint allows users to delete their own account.
- The user is identified from the authentication token - no user ID parameter needed.
- This action is typically irreversible - implement with appropriate confirmation prompts in the UI.
- After successful deletion, the user's access token will become invalid.
- Consider implementing a grace period or soft delete mechanism for account recovery.

---

### Update User Me
Update own user information.

**Endpoint:** `PATCH /api/v1/users/me`

**Authentication:** Required

#### Parameters

No parameters required.

#### Request Body (Required)

Content-Type: `application/json`

```json
{
  "full_name": "string",
  "email": "user@example.com"
}
```

**Request Fields:**

- `full_name` (string, optional): User's full name
- `email` (string, optional): User's email address

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  }
}
```

**Response Fields:**

- `email` (string): User's email address
- `is_active` (boolean): Whether the user account is active
- `is_superuser` (boolean): Whether the user has superuser privileges
- `full_name` (string): User's full name
- `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
- `id` (string): Unique identifier (UUID format)
- `team` (object, nullable): Team information
  - `id` (string): Team's unique identifier (UUID format)
  - `name` (string): Team's name

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
  - `loc` (array): Location of the error (e.g., ["body", "email"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X PATCH "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Updated Doe",
    "email": "john.updated@example.com"
  }'
```

#### Example Response

```json
{
  "email": "john.updated@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "John Updated Doe",
  "team_id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
  "id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
  "team": {
    "id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
    "name": "Engineering Team"
  }
}
```

#### Notes

- This endpoint allows users to update their own profile information.
- The user is identified from the authentication token - no user ID parameter needed.
- Only the fields provided in the request body will be updated (partial update).
- Email must be unique in the system.
- Users cannot change their own `is_active` or `is_superuser` status through this endpoint.

---

### Update Password Me
Update own password.

**Endpoint:** `PATCH /api/v1/users/me/password`

**Authentication:** Required

#### Parameters

No parameters required.

#### Request Body (Required)

Content-Type: `application/json`

```json
{
  "current_password": "string",
  "new_password": "string"
}
```

**Request Fields:**

- `current_password` (string, required): User's current password for verification
- `new_password` (string, required): New password to set

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "message": "string"
}
```

**Response Fields:**

- `message` (string): Confirmation message indicating successful password update

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
  - `loc` (array): Location of the error (e.g., ["body", "current_password"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X PATCH "http://localhost:8000/api/v1/users/me/password" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "OldPassword123!",
    "new_password": "NewSecurePassword456!"
  }'
```

#### Example Response

```json
{
  "message": "Password updated successfully"
}
```

#### Notes

- This endpoint allows users to change their own password.
- The user is identified from the authentication token - no user ID parameter needed.
- The current password must be provided and verified before the new password is set.
- The new password should meet security requirements (minimum length, complexity, etc.).
- After successful password update, existing access tokens remain valid (user does not need to log in again).
- Consider implementing rate limiting to prevent brute force attacks on the current password verification.

---

### Read User By ID
Get a specific user by ID.

**Endpoint:** `GET /api/v1/users/{user_id}`

**Authentication:** Required

#### Path Parameters

| Parameter | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| user_id   | string | Yes      | User ID (UUID format)            |

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  }
}
```

**Response Fields:**

- `email` (string): User's email address
- `is_active` (boolean): Whether the user account is active
- `is_superuser` (boolean): Whether the user has superuser privileges
- `full_name` (string): User's full name
- `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
- `id` (string): Unique identifier (UUID format)
- `team` (object, nullable): Team information
  - `id` (string): Team's unique identifier (UUID format)
  - `name` (string): Team's name

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
  - `loc` (array): Location of the error (e.g., ["path", "user_id"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X GET "http://localhost:8000/api/v1/users/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "email": "john.doe@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "John Doe",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Engineering Team"
  }
}
```

#### Notes

- This endpoint requires authentication.
- The user_id must be a valid UUID format.
- Returns 404 if the user is not found.
- May require appropriate permissions to view other users' information (depending on implementation).

---

### Update User
Update a user.

**Endpoint:** `PATCH /api/v1/users/{user_id}`

**Authentication:** Required (Superuser only)

#### Path Parameters

| Parameter | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| user_id   | string | Yes      | User ID (UUID format)            |

#### Request Body (Required)

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": false,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "password": "string"
}
```

**Request Fields:**

- `email` (string, optional): User's email address
- `is_active` (boolean, optional): Whether the user account is active
- `is_superuser` (boolean, optional): Whether the user has superuser privileges
- `full_name` (string, optional): User's full name
- `team_id` (string, optional): ID of the team the user belongs to (UUID format)
- `password` (string, optional): New password for the user

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "email": "user@example.com",
  "is_active": true,
  "is_superuser": false,
  "full_name": "string",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "string"
  }
}
```

**Response Fields:**

- `email` (string): User's email address
- `is_active` (boolean): Whether the user account is active
- `is_superuser` (boolean): Whether the user has superuser privileges
- `full_name` (string): User's full name
- `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
- `id` (string): Unique identifier (UUID format)
- `team` (object, nullable): Team information
  - `id` (string): Team's unique identifier (UUID format)
  - `name` (string): Team's name

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
  - `loc` (array): Location of the error (e.g., ["body", "email"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X PATCH "http://localhost:8000/api/v1/users/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated.user@example.com",
    "is_active": false,
    "is_superuser": false,
    "full_name": "Updated User Name",
    "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
  }'
```

#### Example Response

```json
{
  "email": "updated.user@example.com",
  "is_active": false,
  "is_superuser": false,
  "full_name": "Updated User Name",
  "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "team": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "name": "Engineering Team"
  }
}
```

#### Notes

- This endpoint requires superuser authentication.
- The user_id must be a valid UUID format.
- Only the fields provided in the request body will be updated (partial update).
- Superusers can update any user's information, including their status and permissions.
- Email must be unique in the system.
- Password is optional; if provided, it will update the user's password.
- Password is not returned in the response for security reasons.
- Returns 404 if the user is not found.

---

### Delete User
Delete a user.

**Endpoint:** `DELETE /api/v1/users/{user_id}`

**Authentication:** Required (Superuser only)

#### Path Parameters

| Parameter | Type   | Required | Description                      |
|-----------|--------|----------|----------------------------------|
| user_id   | string | Yes      | User ID (UUID format)            |

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "message": "string"
}
```

**Response Fields:**

- `message` (string): Confirmation message indicating successful deletion

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
  - `loc` (array): Location of the error (e.g., ["path", "user_id"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
curl -X DELETE "http://localhost:8000/api/v1/users/3fa85f64-5717-4562-b3fc-2c963f66afa6" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "message": "User successfully deleted"
}
```

#### Notes

- This endpoint requires superuser authentication.
- The user_id must be a valid UUID format.
- Allows superusers to delete any user account.
- This action is typically irreversible - implement with appropriate confirmation prompts in the UI.
- Returns 404 if the user is not found.
- Consider implementing restrictions to prevent superusers from deleting themselves.
- Consider implementing a soft delete mechanism for account recovery and data retention.

---

### Read Users
Retrieve a paginated list of users.

**Endpoint:** `GET /api/v1/users/`

**Authentication:** Required

#### Query Parameters

| Parameter | Type    | Required | Default | Description                        |
|-----------|---------|----------|---------|-------------------------------------|
| skip      | integer | No       | 0       | Number of records to skip          |
| limit     | integer | No       | 100     | Maximum number of records to return |

#### Response

**Success Response (200 OK)**

Content-Type: `application/json`

```json
{
  "data": [
    {
      "email": "user@example.com",
      "is_active": true,
      "is_superuser": false,
      "full_name": "string",
      "team_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "team": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "name": "string"
      }
    }
  ],
  "count": 0
}
```

**Response Fields:**

- `data` (array): Array of user objects
  - `email` (string): User's email address
  - `is_active` (boolean): Whether the user account is active
  - `is_superuser` (boolean): Whether the user has superuser privileges
  - `full_name` (string): User's full name
  - `team_id` (string, nullable): ID of the team the user belongs to (UUID format)
  - `id` (string): Unique identifier (UUID format)
  - `team` (object, nullable): Team information
    - `id` (string): Team's unique identifier (UUID format)
    - `name` (string): Team's name
- `count` (integer): Total number of users returned

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
  - `loc` (array): Location of the error (e.g., ["query", "skip"])
  - `msg` (string): Error message describing the validation failure
  - `type` (string): Type of validation error

#### Example Request

```bash
# Get first 10 users
curl -X GET "http://localhost:8000/api/v1/users/?skip=0&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get next 10 users (pagination)
curl -X GET "http://localhost:8000/api/v1/users/?skip=10&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### Example Response

```json
{
  "data": [
    {
      "email": "admin@example.com",
      "is_active": true,
      "is_superuser": true,
      "full_name": "Admin User",
      "team_id": null,
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "team": null
    },
    {
      "email": "john.doe@example.com",
      "is_active": true,
      "is_superuser": false,
      "full_name": "John Doe",
      "team_id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
      "id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
      "team": {
        "id": "7ba85f64-5717-4562-b3fc-2c963f66afa7",
        "name": "Engineering Team"
      }
    }
  ],
  "count": 2
}
```

#### Notes

- This endpoint requires authentication. Include a valid access token in the Authorization header.
- Use `skip` and `limit` parameters for pagination through large datasets.
- The default limit is 100 users per request.
- All user IDs are in UUID format.

---

## Error Codes

| Status Code | Description                                      |
|-------------|--------------------------------------------------|
| 200         | Successful operation                             |
| 401         | Unauthorized - Invalid or missing access token   |
| 403         | Forbidden - Insufficient permissions             |
| 422         | Validation Error - Invalid query parameters      |
| 500         | Internal Server Error                            |
