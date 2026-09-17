import 'reflect-metadata';
import { createApp } from './app';
import { env } from './config/env';
import { logger } from './common/logger';
import { connectPostgres, sequelize } from './infrastructure/postgres';
import { connectRedis, redisClient } from './config/redis';
import { connectRabbitMQ, closeRabbitMQ } from './config/rabbitmq';
import { connectKafka, disconnectKafka } from './config/kafka';
import { connectElasticsearch } from './config/elasticsearch';
import { esIndexManager } from './infrastructure/elasticsearch/index.manager';
import { startAllWorkers } from './workers';
import { startAllKafkaConsumers } from './consumers';

import http from 'http';
import { initTracing } from './config/tracing';
import { socketGateway } from './modules/notifications/socket.gateway';

const startServer = async (): Promise<void> => {
  try {
    // 0. Initialize OpenTelemetry Distributed Tracing (non-blocking)
    initTracing().catch(() => {});

    // 1. Connect to PostgreSQL Database
    await connectPostgres();

    // 2. Connect to Redis Instance
    await connectRedis();

    // 3. Connect to RabbitMQ Broker & Start Workers
    await connectRabbitMQ();
    await startAllWorkers();

    // 4. Connect to Kafka Brokers & Start Event Consumers
    await connectKafka();
    await startAllKafkaConsumers();

    // 5. Connect to Elasticsearch & Initialize Index Mapping
    await connectElasticsearch();
    await esIndexManager.initFilesIndex();

    // 6. Instantiate Express Application & HTTP Server
    const app = await createApp();
    const server = http.createServer(app);

    // 7. Initialize Socket.IO Gateway with Redis Adapter
    socketGateway.init(server);

    // 8. Start HTTP Server Listener
    server.listen(env.port, () => {
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

          await disconnectKafka();
          logger.info('Kafka producer & consumers disconnected.');

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
