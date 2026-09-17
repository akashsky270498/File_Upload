import 'reflect-metadata';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './common/logger';
import { connectPostgres, sequelize } from './infrastructure/postgres';
import { connectRedis, redisClient } from './config/redis';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq';
import { startAllWorkers } from './workers';

const startServer = async (): Promise<void> => {
  try {
    // 1. Connect to PostgreSQL Database
    await connectPostgres();

    // 2. Connect to Redis Instance
    await connectRedis();

    // 3. Connect to RabbitMQ Broker & Start Workers
    await connectRabbitMQ();
    await startAllWorkers();

    // 4. Instantiate Express Application
    const app = createApp();

    // 5. Start HTTP Server Listener
    const server = app.listen(env.port, () => {
      logger.info(`Server running in [${env.nodeEnv}] mode on http://localhost:${env.port}`);
    });

    // Graceful Shutdown handling
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Initiating graceful shutdown...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await sequelize.close();
          logger.info('PostgreSQL connection pool closed.');

          redisClient.disconnect();
          logger.info('Redis connection client closed.');

          await closeRabbitMQ();
          logger.info('RabbitMQ connection closed.');

          process.exit(0);
        } catch (err) {
          logger.error({ err }, 'Error during database disconnection.');
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to bootstrap server application.');
    process.exit(1);
  }
};

startServer();
