import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { UserFixture } from '../fixtures/user.fixture';
import { asEnvelope, type PaginatedPayload } from '../utils/api-envelope';
import { loginAs } from '../utils/auth.helper';
import { createTestApp } from '../utils/test-app.factory';

import { HashService, PrismaService } from '@/shared';

interface AccessTokenPayload {
  accessToken: string;
}

interface UserPayload {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  passwordHash?: unknown;
}

describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userFixture: UserFixture;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    userFixture = new UserFixture(prisma, app.get(HashService));
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.onCleanDatabase();
  });

  describe('GET /api/v1/user/me', () => {
    it('returns the current user profile', async () => {
      const { accessToken, userId } = await loginAs(app, userFixture, 'USER');

      const res = await request(app.getHttpServer())
        .get('/api/v1/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = asEnvelope<UserPayload>(res.body);
      expect(data.id).toBe(userId);
      expect(data.passwordHash).toBeUndefined();
    });

    it('rejects without a token', async () => {
      await request(app.getHttpServer()).get('/api/v1/user/me').expect(401);
    });
  });

  describe('PATCH /api/v1/user/me', () => {
    it('updates own name', async () => {
      const { accessToken } = await loginAs(app, userFixture, 'USER');

      const res = await request(app.getHttpServer())
        .patch('/api/v1/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      const { data } = asEnvelope<UserPayload>(res.body);
      expect(data.name).toBe('Updated Name');
    });
  });

  describe('PATCH /api/v1/user/me/password', () => {
    it('changes the password with a correct current password', async () => {
      const user = await userFixture.create({ password: 'Password123!' });

      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'Password123!' })
        .expect(200);

      const { data: loginData } = asEnvelope<AccessTokenPayload>(loginRes.body);

      await request(app.getHttpServer())
        .patch('/api/v1/user/me/password')
        .set('Authorization', `Bearer ${loginData.accessToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword456!',
        })
        .expect(200);

      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: user.email, password: 'NewPassword456!' })
        .expect(200);
    });

    it('rejects an incorrect current password', async () => {
      const { accessToken } = await loginAs(app, userFixture, 'USER');

      await request(app.getHttpServer())
        .patch('/api/v1/user/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          currentPassword: 'WrongOne123!',
          newPassword: 'NewPassword456!',
        })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/user/me', () => {
    it('deletes own account', async () => {
      const { accessToken, userId } = await loginAs(app, userFixture, 'USER');

      await request(app.getHttpServer())
        .delete('/api/v1/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);

      const remaining = await prisma.user.findUnique({ where: { id: userId } });
      expect(remaining).toBeNull();
    });
  });

  describe('Admin — /api/v1/admin/user', () => {
    it('GET / lists users for ADMIN', async () => {
      const { accessToken } = await loginAs(app, userFixture, 'ADMIN');
      await userFixture.create();
      await userFixture.create();

      const res = await request(app.getHttpServer())
        .get('/api/v1/admin/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      const { data } = asEnvelope<PaginatedPayload<UserPayload>>(res.body);
      expect(data.items.length).toBeGreaterThanOrEqual(2);
    });

    it('GET / is forbidden for a non-admin', async () => {
      const { accessToken } = await loginAs(app, userFixture, 'USER');

      await request(app.getHttpServer())
        .get('/api/v1/admin/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(403);
    });

    it('POST / creates a user with a chosen role', async () => {
      const { accessToken } = await loginAs(app, userFixture, 'ADMIN');

      const res = await request(app.getHttpServer())
        .post('/api/v1/admin/user')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: 'Manager User',
          email: `manager_${Date.now()}@example.com`,
          password: 'Password123!',
          role: 'MANAGER',
        })
        .expect(201);

      const { data } = asEnvelope<UserPayload>(res.body);
      expect(data.role).toBe('MANAGER');
    });

    it('PATCH /:id/role changes a user role', async () => {
      const { accessToken } = await loginAs(app, userFixture, 'ADMIN');
      const target = await userFixture.create({ role: 'USER' });

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/admin/user/${target.id}/role`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ role: 'MANAGER' })
        .expect(200);

      const { data } = asEnvelope<UserPayload>(res.body);
      expect(data.role).toBe('MANAGER');
    });

    it('DELETE /:id removes a user', async () => {
      const { accessToken } = await loginAs(app, userFixture, 'ADMIN');
      const target = await userFixture.create();

      await request(app.getHttpServer())
        .delete(`/api/v1/admin/user/${target.id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(204);
    });
  });
});
