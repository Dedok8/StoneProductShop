import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { CategoryFixture } from '../fixtures/category.fixture';
import { UserFixture } from '../fixtures/user.fixture';
import { asEnvelope, type PaginatedPayload } from '../utils/api-envelope';
import { loginAs } from '../utils/auth.helper';
import { createTestApp } from '../utils/test-app.factory';

import { HashService, PrismaService } from '@/shared';

interface ProductPayload {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
}

describe('Products (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userFixture: UserFixture;
  let categoryFixture: CategoryFixture;
  let adminToken: string;
  let userToken: string;
  let categoryId: string;

  const validProductPayload = () => ({
    name: `Granite Slab ${Math.floor(Math.random() * 100000)}`,
    slug: `granite-slab-${Math.floor(Math.random() * 100000)}`,
    description: 'High-quality natural stone slab',
    price: 15000,
    stock: 10,
    images: ['https://example.com/stone.jpg'],
    categoryId,
  });

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    userFixture = new UserFixture(prisma, app.get(HashService));
    categoryFixture = new CategoryFixture(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.onCleanDatabase();
    adminToken = (await loginAs(app, userFixture, 'ADMIN')).accessToken;
    userToken = (await loginAs(app, userFixture, 'USER')).accessToken;
    categoryId = (await categoryFixture.create()).id;
  });

  describe('GET /api/v1/product', () => {
    it('returns a paginated empty list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/product')
        .expect(200);

      const { data } = asEnvelope<PaginatedPayload<ProductPayload>>(res.body);
      expect(data.items).toEqual([]);
      expect(data.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      });
    });

    it('respects pagination params', async () => {
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/api/v1/product')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(validProductPayload())
          .expect(201);
      }

      const res = await request(app.getHttpServer())
        .get('/api/v1/product')
        .query({ page: 1, limit: 2 })
        .expect(200);

      const { data } = asEnvelope<PaginatedPayload<ProductPayload>>(res.body);
      expect(data.items).toHaveLength(2);
      expect(data.meta.total).toBe(3);
      expect(data.meta.totalPages).toBe(2);
    });
  });

  describe('POST /api/v1/product', () => {
    it('creates a product as ADMIN', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductPayload())
        .expect(201);

      const { data } = asEnvelope<ProductPayload>(res.body);
      expect(data.id).toEqual(expect.any(String));
      expect(data.stock).toBe(10);
    });

    it('rejects creation for a non-admin role with 403', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validProductPayload())
        .expect(403);
    });

    it('rejects an invalid slug format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validProductPayload(), slug: 'Not A Slug!' })
        .expect(400);
    });

    it('rejects a non-URL image', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validProductPayload(), images: ['not-a-url'] })
        .expect(400);
    });

    it('rejects price below the minimum', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ ...validProductPayload(), price: 0 })
        .expect(400);
    });

    it('rejects a non-existent categoryId with 400', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ...validProductPayload(),
          categoryId: '00000000-0000-0000-0000-000000000000',
        })
        .expect(400);
    });
  });

  describe('GET /api/v1/product/:id', () => {
    it('returns a product by id', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductPayload());

      const { data: createdProduct } = asEnvelope<ProductPayload>(created.body);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/product/${createdProduct.id}`)
        .expect(200);

      const { data } = asEnvelope<ProductPayload>(res.body);
      expect(data.id).toBe(createdProduct.id);
    });

    it('returns 404 for a non-existent product', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/product/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  describe('PATCH /api/v1/product/:id', () => {
    it('updates stock and price as ADMIN', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductPayload());

      const { data: createdProduct } = asEnvelope<ProductPayload>(created.body);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/product/${createdProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ stock: 5, price: 12000 })
        .expect(200);

      const { data } = asEnvelope<ProductPayload>(res.body);
      expect(data.stock).toBe(5);
      expect(data.price).toBe(12000);
    });
  });

  describe('DELETE /api/v1/product/:id', () => {
    it('deletes a product as ADMIN', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/v1/product')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(validProductPayload());

      const { data: createdProduct } = asEnvelope<ProductPayload>(created.body);

      await request(app.getHttpServer())
        .delete(`/api/v1/product/${createdProduct.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/api/v1/product/${createdProduct.id}`)
        .expect(404);
    });
  });
});
