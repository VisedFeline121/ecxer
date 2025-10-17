import RedditWorker from '@/lib/reddit-worker';
import { NextRequest, NextResponse } from 'next/server';
import { notifyClients } from '../updates/route';

export async function POST(request: NextRequest) {
  try {
    // Check for worker secret to prevent unauthorized calls
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.WORKER_SECRET;
    
    if (!expectedSecret || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const worker = new RedditWorker();
    await worker.run();
    
    // Load the fresh data to verify it was written
    console.log('[Worker] Verifying data was written...');
    const data = await worker.loadData();
    if (!data) {
      console.error('[Worker] Failed to verify data was written');
      throw new Error('Failed to verify data was written');
    }
    console.log('[Worker] Data verified:', {
      stocksCount: data.stocks?.length || 0,
      lastUpdated: new Date(data.lastUpdated).toISOString(),
      firstStock: data.stocks?.[0]?.symbol,
      dataSource: data.dataSource
    });
    
    // Notify all connected clients that new data is available
    console.log('[Worker] Notifying clients of new data...');
    await notifyClients();
    
    return NextResponse.json({
      success: true,
      message: 'Worker completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Worker API error:', error);
    return NextResponse.json(
      { error: 'Worker failed' },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing
export async function GET() {
  try {
    const worker = new RedditWorker();
    await worker.run();
    
    // Load the fresh data to verify it was written
    console.log('[Worker] Verifying data was written...');
    const data = await worker.loadData();
    if (!data) {
      console.error('[Worker] Failed to verify data was written');
      throw new Error('Failed to verify data was written');
    }
    console.log('[Worker] Data verified:', {
      stocksCount: data.stocks?.length || 0,
      lastUpdated: new Date(data.lastUpdated).toISOString(),
      firstStock: data.stocks?.[0]?.symbol,
      dataSource: data.dataSource
    });
    
    // Notify all connected clients that new data is available
    console.log('[Worker] Notifying clients of new data...');
    await notifyClients();
    
    return NextResponse.json({
      success: true,
      message: 'Worker completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Worker API error:', error);
    return NextResponse.json(
      { error: 'Worker failed' },
      { status: 500 }
    );
  }
}
