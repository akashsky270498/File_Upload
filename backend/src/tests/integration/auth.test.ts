import request from 'supertest';
import { createApp } from '../../app';
import { Express } from 'express';
import { redisClient } from '../../config/redis';

describe('Auth API Integration Tests', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    if (redisClient) {
      await redisClient.quit().catch(() => {});
    }
  });

  it('POST /api/v1/auth/register should return HTTP 400 Bad Request when missing required fields', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'invalid-email',
      });

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errorCode', 'VALIDATION_ERROR');
    expect(response.body).toHaveProperty('message');
  });

  it('POST /api/v1/auth/login should return HTTP 400 Bad Request when missing password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user@example.com',
      });

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errorCode', 'VALIDATION_ERROR');
  });
});
