import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse as parseUrl } from 'url';
import { verify } from 'jsonwebtoken';
import { config } from '../../config/environment.js';
import { logger } from '../../shared/utils/logger.js';
import { prisma } from '../../config/database.js';

interface AuthenticatedWebSocket extends WebSocket {
  userId?: string;
  isAlive?: boolean;
}

interface ActiveVisitorsData {
  activeVisitors: number;
  activeSessions: number;
  timestamp: string;
}

// Active WebSocket clients
const clients = new Set<AuthenticatedWebSocket>();

// Per-user connection limit (prevents DoS via connection flooding)
const MAX_CONNECTIONS_PER_USER = 3;

// Broadcast interval (10 seconds)
let broadcastInterval: NodeJS.Timeout | null = null;

/**
 * Setup WebSocket server for analytics active visitors
 * Attaches to existing HTTP server on path /ws/analytics/active-visitors
 */
export function setupAnalyticsWebSocket(httpServer: HttpServer): void {
  const wss = new WebSocketServer({
    noServer: true, // Manual upgrade handling
  });

  // Handle HTTP upgrade requests
  httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
    const { pathname, query } = parseUrl(request.url || '', true);

    // Only handle analytics WebSocket path
    if (pathname === '/ws/analytics/active-visitors') {
      // Authenticate the connection
      const token = (query['token'] as string) || extractTokenFromHeader(request);

      if (!token) {
        logger.warn('[WebSocket] No auth token provided');
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Verify JWT token
      try {
        const payload = verify(token, config.jwt.secret) as { sub: string; role: string };

        // Only allow admin users
        if (!payload.role || !['SUPER_ADMIN', 'ADMIN'].includes(payload.role)) {
          logger.warn('[WebSocket] Non-admin user attempted to connect', { userId: payload.sub });
          socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
          socket.destroy();
          return;
        }

        // Enforce per-user connection limit
        const userConnections = Array.from(clients).filter(c => c.userId === payload.sub);
        if (userConnections.length >= MAX_CONNECTIONS_PER_USER) {
          logger.warn('[WebSocket] Connection limit exceeded', { userId: payload.sub, current: userConnections.length });
          socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
          socket.destroy();
          return;
        }

        // Upgrade to WebSocket
        wss.handleUpgrade(request, socket, head, (ws) => {
          const authWs = ws as AuthenticatedWebSocket;
          authWs.userId = payload.sub;
          wss.emit('connection', authWs, request);
        });
      } catch (error) {
        logger.error('[WebSocket] Token verification failed', { error });
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
      }
    } else {
      // Not our path, ignore
      socket.destroy();
    }
  });

  // Handle WebSocket connections
  wss.on('connection', (ws: AuthenticatedWebSocket) => {
    logger.info('[WebSocket] Client connected', { userId: ws.userId });

    // Add to clients set
    clients.add(ws);
    ws.isAlive = true;

    // Send initial data immediately
    sendActiveVisitorsData(ws);

    // Handle ping/pong for connection health
    ws.on('pong', () => {
      ws.isAlive = true;
    });

    // Handle client messages (if needed in future)
    ws.on('message', (message) => {
      logger.debug('[WebSocket] Received message', { message: message.toString() });
    });

    // Handle disconnection
    ws.on('close', () => {
      logger.info('[WebSocket] Client disconnected', { userId: ws.userId });
      clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error('[WebSocket] Client error', { error, userId: ws.userId });
      clients.delete(ws);
    });
  });

  // Start broadcasting active visitors data
  startBroadcast();

  // Heartbeat to detect broken connections
  startHeartbeat();

  logger.info('[WebSocket] Analytics WebSocket server initialized on /ws/analytics/active-visitors');
}

/**
 * Extract JWT token from Authorization header
 */
function extractTokenFromHeader(request: IncomingMessage): string | undefined {
  const authHeader = request.headers.authorization;
  if (!authHeader) return undefined;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return undefined;

  return parts[1];
}

/**
 * Query database for active visitors and broadcast to all clients
 */
async function broadcastActiveVisitors(): Promise<void> {
  try {
    if (clients.size === 0) {
      // No clients connected, skip query
      return;
    }

    const data = await getActiveVisitorsData();

    // Broadcast to all connected clients
    const message = JSON.stringify({
      type: 'active_visitors',
      data,
    });

    clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });
  } catch (error) {
    logger.error('[WebSocket] Failed to broadcast active visitors', { error });
  }
}

/**
 * Get active visitors data from database
 * Active = sessions with activity in last 5 minutes
 */
async function getActiveVisitorsData(): Promise<ActiveVisitorsData> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  try {
    // Count distinct visitors with recent activity
    const result = await prisma.analyticsSession.groupBy({
      by: ['visitorId'],
      where: {
        startedAt: { gte: fiveMinutesAgo },
        endedAt: null,
        isBot: false,
      },
      _count: {
        id: true,
      },
    });

    const activeVisitors = result.length;

    // Count active sessions
    const activeSessions = await prisma.analyticsSession.count({
      where: {
        startedAt: { gte: fiveMinutesAgo },
        endedAt: null,
        isBot: false,
      },
    });

    return {
      activeVisitors,
      activeSessions,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    logger.error('[WebSocket] Failed to query active visitors', { error });
    return {
      activeVisitors: 0,
      activeSessions: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Send active visitors data to a specific client
 */
async function sendActiveVisitorsData(ws: AuthenticatedWebSocket): Promise<void> {
  try {
    const data = await getActiveVisitorsData();
    const message = JSON.stringify({
      type: 'active_visitors',
      data,
    });

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  } catch (error) {
    logger.error('[WebSocket] Failed to send active visitors data', { error });
  }
}

/**
 * Start broadcasting active visitors every 10 seconds
 */
function startBroadcast(): void {
  if (broadcastInterval) return; // Already started

  broadcastInterval = setInterval(() => {
    broadcastActiveVisitors();
  }, 10_000); // 10 seconds
}

/**
 * Stop broadcasting (cleanup)
 */
export function stopBroadcast(): void {
  if (broadcastInterval) {
    clearInterval(broadcastInterval);
    broadcastInterval = null;
  }
}

/**
 * Heartbeat to detect and close broken connections
 * Ping every 30 seconds, terminate if no pong received
 */
function startHeartbeat(): void {
  setInterval(() => {
    clients.forEach((ws) => {
      if (ws.isAlive === false) {
        logger.warn('[WebSocket] Terminating unresponsive client', { userId: ws.userId });
        clients.delete(ws);
        return ws.terminate();
      }

      ws.isAlive = false;
      ws.ping();
    });
  }, 15_000); // 15 seconds
}
