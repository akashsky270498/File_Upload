import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './common/middleware/error-handler';
import { NotFoundError } from './common/errors/app-error';
import authRoutes from './modules/auth/auth.routes';
import uploadRoutes from './modules/uploads/upload.routes';

export const createApp = (): Express => {
  const app: Express = express();

  // Global Middlewares
  app.use(helmet({ contentSecurityPolicy: false })); // Allow Swagger UI inline scripts
  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic Health Check Endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    });
  });

  // Swagger Documentation UI Route
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // REST API Version 1 Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/uploads', uploadRoutes);

  // Handle 404 Route Not Found
  app.use((_req: Request, _res: Response, next) => {
    next(new NotFoundError('The requested resource was not found on this server'));
  });

  // Global Error Handler Middleware
  app.use(errorHandler);

  return app;
};
