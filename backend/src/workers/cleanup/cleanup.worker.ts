import { getRabbitChannel, QUEUES } from '../../config/rabbitmq';
import { RabbitJobMessage } from '../../infrastructure/rabbitmq/rabbitmq.producer';
import { cloudinaryService } from '../../config/cloudinary';
import { logger } from '../../common/logger';

export const startCleanupWorker = async (): Promise<void> => {
  const channel = getRabbitChannel();

  logger.info(`Starting Cleanup Worker listening on queue: ${QUEUES.CLEANUP}`);

  await channel.consume(QUEUES.CLEANUP, async (msg) => {
    if (!msg) return;

    try {
      const job: RabbitJobMessage = JSON.parse(msg.content.toString());
      logger.info({ jobName: job.jobName, payload: job.payload }, 'Cleanup Worker: Processing cleanup task...');

      if (job.jobName === 'cleanup-cloudinary-file') {
        const { publicId, resourceType } = job.payload;
        await cloudinaryService.deleteAsset(publicId, resourceType || 'image');
        logger.info({ publicId }, '🧹 [Cleanup Worker] Successfully deleted orphaned Cloudinary asset!');
      }

      channel.ack(msg);
    } catch (err) {
      logger.error({ err }, 'Cleanup Worker: Deletion attempt failed. Sending NACK -> DLQ');
      channel.nack(msg, false, false);
    }
  });
};
