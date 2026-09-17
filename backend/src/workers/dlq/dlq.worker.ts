import { getRabbitChannel, QUEUES } from '../../config/rabbitmq';
import { logger } from '../../common/logger';

export const startDlqWorker = async (): Promise<void> => {
  const channel = getRabbitChannel();

  logger.info(`Starting Dead Letter Queue (DLQ) Worker listening on queue: ${QUEUES.DLQ}`);

  await channel.consume(QUEUES.DLQ, (msg) => {
    if (!msg) return;

    try {
      const payload = msg.content.toString();
      logger.error(
        { dlqPayload: payload, headers: msg.properties.headers },
        '☠️ [Dead Letter Queue Monitor] Alert: Failed job moved to DLQ!'
      );
      channel.ack(msg);
    } catch (err) {
      logger.error({ err }, 'DLQ Worker error');
    }
  });
};
