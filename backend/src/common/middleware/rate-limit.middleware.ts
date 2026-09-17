import { Request, Response, NextFunction } from 'express';
import { redisService } from '../../infrastructure/redis/redis.service';

export const rateLimitMiddleware = (limit: number = 10, windowSeconds: number = 60) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const identifier = `${req.path}:${clientIp}`;

    const { allowed, remaining, resetSeconds } = await redisService.rateLimit(
      identifier,
      limit,
      windowSeconds
    );

    res.setHeader('X-RateLimit-Limit', limit);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

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
