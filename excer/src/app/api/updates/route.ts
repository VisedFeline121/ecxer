import { NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Store active connections
const encoder = new TextEncoder();
const connections = new Set<ReadableStreamDefaultController>();

// Keep track of connection attempts per client
const connectionAttempts = new Map<string, number>();
const MAX_RETRIES = 3;
const KEEP_ALIVE_INTERVAL = 15000; // 15 seconds

function getClientId(controller: ReadableStreamDefaultController): string {
  return (controller as any).clientId || 'unknown';
}

function cleanupConnection(controller: ReadableStreamDefaultController, keepAliveInterval?: NodeJS.Timeout) {
  const clientId = getClientId(controller);
  console.log(`[SSE] Cleaning up connection for client ${clientId}`);
  
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  
  connections.delete(controller);
  connectionAttempts.delete(clientId);
}

export async function POST(request: Request) {
  try {
    // Verify the request is authorized
    const authHeader = request.headers.get('authorization');
    const expectedAuth = `Bearer ${process.env.WORKER_SECRET}`;
    
    if (!authHeader || authHeader !== expectedAuth) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Notify all connected clients
    await notifyClients();
    
    return new NextResponse(JSON.stringify({ 
      success: true, 
      message: 'Clients notified',
      activeConnections: connections.size 
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in POST /api/updates:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function GET() {
  const clientId = Date.now().toString();
  console.log(`[SSE] New connection attempt from client ${clientId}`);

  // Check retry count
  const attempts = connectionAttempts.get(clientId) || 0;
  if (attempts >= MAX_RETRIES) {
    console.log(`[SSE] Client ${clientId} exceeded max retries`);
    connectionAttempts.delete(clientId);
    return new NextResponse(null, { status: 429 });
  }

  connectionAttempts.set(clientId, attempts + 1);

  const stream = new ReadableStream({
    start(controller) {
      (controller as any).clientId = clientId;
      console.log(`[SSE] Client ${clientId} connected`);
      connections.add(controller);
      
      // Send initial connection message with retry instructions
      const initialMessage = encoder.encode(
        `retry: 1000\n` + // Tell client to wait 1 second before reconnecting
        `data: ${JSON.stringify({ 
          type: 'connected',
          clientId,
          message: 'Connection established. Will retry automatically if disconnected.'
        })}\n\n`
      );
      console.log(`[SSE] Sending initial message to client ${clientId}`);
      controller.enqueue(initialMessage);

      // Send keep-alive more frequently
      const keepAliveInterval = setInterval(() => {
        try {
          const keepAliveMessage = encoder.encode(
            `data: ${JSON.stringify({ 
              type: 'keepalive',
              clientId,
              timestamp: Date.now()
            })}\n\n`
          );
          controller.enqueue(keepAliveMessage);
        } catch (error) {
          console.log(`[SSE] Keep-alive failed for client ${clientId}, connection likely closed:`, error);
          cleanupConnection(controller, keepAliveInterval);
        }
      }, KEEP_ALIVE_INTERVAL);

      // Return cleanup function
      return () => {
        console.log(`[SSE] Client ${clientId} disconnected (cleanup)`);
        cleanupConnection(controller, keepAliveInterval);
      };
    },
    cancel(controller) {
      const clientId = getClientId(controller);
      console.log(`[SSE] Client ${clientId} disconnected (cancel)`);
      cleanupConnection(controller);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Accel-Buffering': 'no',
      'Access-Control-Allow-Origin': '*', // Allow cross-origin requests
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': '*',
    },
  });
}

// Function to notify all clients
export async function notifyClients() {
  console.log(`[SSE] Sending update to clients, active connections: ${connections.size}`);
  const message = encoder.encode(`data: ${JSON.stringify({ 
    type: 'update',
    timestamp: Date.now(),
    activeConnections: connections.size
  })}\n\n`);
  
  const closedConnections = new Set<ReadableStreamDefaultController>();

  for (const client of connections) {
    const clientId = getClientId(client);
    try {
      console.log(`[SSE] Sending update to client ${clientId}`);
      client.enqueue(message);
      console.log(`[SSE] Successfully sent update to client ${clientId}`);
    } catch (error) {
      console.error(`[SSE] Failed to send message to client ${clientId}:`, error);
      closedConnections.add(client);
    }
  }

  // Clean up closed connections
  closedConnections.forEach(client => {
    const clientId = getClientId(client);
    console.log(`[SSE] Removing dead connection for client ${clientId}`);
    cleanupConnection(client);
  });
}