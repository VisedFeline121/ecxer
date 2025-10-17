import RedditWorker from '@/lib/reddit-worker';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    console.log('[API] Loading data from file...');
    const worker = new RedditWorker();
    const data = await worker.loadData();
    console.log('[API] Loaded data:', {
      stocksCount: data?.stocks?.length || 0,
      lastUpdated: data?.lastUpdated ? new Date(data.lastUpdated).toISOString() : 'none',
      firstStock: data?.stocks?.[0]?.symbol || 'none'
    });
    
    if (!data) {
      return NextResponse.json({
        stocks: [],
        lastUpdated: Date.now(),
        totalSubreddits: 0,
        message: 'No data available. Worker may not have run yet.'
      });
    }
    
    return new NextResponse(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0'
      }
    });
    
  } catch (error) {
    console.error('Error loading Reddit data:', error);
    return NextResponse.json(
      { error: 'Failed to load Reddit data' },
      { status: 500 }
    );
  }
}