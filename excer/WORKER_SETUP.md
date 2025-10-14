# Reddit Worker Setup

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Reddit OAuth Configuration
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret

# Worker Configuration
WORKER_SECRET=your_worker_secret_key
WORKER_URL=https://your-domain.com/api/worker
```

## Reddit OAuth Setup

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Choose "script" as the app type
4. Note down the client ID and secret

## Worker Deployment Options

### Option 1: Vercel Cron Jobs
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/worker",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### Option 2: External Cron Service
Use services like:
- cron-job.org
- EasyCron
- GitHub Actions

Set up to call: `POST https://your-domain.com/api/worker`
With header: `Authorization: Bearer your_worker_secret_key`

### Option 3: Manual Testing
```bash
curl -X POST https://your-domain.com/api/worker \
  -H "Authorization: Bearer your_worker_secret_key"
```

## How It Works

1. **Worker runs every 15 minutes** (configurable)
2. **Authenticates with Reddit** using OAuth
3. **Fetches posts** from penny stock subreddits
4. **Processes sentiment** and stock mentions
5. **Saves data** to local file system
6. **Frontend serves** cached data instantly

## Data Flow

```
Reddit API (OAuth) → Worker → File Storage → Frontend API → Dashboard
```

## Benefits

- **Reliable authentication** with Reddit
- **Fast frontend** (serves cached data)
- **Rate limit friendly** (controlled requests)
- **Scalable** (can add more data sources)
- **Fault tolerant** (continues if one subreddit fails)
