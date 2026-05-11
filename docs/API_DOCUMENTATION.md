# API Documentation - Military Asset Management System

## Overview
RESTful API built with Node.js + Express, providing complete military asset management functionality.

## Base URL
- Development: `http://localhost:5000/api`
- Production: `https://<your-render-url>/api`

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Response Format
All responses are JSON with the following structure:

### Success Response
```json
{
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

---

## Authentication Endpoints

### POST /auth/login
Login with email and password.

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@military.com",
    "password": "password123"
  }'
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "email": "admin@military.com",
    "role": "admin",
    "baseId": null
  }
}
```

---

### POST /auth/register
Register a new user (Admin only).

**Request:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "email": "newuser@military.com",
    "password": "securepass123",
    "role": "base_commander",
    "baseId": "550e8400-e29b-41d4-a716-446655440001"
  }'
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440014",
  "email": "newuser@military.com",
  "role": "base_commander",
  "base_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

### GET /auth/profile
Get current user profile.

**Request:**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440011",
    "role": "admin",
    "baseId": null
  }
}
```

---

## Base Management Endpoints

### GET /bases
Get all bases (accessible by all authenticated users).

**Request:**
```bash
curl -X GET http://localhost:5000/api/bases \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Fort Bragg",
    "location": "North Carolina",
    "created_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Fort Hood",
    "location": "Texas",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### GET /bases/:id
Get specific base by ID.

**Request:**
```bash
curl -X GET http://localhost:5000/api/bases/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Fort Bragg",
  "location": "North Carolina",
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### POST /bases
Create new base (Admin only).

**Request:**
```bash
curl -X POST http://localhost:5000/api/bases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Fort Riley",
    "location": "Kansas"
  }'
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440099",
  "name": "Fort Riley",
  "location": "Kansas",
  "created_at": "2024-01-15T11:30:00Z"
}
```

---

## User Management Endpoints

### GET /users
Get all users (Admin only).

**Request:**
```bash
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "email": "admin@military.com",
    "role": "admin",
    "base_id": null,
    "created_at": "2024-01-15T10:00:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440012",
    "email": "commander@fort-bragg.com",
    "role": "base_commander",
    "base_id": "550e8400-e29b-41d4-a716-446655440001",
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### GET /users/:id
Get user by ID.

**Request:**
```bash
curl -X GET http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440011 \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440011",
  "email": "admin@military.com",
  "role": "admin",
  "base_id": null,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### PUT /users/:id
Update user (Admin only).

**Request:**
```bash
curl -X PUT http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440014 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "role": "logistics_officer",
    "base_id": null
  }'
```

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440014",
  "email": "newuser@military.com",
  "role": "logistics_officer",
  "base_id": null
}
```

---

### DELETE /users/:id
Delete user (Admin only).

**Request:**
```bash
curl -X DELETE http://localhost:5000/api/users/550e8400-e29b-41d4-a716-446655440014 \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Asset Endpoints

### GET /assets
Get all assets for a base.

**Query Parameters:**
- `base_id` (required): Base UUID
- `equipment_type` (optional): "Weapon", "Vehicle", "Ammunition"

**Request:**
```bash
curl -X GET "http://localhost:5000/api/assets?base_id=550e8400-e29b-41d4-a716-446655440001&equipment_type=Weapon" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440021",
    "base_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "M4 Carbine",
    "type": "Weapon",
    "opening_balance": 100,
    "purchase_count": 2,
    "total_purchases": 50,
    "total_transfers_in": 20,
    "total_transfers_out": 10,
    "total_assigned": 30,
    "total_expended": 5,
    "created_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### POST /assets
Create new asset.

**Request:**
```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "base_id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "M4 Carbine",
    "type": "Weapon",
    "opening_balance": 100
  }'
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440021",
  "base_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "M4 Carbine",
  "type": "Weapon",
  "opening_balance": 100,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### GET /assets/:asset_id/balance
Get closing balance for asset.

**Request:**
```bash
curl -X GET http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440021/balance \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "openingBalance": 100,
  "purchases": 50,
  "transfersIn": 20,
  "transfersOut": 10,
  "assigned": 30,
  "expended": 5,
  "closingBalance": 125
}
```

---

## Purchase Endpoints

### POST /purchases
Record a purchase.

**Request:**
```bash
curl -X POST http://localhost:5000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "asset_id": "550e8400-e29b-41d4-a716-446655440021",
    "base_id": "550e8400-e29b-41d4-a716-446655440001",
    "quantity": 50,
    "unit_price": 1200
  }'
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440031",
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "base_id": "550e8400-e29b-41d4-a716-446655440001",
  "quantity": 50,
  "unit_price": "1200.00",
  "purchase_date": "2024-01-15T11:00:00Z",
  "created_at": "2024-01-15T11:00:00Z"
}
```

---

## Transfer Endpoints

### POST /transfers
Record an asset transfer between bases.

**Request:**
```bash
curl -X POST http://localhost:5000/api/transfers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "asset_id": "550e8400-e29b-41d4-a716-446655440021",
    "from_base_id": "550e8400-e29b-41d4-a716-446655440001",
    "to_base_id": "550e8400-e29b-41d4-a716-446655440002",
    "quantity": 10
  }'
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440041",
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "from_base_id": "550e8400-e29b-41d4-a716-446655440001",
  "to_base_id": "550e8400-e29b-41d4-a716-446655440002",
  "quantity": 10,
  "transfer_date": "2024-01-15T11:15:00Z",
  "created_at": "2024-01-15T11:15:00Z"
}
```

---

## Assignment Endpoints

### POST /assignments
Assign assets to personnel.

**Request:**
```bash
curl -X POST http://localhost:5000/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "asset_id": "550e8400-e29b-41d4-a716-446655440021",
    "personnel_name": "John Doe",
    "quantity": 2
  }'
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440051",
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "personnel_name": "John Doe",
  "quantity": 2,
  "assignment_date": "2024-01-15T11:30:00Z",
  "created_at": "2024-01-15T11:30:00Z"
}
```

---

## Expenditure Endpoints

### POST /expenditures
Record asset expenditure.

**Request:**
```bash
curl -X POST http://localhost:5000/api/expenditures \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "asset_id": "550e8400-e29b-41d4-a716-446655440021",
    "quantity": 5,
    "reason": "Training exercise"
  }'
```

**Response (201):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440061",
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "quantity": 5,
  "reason": "Training exercise",
  "expended_date": "2024-01-15T11:45:00Z",
  "created_at": "2024-01-15T11:45:00Z"
}
```

---

## Reports & Analytics Endpoints

### GET /reports/audit-logs
Get audit logs.

**Query Parameters:**
- `user_id` (optional): Filter by user
- `action` (optional): Filter by action (CREATE, UPDATE, DELETE)
- `resource_type` (optional): Filter by resource type
- `limit` (optional): Results per page (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports?action=CREATE&resource_type=PURCHASE&limit=50" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440071",
    "user_id": "550e8400-e29b-41d4-a716-446655440011",
    "action": "CREATE",
    "resource_type": "PURCHASE",
    "resource_id": "550e8400-e29b-41d4-a716-446655440031",
    "changes": {
      "assetId": "550e8400-e29b-41d4-a716-446655440021",
      "quantity": 50,
      "unitPrice": 1200,
      "total": 60000
    },
    "ip_address": "192.168.1.100",
    "created_at": "2024-01-15T11:00:00Z"
  }
]
```

---

### GET /reports/summary/stats
Get summary statistics.

**Query Parameters:**
- `base_id` (optional): Filter by base

**Request:**
```bash
curl -X GET "http://localhost:5000/api/reports/summary/stats?base_id=550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer <token>"
```

**Response (200):**
```json
{
  "total_assets": 3,
  "total_purchases": 50,
  "total_transfers": 10,
  "total_expended": 5,
  "total_opening_balance": 10125
}
```

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Descriptive error message"
}
```

**Common Errors:**
- `"No token provided"` - Missing JWT token
- `"Invalid token"` - Malformed or expired JWT
- `"Insufficient permissions"` - User role doesn't have access
- `"Access denied to this base"` - Base Commander accessing different base

---

## Rate Limiting

Currently no rate limiting is implemented. Production deployment should include rate limiting middleware.

---

## Versioning

Current API Version: v1
All endpoints are versioned as `/api/v1/` in production.

---

## Examples

### Complete Flow: Create Purchase

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@military.com","password":"password123"}' \
  | jq -r '.token')

# 2. Record Purchase
curl -X POST http://localhost:5000/api/purchases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "asset_id": "550e8400-e29b-41d4-a716-446655440021",
    "base_id": "550e8400-e29b-41d4-a716-446655440001",
    "quantity": 50,
    "unit_price": 1200
  }'

# 3. View Balance
curl -X GET http://localhost:5000/api/assets/550e8400-e29b-41d4-a716-446655440021/balance \
  -H "Authorization: Bearer $TOKEN"
```

---

## Support

For issues or questions, refer to PROJECT_DOCUMENTATION.md or SETUP_GUIDE.md.
