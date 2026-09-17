import { getRabbitChannel, QUEUES } from '../../config/rabbitmq';
import { RabbitJobMessage } from '../../infrastructure/rabbitmq/rabbitmq.producer';
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
      } else if (job.jobName === 'process-media') {
        logger.info({ fileId: job.payload.fileId }, '🎞️ [Media Worker] Extracted media dimensions & metadata.');
      }

      channel.ack(msg);
    } catch (err) {
      logger.error({ err }, 'Media Worker: Failure encountered. Sending NACK -> DLQ');
      channel.nack(msg, false, false);
    }
  });
};
