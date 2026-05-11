# Military Asset Management API

REST API backend for the Military Asset Management System.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file:
   ```
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/military_db
   JWT_SECRET=your_jwt_secret_key
   ```

3. Run migrations and seed database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## API Structure

- `/api/auth` - Authentication endpoints
- `/api/bases` - Base management
- `/api/assets` - Asset management
- `/api/purchases` - Purchase records
- `/api/transfers` - Transfer management
- `/api/assignments` - Asset assignments
- `/api/expenditures` - Expenditure tracking
- `/api/audit-logs` - Audit trail

## Authentication

All endpoints (except login/register) require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Database

PostgreSQL database with comprehensive schema for asset tracking and audit trails.
