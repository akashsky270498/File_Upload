// ==========================================
// 👷 RABBITMQ BACKGROUND WORKERS INITIALIZER
// ==========================================
// Ye file RabbitMQ Queue Consumers (Email Worker, Media Worker, Cleanup Worker, DLQ Worker) ko bootstrap karti hai.

import { startEmailWorker } from './email/email.worker';
import { startMediaWorker } from './media/media.worker';
import { startCleanupWorker } from './cleanup/cleanup.worker';
import { startDlqWorker } from './dlq/dlq.worker';
import { logger } from '../common/logger';

export const startAllWorkers = async (): Promise<void> => {
  try {
    await startEmailWorker();   // 1. Email delivery queue consumer
    await startMediaWorker();   // 2. Media processing & thumbnail queue consumer
    await startCleanupWorker(); // 3. Cloudinary cleanup retry queue consumer
    await startDlqWorker();     // 4. Dead Letter Queue (DLQ) failed jobs auditor
    logger.info('All RabbitMQ background worker consumers started successfully.');
  } catch (error) {
    logger.error({ error }, 'Failed to start RabbitMQ background workers.');
  }
};

