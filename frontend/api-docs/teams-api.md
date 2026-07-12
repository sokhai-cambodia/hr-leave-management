# Teams API Documentation

## Overview
This document describes the API endpoints for managing teams in the system. All endpoints require authentication and return JSON responses.

---

## Endpoints

### 1. List Teams
- **GET** `/api/v1/teams/`
- **Description:** Retrieve a list of teams.
- **Query Parameters:**
  - `skip` (integer, default: 0): Number of records to skip.
  - `limit` (integer, default: 100): Maximum number of records to return.
- **Response:**
```json
{
  "data": [
    {
      "name": "string",
      "description": "string",
      "team_owner_id": "uuid",
      "is_active": true,
      "id": "uuid",
      "team_members": [
        {
          "id": "uuid",
          "name": "string",
          "email": "string"
        }
      ],
      "full_name": "string",
      "email": "string"
    }
  ],
  "count": 0
}
```

---

### 2. Create Team
- **POST** `/api/v1/teams/`
- **Description:** Create a new team.
- **Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "team_owner_id": "uuid",
  "is_active": true
}
```
- **Response:**
```json
{
  "name": "string",
  "description": "string",
  "team_owner_id": "uuid",
  "is_active": true,
  "id": "uuid",
  "team_members": [],
  "full_name": "string",
  "email": "string"
}
```

---

### 3. Get Team by ID
- **GET** `/api/v1/teams/{id}`
- **Description:** Retrieve a team by its ID.
- **Path Parameters:**
  - `id` (string, uuid): Team ID
- **Response:**
```json
{
  "name": "string",
  "description": "string",
  "team_owner_id": "uuid",
  "is_active": true,
  "id": "uuid",
  "team_members": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string"
    }
  ],
  "full_name": "string",
  "email": "string"
}
```

---

### 4. Update Team
- **PUT** `/api/v1/teams/{id}`
- **Description:** Update an existing team.
- **Path Parameters:**
  - `id` (string, uuid): Team ID
- **Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "team_owner_id": "uuid",
  "is_active": true
}
```
- **Response:**
```json
{
  "name": "string",
  "description": "string",
  "team_owner_id": "uuid",
  "is_active": true,
  "id": "uuid",
  "team_members": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string"
    }
  ],
  "full_name": "string",
  "email": "string"
}
```

---

### 5. Delete Team
- **DELETE** `/api/v1/teams/{id}`
- **Description:** Delete a team by its ID.
- **Path Parameters:**
  - `id` (string, uuid): Team ID
- **Response:**
```json
{
  "message": "string"
}
```

---

## Error Response
All endpoints may return validation errors:
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

## Notes
- All UUIDs are returned as strings.
- `is_active` is a boolean indicating if the team is active.
- `team_owner_id` is the UUID referencing the user who owns the team.
- `full_name` and `email` are the owner's details included in the response.
- `team_members` is an array of team member objects with `id`, `name`, and `email`.
