import { NextResponse } from 'next/server';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Store active connections
const encoder = new TextEncoder();
let connections = new Set<ReadableStreamController>();

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      connections.add(controller);
      
      // Send initial connection message
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Remove controller when connection closes
      return () => {
        connections.delete(controller);
      };
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      'Content-Encoding': 'none',
    },
  });
}

// Function to notify all clients
export async function notifyClients() {
  console.log('[SSE] Sending update to clients');
  const message = encoder.encode(`data: ${JSON.stringify({ type: 'update', timestamp: Date.now() })}\n\n`);

  connections.forEach((client) => {
    try {
      client.enqueue(message);
    } catch (error) {
      console.error('[SSE] Failed to send message:', error);
      connections.delete(client);
    }
  });
}