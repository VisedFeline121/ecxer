import RedditWorker from '../src/lib/reddit-worker';

async function runWorker() {
  try {
    // 1. Start the worker
    console.log('Starting Reddit worker in GitHub Actions...');
    
    // 2. Create worker instance - this will use the same Redis connection
    //    because we provide the same environment variables in GitHub Actions
    const worker = new RedditWorker();
    
    // 3. Run the worker - this will:
    //    - Fetch posts from Reddit
    //    - Process them for stock symbols
    //    - Save directly to Redis (same database as Vercel uses)
    console.log('Running worker...');
    await worker.run();
    
    // 4. After saving to Redis, notify the Vercel app that new data is available
    //    This will trigger a refresh for connected clients
    console.log('Notifying Vercel app of update...');
    const response = await fetch(process.env.VERCEL_APP_URL + '/api/updates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WORKER_SECRET}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type: 'update' })
    });

    if (!response.ok) {
      throw new Error(`Failed to notify app: ${response.status} ${response.statusText}`);
    }

    console.log('Worker completed successfully');
  } catch (error) {
    console.error('Worker failed:', error);
    process.exit(1);
  }
}

// Run the worker when this script is executed by GitHub Actions
runWorker();
