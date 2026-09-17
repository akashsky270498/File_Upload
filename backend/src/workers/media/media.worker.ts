import { getRabbitChannel, QUEUES } from '../../config/rabbitmq';
import { RabbitJobMessage } from '../../infrastructure/rabbitmq/rabbitmq.producer';
import { notificationService } from '../../modules/notifications/notification.service';
import { logger } from '../../common/logger';

export const startMediaWorker = async (): Promise<void> => {
  const channel = getRabbitChannel();

  logger.info(`Starting Media Processing Worker listening on queue: ${QUEUES.MEDIA}`);

  await channel.consume(QUEUES.MEDIA, async (msg) => {
    if (!msg) return;

    try {
      const job: RabbitJobMessage = JSON.parse(msg.content.toString());
      logger.info({ jobName: job.jobName, payload: job.payload }, 'Media Worker: Processing background task...');

      if (job.jobName === 'generate-thumbnail') {
        logger.info({ fileId: job.payload.fileId }, '🎬 [Media Worker] Generated video thumbnail frame.');
        if (job.payload.userId) {
          await notificationService.notifyMediaProcessed(job.payload.userId, job.payload.fileId, 'Video Media Asset');
        }
      } else if (job.jobName === 'process-media') {
        logger.info({ fileId: job.payload.fileId }, '🎞️ [Media Worker] Extracted media dimensions & metadata.');
        if (job.payload.userId) {
          await notificationService.notifyMediaProcessed(job.payload.userId, job.payload.fileId, 'Media Asset');
        }
      }

      channel.ack(msg);
    } catch (err) {
      logger.error({ err }, 'Media Worker: Failure encountered. Sending NACK -> DLQ');
      channel.nack(msg, false, false);
    }
  });
};
