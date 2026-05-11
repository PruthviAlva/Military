# Military Asset Management System - Project Documentation

## 1. Project Overview

### Description
The Military Asset Management System is a comprehensive full-stack web application designed to enable commanders and logistics personnel to efficiently manage the movement, assignment, and expenditure of critical military assets (such as vehicles, weapons, and ammunition) across multiple bases.

### Core Objectives
- **Transparency**: Complete visibility into asset movements and balances
- **Accountability**: Track all transactions and personnel assignments
- **Efficiency**: Streamline logistics operations across multiple bases
- **Security**: Role-based access control with comprehensive audit trails

### Assumptions
1. Users have valid military credentials and authentication
2. Each user is assigned to a specific role and potentially a base
3. Assets are tracked at the base level
4. Database will be deployed on PostgreSQL
5. Frontend will be deployed on Vercel or similar CDN
6. Backend will be deployed on Render or similar hosting

### Limitations
1. Real-time synchronization is handled through API polling (not WebSockets)
2. Current implementation doesn't include geolocation or GPS tracking
3. No offline functionality - requires internet connectivity
4. Bulk operations are handled individually (no bulk upload/export in MVP)

---

## 2. Tech Stack & Architecture

### Backend Stack
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: PostgreSQL (relational)
- **Logging**: Winston
- **Security**: bcrypt, Helmet, CORS

**Justification**:
- Express.js provides lightweight, flexible REST API development
- TypeScript ensures type safety and better maintainability
- PostgreSQL is excellent for complex relationships and ACID compliance
- JWT is stateless and scalable for distributed systems
- Winston provides comprehensive logging for audit trails

### Frontend Stack
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **State Management**: React Context API

**Justification**:
- React provides component reusability and efficient rendering
- TypeScript ensures type safety in frontend code
- Vite offers fast development and production builds
- Tailwind CSS enables rapid UI development with consistent styling
- Context API is sufficient for authentication state (avoiding Redux complexity)

### Database
- **System**: PostgreSQL 12+
- **Choice Justification**:
  - ACID transactions ensure data consistency
  - Strong support for complex queries and relationships
  - Excellent audit trail capabilities through JSONB
  - Better than NoSQL for this domain due to structured data

---

## 3. Data Models / Schema

### Core Tables

#### Users Table
```
id (UUID) - Primary Key
email (VARCHAR) - Unique user email
password (VARCHAR) - Hashed password
role (VARCHAR) - admin | base_commander | logistics_officer
base_id (UUID) - Foreign Key to bases
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Bases Table
```
id (UUID) - Primary Key
name (VARCHAR) - Unique base name
location (VARCHAR) - Physical location
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Assets Table
```
id (UUID) - Primary Key
base_id (UUID) - Foreign Key to bases
name (VARCHAR) - Asset name
type (VARCHAR) - Weapon | Vehicle | Ammunition
opening_balance (INTEGER) - Initial quantity
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Purchases Table
```
id (UUID) - Primary Key
asset_id (UUID) - Foreign Key to assets
base_id (UUID) - Foreign Key to bases
quantity (INTEGER) - Purchase quantity
unit_price (DECIMAL) - Price per unit
purchase_date (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Transfers Table
```
id (UUID) - Primary Key
asset_id (UUID) - Foreign Key to assets
from_base_id (UUID) - Foreign Key to bases (source)
to_base_id (UUID) - Foreign Key to bases (destination)
quantity (INTEGER) - Transfer quantity
transfer_date (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Assignments Table
```
id (UUID) - Primary Key
asset_id (UUID) - Foreign Key to assets
personnel_name (VARCHAR) - Name of personnel
quantity (INTEGER) - Quantity assigned
assignment_date (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Expenditures Table
```
id (UUID) - Primary Key
asset_id (UUID) - Foreign Key to assets
quantity (INTEGER) - Expended quantity
reason (VARCHAR) - Reason for expenditure
expended_date (TIMESTAMP)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

#### Audit Logs Table
```
id (UUID) - Primary Key
user_id (UUID) - Foreign Key to users
action (VARCHAR) - CREATE | UPDATE | DELETE
resource_type (VARCHAR) - ASSET | PURCHASE | TRANSFER | etc.
resource_id (UUID) - ID of affected resource
changes (JSONB) - Detailed changes in JSON format
ip_address (VARCHAR) - User's IP address
created_at (TIMESTAMP)
```

### Schema Relationships
- **Users → Bases**: Many-to-One (base_id)
- **Assets → Bases**: Many-to-One
- **Purchases → Assets**: Many-to-One
- **Purchases → Bases**: Many-to-One
- **Transfers → Assets**: Many-to-One
- **Transfers → Bases**: Many-to-Many (through from_base_id, to_base_id)
- **Assignments → Assets**: Many-to-One
- **Expenditures → Assets**: Many-to-One
- **Audit Logs → Users**: Many-to-One

---

## 4. RBAC Explanation

### Role Definitions

#### Admin Role
- **Access**: Full system access
- **Permissions**:
  - View all bases and assets
  - Create and manage users
  - Record purchases, transfers, assignments, expenditures
  - View complete audit logs
  - Cannot be restricted to a single base

#### Base Commander Role
- **Access**: Limited to assigned base
- **Permissions**:
  - View assets for their base
  - Record purchases for their base
  - Initiate transfers
  - Record assignments and expenditures
  - View audit logs for their base
  - **Restriction**: Cannot access other bases' data

#### Logistics Officer Role
- **Access**: Read-only access to purchases and transfers
- **Permissions**:
  - Record purchases and transfers
  - View purchase and transfer history
  - **Restriction**: Cannot record assignments or expenditures
  - **Restriction**: Cannot delete records

### RBAC Enforcement Method

#### Middleware-Based Access Control
All routes implement RBAC through Express middleware:

```typescript
// Route protection example
router.post('/purchases',
  authMiddleware,           // Verify JWT token
  requireRole('admin', 'base_commander', 'logistics_officer'), // Role check
  requireBaseAccess,        // Base-level access check
  async (req, res) => {     // Handler
    // Process purchase
  }
);
```

#### Access Control Layers
1. **Authentication Middleware**: Verifies JWT token and extracts user info
2. **Role-Based Middleware**: Checks if user's role is in allowed roles
3. **Base-Level Middleware**: Ensures Base Commanders can only access their base
4. **Frontend Routing**: Hides/disables UI based on user role

---

## 5. API Logging

### Logging Strategy

#### Types of Logs
1. **Transaction Logs**: Every CREATE, UPDATE, DELETE operation
2. **Access Logs**: All API requests with timestamp, user, endpoint
3. **Error Logs**: All exceptions and failures
4. **Audit Logs**: Detailed changes with before/after values

#### Implementation
- **Winston Logger**: Configured with Console and File transports
- **Log Files**:
  - `error.log`: Contains only error-level logs
  - `combined.log`: Contains all logs
- **Audit Table**: Stores all transaction details in database

#### Logged Information
```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "info",
  "service": "military-api",
  "userId": "550e8400-e29b-41d4-a716-446655440011",
  "action": "CREATE",
  "resourceType": "PURCHASE",
  "resourceId": "550e8400-e29b-41d4-a716-446655440100",
  "changes": {
    "assetId": "550e8400-e29b-41d4-a716-446655440021",
    "quantity": 50,
    "unitPrice": 1200,
    "totalAmount": 60000
  },
  "ipAddress": "192.168.1.100"
}
```

---

## 6. Setup Instructions

### Backend Setup

#### Prerequisites
- Node.js 18+ installed
- PostgreSQL 12+ installed
- npm or yarn package manager

#### Installation Steps

1. **Navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Create PostgreSQL database**
   ```bash
   createdb military_db
   ```

4. **Load database schema**
   ```bash
   psql military_db < database/schema.sql
   psql military_db < database/seed.sql
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```
   API will be available at `http://localhost:5000`

#### Production Build
```bash
npm run build
npm start
```

### Frontend Setup

#### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

#### Installation Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Edit .env with API URL (e.g., http://localhost:5000)
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   Application will be available at `http://localhost:3000`

#### Production Build
```bash
npm run build
npm run preview
```

### Docker Setup (Optional)

**Docker Compose** file can be created for easier deployment:
```bash
docker-compose up --build
```

---

## 7. API Endpoints

### Authentication Endpoints

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@military.com",
  "password": "password123"
}

Response (200):
{
  "token": "eyJhbGc...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "email": "admin@military.com",
    "role": "admin",
    "baseId": null
  }
}
```

#### Register User
```
POST /api/auth/register
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "newuser@military.com",
  "password": "securepass123",
  "role": "base_commander",
  "baseId": "550e8400-e29b-41d4-a716-446655440001"
}

Response (201): User object
```

#### Get Profile
```
GET /api/auth/profile
Authorization: Bearer {token}

Response (200):
{
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440011",
    "role": "admin",
    "baseId": null
  }
}
```

### Asset Endpoints

#### Get Assets
```
GET /api/assets?base_id={baseId}&equipment_type={type}
Authorization: Bearer {token}

Response (200): Array of asset objects with calculated balances
```

#### Create Asset
```
POST /api/assets
Authorization: Bearer {token}
Content-Type: application/json

{
  "base_id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "M4 Carbine",
  "type": "Weapon",
  "opening_balance": 100
}

Response (201): Created asset object
```

#### Get Asset Balance
```
GET /api/assets/{assetId}/balance
Authorization: Bearer {token}

Response (200):
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

### Purchase Endpoints

#### Record Purchase
```
POST /api/purchases
Authorization: Bearer {token}
Content-Type: application/json

{
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "base_id": "550e8400-e29b-41d4-a716-446655440001",
  "quantity": 50,
  "unit_price": 1200
}

Response (201): Created purchase object
```

### Transfer Endpoints

#### Record Transfer
```
POST /api/transfers
Authorization: Bearer {token}
Content-Type: application/json

{
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "from_base_id": "550e8400-e29b-41d4-a716-446655440001",
  "to_base_id": "550e8400-e29b-41d4-a716-446655440002",
  "quantity": 10
}

Response (201): Created transfer object
```

### Assignment Endpoints

#### Record Assignment
```
POST /api/assignments
Authorization: Bearer {token}
Content-Type: application/json

{
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "personnel_name": "John Doe",
  "quantity": 2
}

Response (201): Created assignment object
```

### Expenditure Endpoints

#### Record Expenditure
```
POST /api/expenditures
Authorization: Bearer {token}
Content-Type: application/json

{
  "asset_id": "550e8400-e29b-41d4-a716-446655440021",
  "quantity": 5,
  "reason": "Training exercise"
}

Response (201): Created expenditure object
```

---

## 8. Login Credentials

### Demo User Accounts

#### Admin Account
- **Email**: admin@military.com
- **Password**: password123
- **Role**: Admin
- **Access**: Full system access

#### Base Commander Account
- **Email**: commander@fort-bragg.com
- **Password**: password123
- **Role**: Base Commander
- **Base**: Fort Bragg
- **Access**: Fort Bragg base only

#### Logistics Officer Account
- **Email**: logistics@military.com
- **Password**: password123
- **Role**: Logistics Officer
- **Access**: Purchase and transfer operations only

---

## 9. Deployment Guide

### Backend Deployment on Render

1. Create a Render account at render.com
2. Create a new PostgreSQL database
3. Create a new Web Service
4. Connect your GitHub repository
5. Set environment variables:
   - `DATABASE_URL`: Your Render PostgreSQL connection string
   - `JWT_SECRET`: Strong random string
   - `NODE_ENV`: production
6. Set Build Command: `npm install && npm run build`
7. Set Start Command: `npm start`

### Frontend Deployment on Vercel

1. Create a Vercel account at vercel.com
2. Connect your GitHub repository
3. Set environment variables:
   - `VITE_API_URL`: Your Render backend URL
4. Deploy - Vercel automatically handles builds

---

## 10. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                     │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │  Dashboard   │  Purchases   │  Transfers   │ Assignments│ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
│                         ↓                                     │
│                  Authentication Layer                         │
│                  (JWT Token Management)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    HTTP/REST API Layer
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  SERVER LAYER (Express.js)                   │
│  ┌──────────────┬──────────────┬──────────────────────────┐ │
│  │ Auth Routes  │ Asset Routes │ Business Logic Services │ │
│  └──────────────┴──────────────┴──────────────────────────┘ │
│                         ↓                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │             RBAC & Middleware Layer                    │ │
│  │  - Authentication  - Authorization  - Logging         │ │
│  └────────────────────────────────────────────────────────┘ │
│                         ↓                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               Data Access Layer (pg driver)            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (PostgreSQL)                    │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │    Users     │    Assets    │  Transfers   │ Audit Logs │ │
│  ├──────────────┼──────────────┼──────────────┼────────────┤ │
│  │    Bases     │  Purchases   │ Assignments  │Expenditures│ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 11. Troubleshooting

### Common Issues

**Database Connection Error**
- Verify PostgreSQL is running
- Check DATABASE_URL environment variable
- Ensure database exists: `createdb military_db`

**JWT Token Expired**
- User needs to log out and log in again
- Token expiration is set to 24 hours

**CORS Errors**
- Ensure backend CORS is configured properly
- Check that frontend URL is allowed in CORS middleware
- Verify API proxy configuration in Vite

**Assets Not Loading**
- Check that base_id is correct
- Verify user has access to that base (for Base Commanders)
- Check browser console for detailed error messages

---

## 12. Future Enhancements

1. **Real-Time Updates**: WebSocket integration for live updates
2. **Bulk Operations**: CSV import/export functionality
3. **Advanced Reporting**: PDF generation and email reports
4. **GPS Tracking**: Real-time asset location tracking
5. **Mobile App**: Native mobile application
6. **Two-Factor Authentication**: Enhanced security
7. **Role-Based Workflows**: Custom approval workflows
8. **Analytics Dashboard**: Advanced metrics and KPIs
