import { startEmailWorker } from './email/email.worker';
import { startMediaWorker } from './media/media.worker';
import { startCleanupWorker } from './cleanup/cleanup.worker';
import { startDlqWorker } from './dlq/dlq.worker';
import { logger } from '../common/logger';

export const startAllWorkers = async (): Promise<void> => {
  try {
    await startEmailWorker();
    await startMediaWorker();
    await startCleanupWorker();
    await startDlqWorker();
    logger.info('All RabbitMQ background worker consumers started successfully.');
  } catch (error) {
    logger.error({ error }, 'Failed to start RabbitMQ background workers.');
  }
};
