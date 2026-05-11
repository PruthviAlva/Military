# Vercel Frontend Deployment

## Prerequisites
- Vercel account (vercel.com)
- GitHub repository with code

## Step-by-Step Deployment

### 1. Connect GitHub Repository
- Go to Vercel Dashboard
- Click "New Project"
- Import your GitHub repository
- Select the `frontend` directory as root

### 2. Configure Build Settings
- Framework: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### 3. Set Environment Variables
```
VITE_API_URL=<your-backend-url-from-render>
```

### 4. Deploy
- Click "Deploy"
- Wait for deployment to complete
- Copy the Vercel URL

## Custom Domain (Optional)
- Go to project settings
- Add your custom domain
- Update DNS records as instructed

## Continuous Deployment
- Every push to main branch auto-deploys
- Vercel automatically handles builds

## Verifying Deployment

Visit your Vercel URL and verify:
- Login page loads
- Can log in with demo credentials
- Dashboard displays data
- API calls work correctly

## Troubleshooting

**Build fails**
- Check build logs in Vercel dashboard
- Ensure all dependencies in package.json
- Verify TypeScript compilation: `npm run build`

**API calls fail**
- Verify VITE_API_URL is correct
- Check backend is deployed and running
- Verify CORS is enabled on backend

**Blank page on load**
- Check browser console for errors
- Verify public folder exists
- Check routing in App.tsx

## Performance Optimization

Vercel automatically:
- Minifies code
- Optimizes images
- Caches assets
- Uses CDN for fast delivery

## Analytics

- Go to Analytics tab in Vercel
- Monitor traffic and performance
- Check Web Vitals
