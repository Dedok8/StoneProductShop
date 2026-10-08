import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { asEnvelope } from '../utils/api-envelope';
import { createTestApp } from '../utils/test-app.factory';

import { PrismaService } from '@/shared';

interface AccessTokenPayload {
  accessToken: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const registerPayload = {
    name: 'Auth Test User',
    email: 'auth_test@example.com',
    password: 'Password123',
  };

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.onCleanDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('registers a new user and sets a refresh cookie', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(201);

      const { data } = asEnvelope<AccessTokenPayload>(res.body);

      expect(data.accessToken).toEqual(expect.any(String));
      expect(res.headers['set-cookie']?.[0]).toContain('refreshToken=');
    });

    it('rejects a duplicate email with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(409);
    });

    it('rejects a password without the required complexity', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          ...registerPayload,
          email: 'weak@example.com',
          password: 'alllowercase1',
        })
        .expect(400);
    });

    it('rejects unknown fields (forbidNonWhitelisted)', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({ ...registerPayload, email: 'extra@example.com', role: 'ADMIN' })
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(201);
    });

    it('logs in with correct credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: registerPayload.email,
          password: registerPayload.password,
        })
        .expect(200);

      const { data } = asEnvelope<AccessTokenPayload>(res.body);
      expect(data.accessToken).toEqual(expect.any(String));
    });

    it('rejects an incorrect password with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: registerPayload.email, password: 'WrongPassword1' })
        .expect(401);
    });

    it('rejects an unknown email with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nope@example.com', password: 'Password123' })
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('issues a new access token from the refresh cookie', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(201);

      const refreshRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', registerRes.headers['set-cookie'])
        .expect(200);

      const { data } = asEnvelope<AccessTokenPayload>(refreshRes.body);
      expect(data.accessToken).toEqual(expect.any(String));
    });

    it('rejects when there is no refresh cookie', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .expect(401);
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('revokes the refresh token', async () => {
      const registerRes = await request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(registerPayload)
        .expect(201);

      const { data } = asEnvelope<AccessTokenPayload>(registerRes.body);
      const cookie = registerRes.headers['set-cookie'];

      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${data.accessToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookie)
        .expect(401);
    });

    it('rejects logout without a bearer token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .expect(401);
    });
  });
});
