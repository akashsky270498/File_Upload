import { describe, it, expect, beforeAll, afterEach, afterAll } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../src/app';
import { User } from '../../src/modules/users/user.model';

describe('Auth Endpoints Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/multimedia_test_db';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterEach(async () => {
    await User.deleteMany({ email: 'testuser@example.com' });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('POST /api/auth/register - Should register a new user successfully', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('testuser@example.com');
    expect(res.body.data.tokens.accessToken).toBeDefined();
  });

  it('POST /api/auth/login - Should fail with invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
