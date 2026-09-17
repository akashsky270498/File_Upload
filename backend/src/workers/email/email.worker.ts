import { getRabbitChannel, QUEUES } from '../../config/rabbitmq';
import { RabbitJobMessage } from '../../infrastructure/rabbitmq/rabbitmq.producer';
import { logger } from '../../common/logger';

export const startEmailWorker = async (): Promise<void> => {
  const channel = getRabbitChannel();

  logger.info(`Starting Email Worker listening on queue: ${QUEUES.EMAIL}`);

  await channel.consume(QUEUES.EMAIL, async (msg) => {
    if (!msg) return;

    try {
      const job: RabbitJobMessage = JSON.parse(msg.content.toString());
      logger.info({ jobName: job.jobName, payload: job.payload }, 'Email Worker: Processing job...');

      if (job.jobName === 'send-welcome-email') {
        logger.info({ email: job.payload.email }, '📨 [Mock Email Provider] Sent Welcome Email!');
      } else if (job.jobName === 'send-login-otp') {
        logger.info({ email: job.payload.email, otp: job.payload.otp }, '🔑 [Mock Email Provider] Sent Login OTP Email!');
      }

      // Send Acknowledgement to RabbitMQ Broker
      channel.ack(msg);
    } catch (err) {
      logger.error({ err }, 'Email Worker: Error processing job. Sending NACK -> Dead Letter Queue');
      // Send NACK without requeueing (requeue = false) to send message directly to DLQ
      channel.nack(msg, false, false);
    }
  });
};
