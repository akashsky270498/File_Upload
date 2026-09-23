// ==========================================
// 🚀 SERVER ENTRY POINT (Backend Start Script)
// ==========================================
// Ye file Pure Backend Application ki Entry Point hai.
// Yaha se Sabhi Databases, Caches, Message Queues aur Express Server start hote hain.

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

/**
 * Main Server Initialization Function
 */
const startServer = async (): Promise<void> => {
  try {
    // 0. OpenTelemetry Distributed Tracing (Performance tracking & logging trace IDs)
    initTracing().catch(() => {});

    // 1. Primary Databases ko pehle connect karte hain (PostgreSQL Database & Redis Cache)
    await Promise.all([connectPostgres(), connectRedis()]);

    // 2. Express Web App, HTTP Server aur Real-time WebSockets (Socket.IO) ko create & bind karte hain
    const app = await createApp();
    const server = http.createServer(app);
    socketGateway.init(server);

    // 3. Server Listener ko start karte hain (Instant response ke liye pehle listen karwa dete hain)
    server.listen(env.port, () => {
      logger.info(`Server running in [${env.nodeEnv}] mode on http://localhost:${env.port}`);
    });

    // 4. Background Services ko non-blocking tarike se run karte hain (RabbitMQ, Kafka, Elasticsearch)
    // Isse server quick start ho jata hai background tasks launch hone tak wait nahi karta
    Promise.all([
      connectRabbitMQ().then(() => startAllWorkers()), // File processing queues
      connectKafka().then(() => startAllKafkaConsumers()), // Real-time notification events
      connectElasticsearch().then(() => esIndexManager.initFilesIndex()), // Fast search index
    ]).catch((err) => {
      logger.error({ err }, 'Background subsystem initialization warning.');
    });

    // ==========================================
    // 🛑 GRACEFUL SHUTDOWN (Server band hone par clean cleanup)
    // ==========================================
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

    // System signals (ctrl+c ya deployment stop) ko capture karna
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error({ error }, 'Failed to bootstrap server application.');
    process.exit(1);
  }
};

startServer();

