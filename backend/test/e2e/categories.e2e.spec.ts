import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { UserFixture } from '../fixtures/user.fixture';
import { asEnvelope } from '../utils/api-envelope';
import { loginAs } from '../utils/auth.helper';
import { createTestApp } from '../utils/test-app.factory';

import { HashService, PrismaService } from '@/shared';

interface CategoryPayload {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

describe('Categories (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userFixture: UserFixture;
  let adminToken: string;
  let userToken: string;

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
    adminToken = (await loginAs(app, userFixture, 'ADMIN')).accessToken;
    userToken = (await loginAs(app, userFixture, 'USER')).accessToken;
  });

  describe('GET /api/v1/category', () => {
    it('returns an empty array when no categories exist', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/category')
        .expect(200);

      const { data } = asEnvelope<CategoryPayload[]>(res.body);
      expect(data).toEqual([]);
    });

    it('lists categories without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Granite', slug: 'granite' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/category')
        .expect(200);

      const { data } = asEnvelope<CategoryPayload[]>(res.body);
      expect(data).toHaveLength(1);
      expect(data[0].name).toBe('Granite');
    });
  });

  describe('POST /api/v1/category', () => {
    it('creates a category as ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Marble', slug: 'marble' })
        .expect(201);

      const { data } = asEnvelope<CategoryPayload>(res.body);
      expect(data.id).toEqual(expect.any(String));
      expect(data.slug).toBe('marble');
    });

    it('rejects creation for a non-admin role with 403', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Marble', slug: 'marble' })
        .expect(403);
    });

    it('rejects creation without a token with 401', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/category')
        .send({ name: 'Marble', slug: 'marble' })
        .expect(401);
    });

    it('rejects an invalid slug format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Marble', slug: 'Marble Slug!' })
        .expect(400);
    });

    it('rejects a duplicate slug with 409', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Limestone', slug: 'limestone' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Limestone 2', slug: 'limestone' })
        .expect(409);
    });
  });

  describe('GET /api/v1/category/search', () => {
    it('finds a category by slug', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Granite', slug: 'granite' })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/category/search')
        .query({ slug: 'granite' })
        .expect(200);

      const { data } = asEnvelope<CategoryPayload>(res.body);
      expect(data.slug).toBe('granite');
    });

    it('returns 400 when neither slug nor name is provided', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/category/search')
        .expect(400);
    });
  });

  describe('PATCH /api/v1/category/:id', () => {
    it('updates a category as ADMIN', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Granite', slug: 'granite' });

      const { data: createdCategory } = asEnvelope<CategoryPayload>(
        created.body,
      );

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/category/${createdCategory.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);

      const { data } = asEnvelope<CategoryPayload>(res.body);
      expect(data.isActive).toBe(false);
    });

    it('returns 404 for a non-existent category', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/category/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'X' })
        .expect(404);
    });
  });

  describe('DELETE /api/v1/category/:id', () => {
    it('deletes a category as ADMIN', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Granite', slug: 'granite' });

      const { data: createdCategory } = asEnvelope<CategoryPayload>(
        created.body,
      );

      await request(app.getHttpServer())
        .delete(`/api/v1/category/${createdCategory.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/v1/category/${createdCategory.id}`)
        .expect(404);
    });
  });
});
