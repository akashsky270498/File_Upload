import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisClient } from '../../config/redis';
import { verifyAccessToken } from '../../common/utils/jwt';
import { logger } from '../../common/logger';
import { env } from '../../config/env';

export interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export class SocketGateway {
  private io: SocketIOServer | null = null;

  /**
   * Initialize Socket.IO Server with Redis Adapter for multi-instance scaling
   */
  public init(server: HttpServer): SocketIOServer {
    // Create dedicated Pub/Sub clients for Redis Adapter
    const pubClient = redisClient.duplicate();
    const subClient = redisClient.duplicate();

    this.io = new SocketIOServer(server, {
      cors: {
        origin: env.clientUrl,
        credentials: true,
      },
      adapter: createAdapter(pubClient, subClient),
    });

    // 1. Authentication Middleware for Socket Connection Handshake
    this.io.use((socket: AuthenticatedSocket, next) => {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        logger.warn('Socket Connection Rejected: Missing authentication token.');
        return next(new Error('Authentication token required'));
      }

      try {
        const payload = verifyAccessToken(token);
        socket.user = {
          userId: payload.userId,
          email: payload.email,
          role: payload.role,
        };
        next();
      } catch (err) {
        logger.warn('Socket Connection Rejected: Invalid or expired token.');
        return next(new Error('Unauthorized socket connection'));
      }
    });

    // 2. Connection Listener
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.user?.userId;
      if (!userId) return;

      const userRoom = `user:${userId}`;
      socket.join(userRoom);

      logger.info(
        { socketId: socket.id, userId, userRoom },
        `Socket Client connected and joined room '${userRoom}'`
      );

      socket.on('disconnect', (reason) => {
        logger.info({ socketId: socket.id, userId, reason }, 'Socket Client disconnected');
      });
    });

    logger.info('Socket.IO Gateway initialized with Redis Pub/Sub Adapter.');
    return this.io;
  }

  /**
   * Send a targeted real-time push notification to a specific user's room
   */
  public sendNotificationToUser(userId: string, payload: any): void {
    if (!this.io) {
      logger.warn('SocketGateway: Cannot send notification, Socket.IO is not initialized.');
      return;
    }

    const room = `user:${userId}`;
    this.io.to(room).emit('notification:new', payload);
    logger.info({ userId, room }, `Socket Gateway: Emitted 'notification:new' to room '${room}'`);
  }

  /**
   * Emit media processing complete event to user room
   */
  public emitMediaProcessed(userId: string, payload: any): void {
    if (!this.io) return;
    const room = `user:${userId}`;
    this.io.to(room).emit('media:processed', payload);
    logger.info({ userId, room }, `Socket Gateway: Emitted 'media:processed' to room '${room}'`);
  }

  /**
   * Broadcast real-time event to all connected socket clients
   */
  public broadcast(event: string, payload: any): void {
    if (!this.io) return;
    this.io.emit(event, payload);
    logger.info({ event }, `Socket Gateway: Broadcasted event '${event}' to all connected clients.`);
  }
}

export const socketGateway = new SocketGateway();
