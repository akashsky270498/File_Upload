import { Kafka, Producer, Consumer, Partitioners } from 'kafkajs';
import { env } from './env';
import { logger } from '../common/logger';

export const KAFKA_TOPICS = {
  USER_EVENTS: 'omnimedia.user.events',
  MEDIA_EVENTS: 'omnimedia.media.events',
  AUDIT_EVENTS: 'omnimedia.audit.events',
} as const;

export const kafka = new Kafka({
  clientId: 'omnimedia-backend',
  brokers: env.kafka.brokers,
  retry: {
    initialRetryTime: 300,
    retries: 8,
  },
});

export const kafkaProducer: Producer = kafka.producer({
  createPartitioner: Partitioners.DefaultPartitioner,
  allowAutoTopicCreation: true,
});

export const kafkaConsumer: Consumer = kafka.consumer({
  groupId: 'omnimedia-consumer-group',
  retry: {
    initialRetryTime: 1000,
    retries: 10,
    maxRetryTime: 30000,
  },
});

export const connectKafka = async (): Promise<void> => {
  try {
    const admin = kafka.admin();
    await admin.connect();

    // Auto-create topics if they do not exist
    const existingTopics = await admin.listTopics();
    const topicsToCreate = Object.values(KAFKA_TOPICS).filter(
      (topic) => !existingTopics.includes(topic)
    );

    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map((topic) => ({
          topic,
          numPartitions: 3,
          replicationFactor: 1,
        })),
      });
      logger.info({ topicsToCreate }, 'Kafka Admin: Created topics with 3 partitions.');
    }

    await admin.disconnect();

    // Connect Producer
    await kafkaProducer.connect();
    logger.info('Kafka Producer connected successfully.');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Kafka brokers.');
    throw error;
  }
};

export const disconnectKafka = async (): Promise<void> => {
  try {
    await kafkaProducer.disconnect();
    await kafkaConsumer.disconnect();
    logger.info('Kafka Producer & Consumer disconnected cleanly.');
  } catch (error) {
    logger.error({ error }, 'Error during Kafka disconnect.');
  }
};
