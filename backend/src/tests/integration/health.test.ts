import request from 'supertest';
import { createApp } from '../../app';
import { Express } from 'express';
import { redisClient } from '../../config/redis';

describe('Health Check API Integration Test', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    if (redisClient) {
      await redisClient.quit().catch(() => {});
    }
  });

  it('GET /health should return HTTP 200 with status UP', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('status', 'UP');
    expect(response.body).toHaveProperty('timestamp');
  });
});
