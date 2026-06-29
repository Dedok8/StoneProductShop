import type { Server } from 'http';

import { TokenService } from '@modules/auth/infrastructure';
import { UserRole } from '@modules/user/domain';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { cleanDatabase } from 'test/config/setup';

interface UserBody {
  id: string;
  email: string;
  role: string;
}

describe('Users (e2e)', () => {
  let app: INestApplication;
  let tokenService: TokenService;
  let userToken: string;

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    tokenService = app.get(TokenService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const userRes = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    const { accessToken } = userRes.body as { accessToken: string };
    userToken = accessToken;
  });

  describe('GET /users/me', () => {
    it('returns the current user profile', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as UserBody;
      expect(body.email).toBe(registerDto.email);
      expect(body).not.toHaveProperty('passwordHash');
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/users/me')
        .expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('updates the current user profile', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'updated@test.com' })
        .expect(200);

      const body = res.body as UserBody;
      expect(body.email).toBe('updated@test.com');
    });

    it('returns 400 for an invalid email', async () => {
      await request(app.getHttpServer() as Server)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'not-valid' })
        .expect(400);
    });
  });

  describe('DELETE /users/me', () => {
    it('deletes the current user profile', async () => {
      await request(app.getHttpServer() as Server)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .delete('/users/me')
        .expect(401);
    });
  });

  describe('GET /admin/users', () => {
    it('allows admin to retrieve the list of users', async () => {
      const adminToken = tokenService.signAccessToken({
        sub: 'admin-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });

      const res = await request(app.getHttpServer() as Server)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as UserBody[];
      expect(Array.isArray(body)).toBe(true);
      expect(body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ email: registerDto.email }),
        ]),
      );
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/admin/users')
        .expect(401);
    });

    it('returns 403 for a regular user', async () => {
      await request(app.getHttpServer() as Server)
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  beforeAll(async () => {
    await cleanDatabase();
  });
});
