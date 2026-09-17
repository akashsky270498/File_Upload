import { EachMessagePayload } from 'kafkajs';
import { kafkaConsumer, KAFKA_TOPICS } from '../config/kafka';
import { KafkaEventEnvelope } from '../infrastructure/kafka/kafka.producer';
import { handleAuditEvent } from './audit/audit.consumer';
import { handleUserEvent } from './user/user.consumer';
import { handleMediaEvent } from './media/media.consumer';
import { logger } from '../common/logger';

export const startAllKafkaConsumers = async (): Promise<void> => {
  try {
    await kafkaConsumer.connect();
    logger.info('Kafka Consumer connected to group omnimedia-consumer-group.');

    // Subscribe to all domain event topics
    await kafkaConsumer.subscribe({
      topics: Object.values(KAFKA_TOPICS),
      fromBeginning: false,
    });

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        if (!message.value) return;

        try {
          const envelope: KafkaEventEnvelope = JSON.parse(message.value.toString());
          logger.debug(
            { topic, partition, offset: message.offset, eventType: envelope.eventType },
            'Kafka Consumer: Routing message...'
          );

          switch (topic) {
            case KAFKA_TOPICS.AUDIT_EVENTS:
              await handleAuditEvent(envelope);
              break;
            case KAFKA_TOPICS.USER_EVENTS:
              await handleUserEvent(envelope);
              break;
            case KAFKA_TOPICS.MEDIA_EVENTS:
              await handleMediaEvent(envelope);
              break;
            default:
              logger.warn({ topic }, 'Received message from unmapped Kafka topic');
          }
        } catch (err) {
          logger.error({ err, topic, partition }, 'Kafka Consumer: Error processing message batch');
        }
      },
    });

    logger.info('Kafka Consumer loop started successfully.');
  } catch (error) {
    logger.error({ error }, 'Failed to start Kafka Consumers.');
  }
};
