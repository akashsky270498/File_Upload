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

  it('POST /api/v1/auth/forgot-password should return HTTP 400 Bad Request when email is invalid', async () => {
    const response = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({
        email: 'not-an-email',
      });

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errorCode', 'VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/reset-password should return HTTP 400 Bad Request when missing OTP or weak password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        email: 'user@example.com',
        otp: '123', // should be 6 digits
        newPassword: 'weak',
      });

    expect(response.status).toEqual(400);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errorCode', 'VALIDATION_ERROR');
  });

  it('POST /api/v1/auth/change-password should return HTTP 401 Unauthorized when missing Authorization header', async () => {
    const response = await request(app)
      .post('/api/v1/auth/change-password')
      .send({
        currentPassword: 'OldPassword123!',
        newPassword: 'NewPassword123!',
      });

    expect(response.status).toEqual(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('errorCode', 'UNAUTHORIZED');
  });
});
