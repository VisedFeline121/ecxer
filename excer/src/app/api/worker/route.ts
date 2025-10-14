import RedditWorker from '@/lib/reddit-worker';
import { NextRequest, NextResponse } from 'next/server';

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
