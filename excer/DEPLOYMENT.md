# Deployment Guide - Excer

This guide covers deploying the Excer penny stock sentiment tracker to Vercel.

## Prerequisites

- Node.js 18+ installed
- Vercel account
- Reddit API credentials

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Reddit API Configuration
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USERNAME=your_reddit_username
REDDIT_PASSWORD=your_reddit_password

# Worker Security
WORKER_SECRET=your_random_secret_key_here
```

### Getting Reddit API Credentials

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Note down the client ID and secret
5. Use your Reddit username and password

## Deploy to Vercel

Vercel is the recommended deployment option with built-in Next.js support and cron jobs.

### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   - Go to your Vercel dashboard
   - Select your project
   - Go to Settings > Environment Variables
   - Add all variables from `.env.local`

5. **Cron Jobs**:
   - The `vercel.json` file is already configured
   - Cron job runs every 15 minutes to update data
   - No additional setup needed

### Vercel Configuration

The `vercel.json` file includes:
- Cron job for automatic data updates every 15 minutes
- Build configuration for Next.js

## Post-Deployment Checklist

### 1. Verify Deployment
- [ ] App loads without errors
- [ ] All pages are accessible
- [ ] Mobile responsiveness works
- [ ] Error handling displays properly

### 2. Test Data Collection
- [ ] Worker endpoint responds: `GET /api/worker`
- [ ] Data appears in dashboard
- [ ] Real-time updates work (SSE)
- [ ] Cron job is scheduled (Vercel)

### 3. Performance Check
- [ ] Page load times are acceptable
- [ ] No console errors
- [ ] Images and assets load properly
- [ ] Mobile performance is good

### 4. Security
- [ ] Environment variables are set
- [ ] Worker secret is configured
- [ ] HTTPS is enabled (automatic with Vercel)

## Monitoring & Maintenance

### Vercel Dashboard
- Monitor function execution logs
- Check cron job success/failure rates
- Monitor API response times
- Track error rates

### Updates
To update the application:
1. Push changes to your repository
2. Vercel will auto-deploy
3. Monitor deployment in Vercel dashboard

## Troubleshooting

### Common Issues

**Worker not running**:
- Check environment variables in Vercel dashboard
- Verify cron job configuration
- Check worker endpoint manually: `GET /api/worker`

**No data showing**:
- Verify Reddit API credentials
- Check Vercel function logs
- Test API endpoints manually

**Build failures**:
- Check Node.js version (18+)
- Verify all dependencies
- Check TypeScript errors in build logs

### Support
For issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test endpoints manually
4. Check Reddit API status

---

For additional help, refer to the main README.md or create an issue in the repository.
