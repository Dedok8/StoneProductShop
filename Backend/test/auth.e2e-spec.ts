import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';

import { AppModule } from '../src/app.module';

import { cleanDatabase } from './setup';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  const registerDto = {
    name: 'Test User',
    email: 'user@test.com',
    password: 'password123',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe('POST /auth/register', () => {
    it('registers a new user and returns an access token', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, email: 'not-an-email' })
        .expect(400);
    });

    it('returns 400 for too short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, password: '123' })
        .expect(400);
    });

    it('returns 409 when email is already used', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('returns an access token for valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: registerDto.email, password: registerDto.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('returns 401 for wrong password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: registerDto.email, password: 'wrong-password' })
        .expect(401);
    });

    it('returns 401 for unknown user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'ghost@test.com', password: registerDto.password })
        .expect(401);
    });

    it('returns 400 for empty body', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('refreshes tokens when refresh cookie is valid', async () => {
      const login = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Cookie', login.headers['set-cookie'])
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
    });

    it('returns 401 without refresh cookie', async () => {
      await request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('logs out an authenticated user', async () => {
      const register = await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${register.body.accessToken}`)
        .expect(204);
    });

    it('returns 401 without access token', async () => {
      await request(app.getHttpServer()).post('/auth/logout').expect(401);
    });
  });
});
