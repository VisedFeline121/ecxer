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
      console.log('[SSE] New client connected');
      connections.add(controller);
      
      // Send initial connection message
      const initialMessage = encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
      console.log('[SSE] Sending initial message:', initialMessage);
      controller.enqueue(initialMessage);

      // Send keep-alive every 30 seconds to prevent timeout
      const keepAliveInterval = setInterval(() => {
        try {
          const keepAliveMessage = encoder.encode(`data: ${JSON.stringify({ type: 'keepalive', timestamp: Date.now() })}\n\n`);
          controller.enqueue(keepAliveMessage);
        } catch (error) {
          console.log('[SSE] Keep-alive failed, connection likely closed');
          clearInterval(keepAliveInterval);
          connections.delete(controller);
        }
      }, 30000);

      // Return cleanup function
      return () => {
        console.log('[SSE] Client disconnected (cleanup)');
        clearInterval(keepAliveInterval);
        connections.delete(controller);
      };
    },
    cancel(controller) {
      // Connection was closed
      console.log('[SSE] Client disconnected (cancel)');
      connections.delete(controller);
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
    },
  });
}

// Function to notify all clients
export async function notifyClients() {
  console.log('[SSE] Sending update to clients, active connections:', connections.size);
  const message = encoder.encode(`data: ${JSON.stringify({ type: 'update', timestamp: Date.now() })}\n\n`);
  console.log('[SSE] Update message:', message);
  const closedConnections = new Set<ReadableStreamDefaultController>();

  for (const client of connections) {
    try {
      console.log('[SSE] Sending to client...');
      client.enqueue(message);
      console.log('[SSE] Successfully sent to client');
    } catch (error) {
      console.error('[SSE] Failed to send message:', error);
      console.error('[SSE] Client state:', client);
      closedConnections.add(client);
    }
  }

  // Clean up closed connections
  closedConnections.forEach(client => {
    connections.delete(client);
  });
}