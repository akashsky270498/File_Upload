import { getRabbitChannel, EXCHANGES, ROUTING_KEYS } from '../../config/rabbitmq';
import { logger } from '../../common/logger';

export interface RabbitJobMessage<T = any> {
  jobName: string;
  payload: T;
  timestamp: string;
  retryCount?: number;
}

export class RabbitMQProducer {
  /**
   * Publish a persistent background job message to a target exchange & routing key
   */
  public async publishJob<T>(routingKey: string, jobName: string, payload: T): Promise<boolean> {
    try {
      const channel = getRabbitChannel();
      const message: RabbitJobMessage<T> = {
        jobName,
        payload,
        timestamp: new Date().toISOString(),
        retryCount: 0,
      };

      const buffer = Buffer.from(JSON.stringify(message));

      const published = channel.publish(EXCHANGES.JOBS, routingKey, buffer, {
        persistent: true, // Message durability on disk
        contentType: 'application/json',
      });

      logger.info(
        { routingKey, jobName, published },
        `RabbitMQ Producer: Published background job '${jobName}' to key '${routingKey}'`
      );

      return published;
    } catch (error) {
      logger.error({ error, routingKey, jobName }, 'RabbitMQ Producer: Failed to publish message');
      return false;
    }
  }

  public async publishEmailJob<T>(jobName: string, payload: T): Promise<boolean> {
    return this.publishJob(ROUTING_KEYS.EMAIL, jobName, payload);
  }

  public async publishMediaJob<T>(jobName: string, payload: T): Promise<boolean> {
    return this.publishJob(ROUTING_KEYS.MEDIA, jobName, payload);
  }

  public async publishCleanupJob<T>(jobName: string, payload: T): Promise<boolean> {
    return this.publishJob(ROUTING_KEYS.CLEANUP, jobName, payload);
  }
}

export const rabbitMQProducer = new RabbitMQProducer();
