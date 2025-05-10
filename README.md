# Role/Policy API

A centralized Role/Policy API built with NestJS and PostgreSQL for managing authentication and authorization across multiple applications.

## Features

- Centralized user, role, and permission management
- Support for both RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control)
- JWT-based authentication
- Conditional permissions with scope constraints (e.g., "all" vs "own" resources)
- JSON-based policy definitions stored in PostgreSQL
- Authorization verification with filter generation
- RESTful API with Swagger documentation

## Prerequisites

- Node.js (>= 16.x)
- PostgreSQL (>= 13.x)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a PostgreSQL database
4. Update the `.env` file with your database credentials
5. Run migrations:

```bash
npm run migration:run
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`
API documentation will be available at `http://localhost:3000/api`

## API Endpoints

### Authentication

- `POST /auth/login` - User login

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `POST /users/:id/roles` - Assign roles to user

### Roles

- `GET /roles` - Get all roles
- `GET /roles/:id` - Get role by ID
- `POST /roles` - Create role
- `PATCH /roles/:id` - Update role
- `DELETE /roles/:id` - Delete role
- `POST /roles/:id/permissions` - Assign permissions to role

### Permissions

- `GET /permissions` - Get all permissions
- `GET /permissions/:id` - Get permission by ID
- `POST /permissions` - Create permission
- `PATCH /permissions/:id` - Update permission
- `DELETE /permissions/:id` - Delete permission

### Policies

- `GET /policies` - Get all policies
- `GET /policies/:id` - Get policy by ID
- `GET /policies/permission/:permissionId` - Get policies by permission ID
- `POST /policies` - Create policy
- `PATCH /policies/:id` - Update policy
- `DELETE /policies/:id` - Delete policy

### Authorization

- `POST /authorization/check` - Check if user has permission to access a resource

## Usage Example

### Authentication

```typescript
// Login
const response = await fetch("http://localhost:3000/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "admin",
    password: "Admin123!",
  }),
});

const { access_token } = await response.json();
```

### Authorization Check

```typescript
// Check if user has permission to view stocks
const response = await fetch("http://localhost:3000/authorization/check", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${access_token}`,
  },
  body: JSON.stringify({
    userId: "user-uuid",
    permissionName: "view_stocks",
    resource: "stocks",
    context: {
      category: "electronics",
    },
  }),
});

const result = await response.json();
// result: { granted: true, scope: 'all' }
// or for own resources: { granted: true, scope: 'own', filter: 'createdById = :userId' }
```

## Database Schema

The API uses the following database schema:

- `users` - User information
- `roles` - Role definitions
- `permissions` - Permission definitions
- `user_roles` - Junction table for user-role relationships
- `role_permissions` - Junction table for role-permission relationships
- `policies` - Policy definitions with conditions

## License

[MIT](LICENSE)
