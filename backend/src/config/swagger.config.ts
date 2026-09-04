import swaggerJSDoc from 'swagger-jsdoc';
import { env } from './env.config';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'OmniMedia Upload & Search Platform API',
      version: '1.0.0',
      description: 'API Documentation for Multimedia File Upload, Search, Authentication, Users, and Notifications.',
      contact: {
        name: 'API Engineering Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT Access Token',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/modules/**/*.ts',
    './dist/modules/**/*.js',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
