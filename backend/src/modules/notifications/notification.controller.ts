import { Request, Response, NextFunction } from 'express';
import { getIO } from './socket.gateway';
import { sendResponse } from '../../common/utils/apiResponse';

export class NotificationController {
  public getStatus = (_req: Request, res: Response, next: NextFunction): void => {
    try {
      let isConnected = false;
      let connectedSocketsCount = 0;

      try {
        const io = getIO();
        isConnected = true;
        connectedSocketsCount = io.sockets.sockets.size;
      } catch {
        isConnected = false;
      }

      sendResponse(res, 200, 'Notification WebSocket Gateway status retrieved.', {
        gatewayStatus: isConnected ? 'online' : 'offline',
        activeClients: connectedSocketsCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  };
}

export const notificationController = new NotificationController();
