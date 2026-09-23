// ==========================================
// 📊 PROMETHEUS METRICS COLLECTION MIDDLEWARE
// ==========================================
// Ye middleware har HTTP Request ki duration, endpoint route, HTTP status code record karke Prometheus Metrics record karta hai.

import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDurationSeconds } from '../../config/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Prometheus metrics scraping route `/metrics` ko ignore karte hain bloat se bachne ke liye
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;

    const route = req.route ? req.route.path : req.path || 'unknown_route';
    const statusCode = res.statusCode.toString();

    // Increment Total HTTP requests counter
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status_code: statusCode,
    });

    // Record response duration histogram
    httpRequestDurationSeconds.observe(
      {
        method: req.method,
        route,
        status_code: statusCode,
      },
      durationInSeconds
    );
  });

  next();
};

