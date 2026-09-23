// ==========================================
// ⏱️ REDIS DISTRIBUTED RATE LIMITER MIDDLEWARE
// ==========================================
// Ye middleware Client IP aur Endpoint Route ke आधार par DDoS attacks aur spam requests prevent karta hai.

import { Request, Response, NextFunction } from 'express';
import { redisService } from '../../infrastructure/redis/redis.service';

/**
 * Rate Limiting Guard Generator
 * @param limit Total requests allowed in window
 * @param windowSeconds Time window duration in seconds
 */
export const rateLimitMiddleware = (limit: number = 10, windowSeconds: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const identifier = `${req.path}:${clientIp}`;

    // Redis atomic Sliding Window Counter check
    const { allowed, remaining, resetSeconds } = await redisService.rateLimit(
      identifier,
      limit,
      windowSeconds
    );

    // Rate Limit HTTP Headers attach karte hain
    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    // Limit exceed hone par HTTP 429 Too Many Requests response return karte hain
    if (!allowed) {
      res.status(429).json({
        success: false,
        errorCode: 'TOO_MANY_REQUESTS',
        message: `Too many requests. Please try again in ${resetSeconds} seconds.`,
      });
      return;
    }

    next();
  };
};

