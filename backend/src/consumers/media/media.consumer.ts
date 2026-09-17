import { KafkaEventEnvelope } from '../../infrastructure/kafka/kafka.producer';
import { logger } from '../../common/logger';

export const handleMediaEvent = async (envelope: KafkaEventEnvelope): Promise<void> => {
  try {
    const { eventType, aggregateId, payload } = envelope;

    logger.info(
      { eventType, fileId: aggregateId, payload },
      `Kafka Media Consumer: Processed domain event '${eventType}' for media '${aggregateId}'`
    );

    switch (eventType) {
      case 'MEDIA_UPLOADED':
        logger.info({ fileId: aggregateId, fileType: payload.fileType }, 'Media Uploaded event received in consumer pipeline');
        break;
      case 'MEDIA_DELETED':
        logger.info({ fileId: aggregateId }, 'Media Deleted event received in consumer pipeline');
        break;
      default:
        logger.debug({ eventType }, 'Unhandled Media Event Type');
    }
  } catch (error) {
    logger.error({ error, envelope }, 'Kafka Media Consumer: Error processing message');
  }
};
