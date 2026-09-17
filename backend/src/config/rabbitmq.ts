import amqp, { Connection, Channel } from 'amqplib';
import { env } from './env';
import { logger } from '../common/logger';

export const QUEUES = {
  EMAIL: 'email.queue',
  MEDIA: 'media.queue',
  CLEANUP: 'cleanup.queue',
  DLQ: 'dlq.queue',
} as const;

export const EXCHANGES = {
  JOBS: 'omnimedia.jobs.exchange',
  DLX: 'omnimedia.dlx.exchange',
} as const;

export const ROUTING_KEYS = {
  EMAIL: 'email.key',
  MEDIA: 'media.key',
  CLEANUP: 'cleanup.key',
  DLQ: 'dlq.key',
} as const;

let connection: Connection | null = null;
let channel: Channel | null = null;

export const connectRabbitMQ = async (): Promise<{ connection: Connection; channel: Channel }> => {
  try {
    connection = await amqp.connect(env.rabbitmq.url);
    channel = await connection.createChannel();

    logger.info('RabbitMQ connection and channel created successfully.');

    // 1. Assert Dead Letter Exchange & Queue
    await channel.assertExchange(EXCHANGES.DLX, 'direct', { durable: true });
    await channel.assertQueue(QUEUES.DLQ, { durable: true });
    await channel.bindQueue(QUEUES.DLQ, EXCHANGES.DLX, ROUTING_KEYS.DLQ);

    // 2. Assert Main Jobs Exchange
    await channel.assertExchange(EXCHANGES.JOBS, 'direct', { durable: true });

    // 3. Assert Work Queues with Dead Letter Exchange Configuration
    const queueOptions = {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXCHANGES.DLX,
        'x-dead-letter-routing-key': ROUTING_KEYS.DLQ,
      },
    };

    await channel.assertQueue(QUEUES.EMAIL, queueOptions);
    await channel.bindQueue(QUEUES.EMAIL, EXCHANGES.JOBS, ROUTING_KEYS.EMAIL);

    await channel.assertQueue(QUEUES.MEDIA, queueOptions);
    await channel.bindQueue(QUEUES.MEDIA, EXCHANGES.JOBS, ROUTING_KEYS.MEDIA);

    await channel.assertQueue(QUEUES.CLEANUP, queueOptions);
    await channel.bindQueue(QUEUES.CLEANUP, EXCHANGES.JOBS, ROUTING_KEYS.CLEANUP);

    // Set Prefetch Limit (Fair Dispatch - 1 job per worker at a time)
    await channel.prefetch(1);

    return { connection, channel };
  } catch (error) {
    logger.error({ error }, 'Failed to connect to RabbitMQ broker.');
    throw error;
  }
};

export const getRabbitChannel = (): Channel => {
  if (!channel) {
    throw new Error('RabbitMQ channel is not initialized. Call connectRabbitMQ first.');
  }
  return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
  try {
    if (channel) {
      const ch = channel;
      channel = null;
      await ch.close().catch(() => {});
    }
    if (connection) {
      const conn = connection;
      connection = null;
      await conn.close().catch(() => {});
    }
    logger.info('RabbitMQ connection closed cleanly.');
  } catch (err) {
    logger.error({ err }, 'Error during RabbitMQ disconnection.');
  }
};
