import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OmniMedia Backend REST API',
      version: '2.0.0',
      description: 'Production-grade Multimedia Upload, Search, and Real-time Backend System',
      contact: {
        name: 'OmniMedia Platform Architect',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Provide your JWT Access Token (format: Bearer <token>)',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/modules/**/*.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
