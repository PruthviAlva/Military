# Military Asset Management System - Setup Guide

## Quick Start

### 1. Database Setup

```bash
# Create database
createdb military_db

# Apply schema
psql military_db < backend/database/schema.sql

# Seed initial data
psql military_db < backend/database/seed.sql
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database URL and JWT secret
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL: VITE_API_URL=http://localhost:5000
npm run dev
```

Frontend will run on `http://localhost:3000`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@military.com | password123 |
| Base Commander | commander@fort-bragg.com | password123 |
| Logistics Officer | logistics@military.com | password123 |

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/military_db
JWT_SECRET=your_secret_key_here
LOG_LEVEL=info
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## Database Backup

```bash
# Backup database
pg_dump military_db > backup.sql

# Restore database
psql military_db < backup.sql
```

## Available Scripts

### Backend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Troubleshooting

**Can't connect to database**
- Ensure PostgreSQL is running
- Verify connection string in .env
- Check database exists: `psql -l`

**Port already in use**
- Backend: Change PORT in .env
- Frontend: Set VITE port in vite.config.ts

**Module not found errors**
- Delete node_modules and package-lock.json
- Run `npm install` again
