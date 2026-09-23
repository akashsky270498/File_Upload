// ==========================================
// 🛠️ EXPRESS APP SETUP & MIDDLEWARES
// ==========================================
// Ye file Express App ko configure karti hai: Middlewares, CORS, Cookies, Routes & GraphQL Setup.

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './common/middleware/error-handler';
import { NotFoundError } from './common/errors/app-error';
import { rateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { metricsMiddleware } from './common/middleware/metrics.middleware';
import { registry } from './config/metrics';
import authRoutes from './modules/auth/auth.routes';
import uploadRoutes from './modules/uploads/upload.routes';
import searchRoutes from './modules/search/search.routes';
import usersRoutes from './modules/users/users.routes';

import { setupGraphQL } from './graphql';

export const createApp = async (): Promise<Express> => {
  const app: Express = express();

  // 1. Security Headers Middleware (Helmet) - Inline scripts allowed for Swagger & GraphQL UI
  app.use(helmet({ contentSecurityPolicy: false }));

  // 2. Cross-Origin Resource Sharing (CORS) - Allow Frontend (http://localhost:5173) & HttpOnly Cookies
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true, // Secure HttpOnly Cookies allow karne ke liye true hona zaroori hai
      exposedHeaders: ['X-Access-Token', 'X-Refresh-Token', 'Set-Cookie'],
    })
  );

  // 3. Cookie Parser Middleware (Req object se HttpOnly Cookies parse karne ke liye)
  app.use(cookieParser());

  // 4. Body Parsers (JSON & URL-Encoded data accept karne ke liye, max 10mb limit)
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Prometheus Metrics Collection Middleware (API latency, status codes log karne ke liye)
  app.use(metricsMiddleware);

  // 6. Prometheus Metrics Endpoint for Grafana monitoring (/metrics)
  app.get('/metrics', async (_req: Request, res: Response) => {
    try {
      res.set('Content-Type', registry.contentType);
      res.end(await registry.metrics());
    } catch (err) {
      res.status(500).end(err);
    }
  });

  // 7. Health Check Endpoint (/health) - AWS/K8s Liveness Probe ke liye
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    });
  });

  // 8. Swagger API Documentation Endpoint (/api-docs)
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // 9. GraphQL API Setup (Apollo Server 4 @ /graphql)
  const graphqlMiddleware = await setupGraphQL();
  app.use('/graphql', express.json(), graphqlMiddleware);

  // 10. REST API Version 1 Routes (Redis Distributed Rate Limiter se protected)
  app.use('/api/v1/auth', rateLimitMiddleware(10, 60), authRoutes);   // Login, Register, Refresh, Logout
  app.use('/api/v1/uploads', rateLimitMiddleware(5, 60), uploadRoutes); // File Upload, View, Delete
  app.use('/api/v1/search', rateLimitMiddleware(20, 60), searchRoutes); // Fast Elasticsearch Search & Filter
  app.use('/api/v1/users', rateLimitMiddleware(20, 60), usersRoutes);   // User Profile update, avatar upload

  // 11. 404 Route Not Found Catch-All Handler
  app.use((_req: Request, _res: Response, next) => {
    next(new NotFoundError('The requested resource was not found on this server'));
  });

  // 12. Centralized Error Handler Middleware (Sabhi Controller Errors yahan process hote hain)
  app.use(errorHandler);

  return app;
};

