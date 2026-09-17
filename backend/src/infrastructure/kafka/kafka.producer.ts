import { kafkaProducer, KAFKA_TOPICS } from '../../config/kafka';
import { logger } from '../../common/logger';
import { v4 as uuidv4 } from 'uuid';

export interface KafkaEventEnvelope<T = any> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  payload: T;
  timestamp: string;
}

export class KafkaProducerService {
  /**
   * Publish a partitioned domain event to a Kafka topic
   */
  public async sendEvent<T>(
    topic: string,
    eventType: string,
    aggregateId: string,
    payload: T
  ): Promise<void> {
    try {
      const envelope: KafkaEventEnvelope<T> = {
        eventId: uuidv4(),
        eventType,
        aggregateId,
        payload,
        timestamp: new Date().toISOString(),
      };

      await kafkaProducer.send({
        topic,
        messages: [
          {
            key: aggregateId, // Partition key ensures ordering per aggregate entity
            value: JSON.stringify(envelope),
            headers: {
              eventType,
              timestamp: envelope.timestamp,
            },
          },
        ],
      });

      logger.info(
        { topic, eventType, aggregateId, eventId: envelope.eventId },
        `Kafka Producer: Published event '${eventType}' to topic '${topic}'`
      );
    } catch (error) {
      logger.error(
        { error, topic, eventType, aggregateId },
        `Kafka Producer: Failed to publish event '${eventType}'`
      );
    }
  }

  public async publishUserEvent<T>(eventType: string, userId: string, payload: T): Promise<void> {
    return this.sendEvent(KAFKA_TOPICS.USER_EVENTS, eventType, userId, payload);
  }

  public async publishMediaEvent<T>(eventType: string, fileId: string, payload: T): Promise<void> {
    return this.sendEvent(KAFKA_TOPICS.MEDIA_EVENTS, eventType, fileId, payload);
  }

  public async publishAuditEvent<T>(action: string, userId: string, payload: T): Promise<void> {
    return this.sendEvent(KAFKA_TOPICS.AUDIT_EVENTS, action, userId, payload);
  }
}

export const kafkaProducerService = new KafkaProducerService();
