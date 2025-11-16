# Vercel Deployment Guide

## Prerequisites
- Vercel account (sign up at https://vercel.com)
- Backend API deployed and accessible

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Configure Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add the following environment variable:

- **VITE_API_URL**: Your backend API URL (e.g., `https://your-backend-api.vercel.app/api/v1`)

### 3. Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your Git repository
3. Select the `frontend` directory as the root
4. Vercel will auto-detect Vite configuration
5. Add environment variables
6. Click "Deploy"

### 4. Deploy via CLI (Alternative)

```bash
cd frontend
vercel
```

Follow the prompts to link your project and deploy.

### 5. Production Deployment

```bash
vercel --prod
```

## Configuration Files

- **vercel.json**: Vercel configuration with build settings and SPA routing
- **.env.production**: Production environment variables template
- **vite.config.js**: Vite configuration with path aliases

## Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Framework**: Vite

## Environment Variables

### Required
- `VITE_API_URL`: Backend API base URL

### Example
```
VITE_API_URL=https://api.yourbackend.com/api/v1
```

## Post-Deployment

1. Verify the deployment at your Vercel URL
2. Test login functionality
3. Check API connectivity
4. Update CORS settings in backend to allow your Vercel domain

## Troubleshooting

### Build Fails
- Check that all dependencies are in `dependencies`, not `devDependencies`
- Verify Node.js version compatibility

### API Connection Issues
- Verify `VITE_API_URL` environment variable is set
- Check backend CORS configuration includes Vercel domain
- Ensure backend API is accessible

### Routing Issues
- The `vercel.json` rewrites configuration handles SPA routing
- All routes redirect to `index.html` for client-side routing

## Custom Domain

To add a custom domain:
1. Go to Project Settings > Domains
2. Add your domain
3. Update DNS records as instructed
4. Update backend CORS to include custom domain
