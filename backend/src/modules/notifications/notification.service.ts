import { Notification } from '../../infrastructure/postgres/models/notification.model';
import { socketGateway, SocketGateway } from './socket.gateway';
import { logger } from '../../common/logger';

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type: string;
}

export class NotificationService {
  constructor(private readonly gateway: SocketGateway = socketGateway) {}

  /**
   * Persist notification in PostgreSQL and emit instant real-time WebSocket push event
   */
  public async createAndSendNotification(dto: CreateNotificationDTO): Promise<Notification> {
    try {
      const notification = await Notification.create({
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        read: false,
      });

      logger.info(
        { notificationId: notification.id, userId: dto.userId },
        'Notification saved to PostgreSQL. Pushing real-time WebSocket notification...'
      );

      // Push real-time event to user's Socket.IO room
      this.gateway.sendNotificationToUser(dto.userId, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        read: notification.read,
        createdAt: notification.createdAt,
      });

      return notification;
    } catch (error) {
      logger.error({ error, dto }, 'NotificationService: Failed to create and send notification');
      throw error;
    }
  }

  /**
   * Send media processing completion real-time notification
   */
  public async notifyMediaProcessed(userId: string, fileId: string, title: string): Promise<void> {
    await this.createAndSendNotification({
      userId,
      title: 'Media Processing Complete',
      message: `Your file "${title}" has been successfully processed.`,
      type: 'MEDIA_PROCESSED',
    });

    this.gateway.emitMediaProcessed(userId, { fileId, status: 'COMPLETED' });
  }
}

export const notificationService = new NotificationService();
