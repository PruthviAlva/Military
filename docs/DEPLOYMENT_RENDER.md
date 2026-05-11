# Render Backend Deployment

## Prerequisites
- Render account (render.com)
- GitHub repository with code

## Step-by-Step Deployment

### 1. Create PostgreSQL Database on Render
- Go to Render Dashboard
- Click "New +" → "PostgreSQL"
- Name: `military-db`
- Region: Choose closest to you
- Copy the connection string

### 2. Create Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Name: `military-api`
- Environment: `Node`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

### 3. Set Environment Variables
```
NODE_ENV=production
DATABASE_URL=<paste from PostgreSQL>
JWT_SECRET=<generate random string>
LOG_LEVEL=info
```

### 4. Deploy
- Click "Create Web Service"
- Wait for deployment to complete
- Copy the service URL (e.g., https://military-api.onrender.com)

## Verifying Deployment

```bash
curl https://military-api.onrender.com/health
# Should return: {"status":"ok","timestamp":"..."}
```

## Database Initialization

After deployment, initialize the database:

```bash
# SSH into Render console or use psql directly
psql <DATABASE_URL> < backend/database/schema.sql
psql <DATABASE_URL> < backend/database/seed.sql
```

## Troubleshooting

**Build fails**
- Check build logs in Render dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

**Connection timeout**
- Verify DATABASE_URL is correct
- Ensure PostgreSQL instance is running
- Check firewall/security group settings

**Environment variables not loaded**
- Verify variables are set in Render dashboard
- Restart the service
- Check logs for errors
