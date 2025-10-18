import { NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Store active connections
const encoder = new TextEncoder();
const connections = new Set<ReadableStreamDefaultController>();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      connections.add(controller);
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      return () => {
        connections.delete(controller);
      };
    },
    cancel() {
      // Connection was closed
      connections.delete(this);
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}

// Function to notify all clients
export async function notifyClients() {
  console.log('[SSE] Sending update to clients');
  const message = encoder.encode(`data: ${JSON.stringify({ type: 'update', timestamp: Date.now() })}\n\n`);
  const closedConnections = new Set<ReadableStreamDefaultController>();

  for (const client of connections) {
    try {
      client.enqueue(message);
    } catch (error) {
      console.error('[SSE] Failed to send message:', error);
      closedConnections.add(client);
    }
  }

  // Clean up closed connections
  closedConnections.forEach(client => {
    connections.delete(client);
  });
}