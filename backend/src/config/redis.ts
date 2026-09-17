import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../common/logger';

export const redisClient = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  password: env.redis.password,
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 100, 3000);
    logger.warn({ times, delay }, 'Reconnecting to Redis server...');
    return delay;
  },
});

redisClient.on('connect', () => {
  logger.info('Connecting to Redis server...');
});

redisClient.on('ready', () => {
  logger.info('Redis connection established successfully.');
});

redisClient.on('error', (err) => {
  logger.error({ err }, 'Redis connection error encountered.');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error({ error }, 'Failed to connect to Redis instance.');
  }
};
