import { TokenService } from '@modules/auth/infrastructure';
import { UserRole } from '@modules/user/domain';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

import { cleanDatabase } from './setup';

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

    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send(registerDto)
      .expect(201);

    userToken = userRes.body.accessToken;
  });

  describe('GET /users/me', () => {
    it('returns the current user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.email).toBe(registerDto.email);
      expect(res.body).not.toHaveProperty('passwordHash');
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/users/me').expect(401);
    });
  });

  describe('PATCH /users/me', () => {
    it('updates the current user profile', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'updated@test.com' })
        .expect(200);

      expect(res.body.email).toBe('updated@test.com');
    });

    it('returns 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ email: 'not-valid' })
        .expect(400);
    });
  });

  describe('DELETE /users/me', () => {
    it('deletes the current user profile', async () => {
      await request(app.getHttpServer())
        .delete('/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).delete('/users/me').expect(401);
    });
  });

  describe('GET /admin/users', () => {
    it('allows an admin to get users', async () => {
      const adminToken = tokenService.signAccessToken({
        sub: 'admin-id',
        email: 'admin@test.com',
        role: UserRole.ADMIN,
      });

      const res = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual(
        expect.arrayContaining([expect.objectContaining({ email: registerDto.email })]),
      );
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer()).get('/admin/users').expect(401);
    });

    it('returns 403 for a regular user', async () => {
      await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});
