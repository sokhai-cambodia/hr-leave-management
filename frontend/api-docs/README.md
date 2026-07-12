# API Documentation

This folder contains comprehensive API reference documentation for the backend services.

## Available API Documentation

- [**Users API**](./users-api.md) - User management, authentication, and profile operations
- [**Policies API**](./policies-api.md) - Policy configuration and management
- [**Public Holidays API**](./public-holidays-api.md) - Public holiday calendar management
- [**Leave Types API**](./leave-types-api.md) - Leave type definitions and configuration
- [**Teams API**](./teams-api.md) - Team organization and membership management
- [**Leave Balances API**](./leave-balances-api.md) - Employee leave balance tracking and management
- [**Leave Plan Requests API**](./leave-plan-requests-api.md) - Leave request submission and approval workflow
- [**Leave Requests API**](./leave-requests-api.md) - Single-span leave requests (start/end dates) with submit/approve/reject workflow
- [**Recommendations API**](./recommendations-api.md) - AI-powered leave plan recommendations
- [**Utils API**](./utils-api.md) - Utility endpoints for health checks and system status

## Documentation Structure

Each API reference document includes:
- **Endpoint descriptions** - Clear explanation of what each endpoint does
- **Authentication requirements** - Whether authentication is required and what permissions are needed
- **Request parameters** - Path parameters, query parameters, and request body schemas
- **Response formats** - Success and error response schemas with field descriptions
- **Example requests** - cURL commands showing how to use each endpoint
- **Example responses** - Sample JSON responses
- **Notes and best practices** - Important considerations, security notes, and usage tips

## Base URL

```
http://localhost:8000
```

For production environments, replace with your production API URL.

## Authentication

Most endpoints require authentication using Bearer tokens. Include the access token in the Authorization header:

```bash
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Adding New API Documentation

When adding new API reference files:
1. Create a new `.md` file in this folder (e.g., `items-api.md`, `auth-api.md`)
2. Follow the same structure and format as `users-api.md`
3. Update this README to include a link to the new documentation

## Common Error Codes

| Status Code | Description                                      |
|-------------|--------------------------------------------------|
| 200         | Successful operation                             |
| 401         | Unauthorized - Invalid or missing access token   |
| 403         | Forbidden - Insufficient permissions             |
| 404         | Not Found - Resource does not exist              |
| 422         | Validation Error - Invalid request parameters    |
| 500         | Internal Server Error                            |
