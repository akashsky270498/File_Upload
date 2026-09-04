import { getIO } from './socket.gateway';
import { FileUploadedNotificationPayload } from './notification.interface';

export class NotificationService {
  public notifyFileUploaded(payload: FileUploadedNotificationPayload): void {
    try {
      const io = getIO();
      io.emit('file:uploaded', payload);
      console.log(`[Notification] Emitted file:uploaded event for "${payload.title}"`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[Notification Warning] Could not emit socket event: ${message}`);
    }
  }
}

export const notificationService = new NotificationService();
export { FileUploadedNotificationPayload };
