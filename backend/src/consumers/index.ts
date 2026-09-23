// ==========================================
// 🚀 KAFKA EVENT CONSUMERS ROUTER
// ==========================================
// Ye file Kafka Event Bus Consumers ko subscribe karwa kar `AUDIT_EVENTS`, `USER_EVENTS`, aur `MEDIA_EVENTS` route karti hai.

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

    // Sabhi Kafka topics subscribe karte hain
    await kafkaConsumer.subscribe({
      topics: Object.values(KAFKA_TOPICS),
      fromBeginning: false,
    });

    // Kafka message consumer loop
    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }: EachMessagePayload) => {
        if (!message.value) return;

        try {
          const envelope: KafkaEventEnvelope = JSON.parse(message.value.toString());
          logger.debug(
            { topic, partition, offset: message.offset, eventType: envelope.eventType },
            'Kafka Consumer: Routing message...'
          );

          // Topic-wise event handlers router
          switch (topic) {
            case KAFKA_TOPICS.AUDIT_EVENTS:
              await handleAuditEvent(envelope); // Audit log DB saver
              break;
            case KAFKA_TOPICS.USER_EVENTS:
              await handleUserEvent(envelope);   // User registration metrics
              break;
            case KAFKA_TOPICS.MEDIA_EVENTS:
              await handleMediaEvent(envelope);  // Media events processor
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

