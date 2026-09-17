import { redisClient } from '../../config/redis';
import { logger } from '../../common/logger';
import { File } from '../postgres/models/file.model';

export class RedisService {
  /**
   * USE CASE 1 — Cache-Aside Pattern
   */
  public async getCache<T>(key: string): Promise<T | null> {
    try {
      const cachedValue = await redisClient.get(key);
      if (!cachedValue) return null;
      return JSON.parse(cachedValue) as T;
    } catch (err) {
      logger.error({ err, key }, 'Redis getCache error');
      return null;
    }
  }

  public async setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await redisClient.setex(key, ttlSeconds, serialized);
    } catch (err) {
      logger.error({ err, key }, 'Redis setCache error');
    }
  }

  public async delCache(key: string): Promise<void> {
    try {
      await redisClient.del(key);
    } catch (err) {
      logger.error({ err, key }, 'Redis delCache error');
    }
  }

  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch (err) {
      logger.error({ err, pattern }, 'Redis invalidatePattern error');
    }
  }

  /**
   * USE CASE 2 — Short-Lived OTP Storage
   */
  public async storeOtpInRedis(email: string, otp: string, ttlSeconds: number = 300): Promise<void> {
    const key = `otp:login:${email.toLowerCase()}`;
    await redisClient.setex(key, ttlSeconds, otp);
  }

  public async getOtpFromRedis(email: string): Promise<string | null> {
    const key = `otp:login:${email.toLowerCase()}`;
    return redisClient.get(key);
  }

  public async deleteOtpFromRedis(email: string): Promise<void> {
    const key = `otp:login:${email.toLowerCase()}`;
    await redisClient.del(key);
  }

  /**
   * USE CASE 3 — Distributed Rate Limiting (Sliding Window / Fixed Window)
   */
  public async rateLimit(
    identifier: string,
    limit: number = 10,
    windowSeconds: number = 60
  ): Promise<{ allowed: boolean; remaining: number; resetSeconds: number }> {
    const key = `ratelimit:${identifier}`;
    try {
      const current = await redisClient.incr(key);
      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      const ttl = await redisClient.ttl(key);

      if (current > limit) {
        return { allowed: false, remaining: 0, resetSeconds: ttl > 0 ? ttl : windowSeconds };
      }

      return { allowed: true, remaining: limit - current, resetSeconds: ttl > 0 ? ttl : windowSeconds };
    } catch (err) {
      logger.error({ err, key }, 'Redis rateLimit error. Falling back to allow');
      return { allowed: true, remaining: 1, resetSeconds: 0 };
    }
  }

  /**
   * USE CASE 4 — View Counters (INCR & Aggregate Flush to PostgreSQL)
   */
  public async incrementFileViewCount(fileId: string): Promise<number> {
    const key = `file:views:${fileId}`;
    try {
      return await redisClient.incr(key);
    } catch (err) {
      logger.error({ err, fileId }, 'Redis incrementFileViewCount error');
      return 0;
    }
  }

  public async flushAggregatedViewCountsToPostgres(): Promise<void> {
    try {
      const keys = await redisClient.keys('file:views:*');
      if (keys.length === 0) return;

      for (const key of keys) {
        const fileId = key.replace('file:views:', '');
        const viewsCountStr = await redisClient.getset(key, '0');
        const viewsToAdd = Number(viewsCountStr || 0);

        if (viewsToAdd > 0) {
          await File.increment('viewsCount', {
            by: viewsToAdd,
            where: { id: fileId },
          });
          logger.info({ fileId, viewsToAdd }, 'Flushed aggregated Redis view count to PostgreSQL.');
        }
      }
    } catch (err) {
      logger.error({ err }, 'Error flushing Redis view counts to PostgreSQL');
    }
  }

  /**
   * USE CASE 5 — Distributed Locking (SET key val NX PX ms)
   */
  public async acquireLock(lockKey: string, ttlMs: number = 10000): Promise<string | null> {
    const lockValue = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const key = `lock:${lockKey}`;
    try {
      const result = await redisClient.set(key, lockValue, 'PX', ttlMs, 'NX');
      if (result === 'OK') {
        return lockValue;
      }
      return null;
    } catch (err) {
      logger.error({ err, lockKey }, 'Redis acquireLock error');
      return null;
    }
  }

  public async releaseLock(lockKey: string, lockValue: string): Promise<boolean> {
    const key = `lock:${lockKey}`;
    try {
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      const result = await redisClient.eval(script, 1, key, lockValue);
      return result === 1;
    } catch (err) {
      logger.error({ err, lockKey }, 'Redis releaseLock error');
      return false;
    }
  }
}

export const redisService = new RedisService();
