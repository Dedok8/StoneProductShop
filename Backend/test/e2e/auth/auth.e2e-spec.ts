import type { Server } from 'http';

import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { cleanDatabase } from 'test/config/setup';

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
    it('реєструє нового користувача та повертає access token', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('повертає 400 для невалідного email', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({ ...registerDto, email: 'not-an-email' })
        .expect(400);
    });

    it('повертає 400 для занадто короткого пароля', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send({ ...registerDto, password: '123' })
        .expect(400);
    });

    it('повертає 409 коли email вже зайнятий', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(registerDto)
        .expect(409);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
    });

    it('повертає access token для валідних даних', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email: registerDto.email, password: registerDto.password })
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('повертає 401 для неправильного пароля', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email: registerDto.email, password: 'wrong-password' })
        .expect(401);
    });

    it('повертає 401 для невідомого користувача', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({ email: 'ghost@test.com', password: registerDto.password })
        .expect(401);
    });

    it('повертає 400 для порожнього тіла', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/refresh', () => {
    it('оновлює токени якщо refresh cookie валідний', async () => {
      const login = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const cookies = login.headers['set-cookie'];
      const cookieHeader = Array.isArray(cookies)
        ? cookies.join('; ')
        : (cookies ?? '');
        
      const res = await request(app.getHttpServer() as Server)
        .post('/auth/refresh')
        .set('Cookie', cookieHeader)
        .expect(200);

      expect(res.body).toHaveProperty('accessToken');
    });

    it('повертає 401 без refresh cookie', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/refresh')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('розлогінює автентифікованого користувача', async () => {
      const register = await request(app.getHttpServer() as Server)
        .post('/auth/register')
        .send(registerDto)
        .expect(201);

      const { accessToken } = register.body as { accessToken: string };

      await request(app.getHttpServer() as Server)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });

    it('повертає 401 без access token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/auth/logout')
        .expect(401);
    });
  });

  beforeAll(async () => {
    await cleanDatabase();
  });
});
