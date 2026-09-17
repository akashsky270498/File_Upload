import { KafkaEventEnvelope } from '../../infrastructure/kafka/kafka.producer';
import { logger } from '../../common/logger';

export const handleUserEvent = async (envelope: KafkaEventEnvelope): Promise<void> => {
  try {
    const { eventType, aggregateId, payload } = envelope;

    logger.info(
      { eventType, userId: aggregateId, payload },
      `Kafka User Consumer: Processed domain event '${eventType}' for user '${aggregateId}'`
    );

    switch (eventType) {
      case 'USER_REGISTERED':
        logger.info({ userId: aggregateId, email: payload.email }, 'User Registered event received in consumer pipeline');
        break;
      case 'USER_LOGGED_IN':
        logger.info({ userId: aggregateId, ip: payload.ip }, 'User Logged In event received in consumer pipeline');
        break;
      default:
        logger.debug({ eventType }, 'Unhandled User Event Type');
    }
  } catch (error) {
    logger.error({ error, envelope }, 'Kafka User Consumer: Error processing message');
  }
};
