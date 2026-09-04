import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.config';
import { swaggerSpec } from './config/swagger.config';
import { errorHandler } from './common/middlewares/errorHandler';
import authRoutes from './modules/auth/auth.routes';
import fileRoutes from './modules/files/files.routes';
import userRoutes from './modules/users/users.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import { sendResponse } from './common/utils/apiResponse';

const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Healthcheck Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  sendResponse(res, 200, 'Multimedia API Service is operational.', {
    status: 'up',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Module API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);

// Global 404 Route Handler
app.use('*', (_req: Request, res: Response) => {
  sendResponse(res, 404, 'API endpoint not found.');
});

// Global Exception Handler
app.use(errorHandler);

export default app;
