import RedditWorker from '@/lib/reddit-worker';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const worker = new RedditWorker();
    const data = await worker.loadData();
    
    if (!data) {
      return NextResponse.json({
        stocks: [],
        lastUpdated: Date.now(),
        totalSubreddits: 0,
        message: 'No data available. Worker may not have run yet.'
      });
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error loading Reddit data:', error);
    return NextResponse.json(
      { error: 'Failed to load Reddit data' },
      { status: 500 }
    );
  }
}