import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

import { cleanDatabase, prisma } from './setup';

describe('Products (e2e)', () => {
  let app: INestApplication;
  let userToken: string;
  let anotherUserToken: string;
  let categoryId: string;
  let productId: string;

  const createProductDto = {
    name: 'Test Stone',
    price: 500,
    stock: 5,
    description: 'For e2e tests',
    images: [],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const category = await prisma.category.create({
      data: { name: 'E2E Category', slug: 'e2e-category' },
    });
    categoryId = category.id;

    const owner = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Owner', email: 'owner@test.com', password: 'password123' })
      .expect(201);
    userToken = owner.body.accessToken;

    const other = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: 'Other', email: 'other@test.com', password: 'password123' })
      .expect(201);
    anotherUserToken = other.body.accessToken;

    const productRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...createProductDto, categoryId })
      .expect(201);

    productId = productRes.body.id;
  });

  describe('POST /products', () => {
    it('allows an authenticated user to create a product', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...createProductDto,
          name: 'New Stone',
          categoryId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('New Stone');
      expect(res.body.categoryId).toBe(categoryId);
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .send({ ...createProductDto, categoryId })
        .expect(401);
    });

    it('returns 400 for negative price', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...createProductDto, price: -100, categoryId })
        .expect(400);
    });

    it('returns 400 for empty name', async () => {
      await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...createProductDto, name: '', categoryId })
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('returns a paginated products list', async () => {
      const res = await request(app.getHttpServer()).get('/products').expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.page).toBe(1);
      expect(res.body.limit).toBe(20);
    });
  });

  describe('GET /products/:id', () => {
    it('returns a product by id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200);

      expect(res.body.id).toBe(productId);
    });

    it('returns 404 for a missing UUID', async () => {
      await request(app.getHttpServer())
        .get('/products/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('returns 400 for invalid UUID', async () => {
      await request(app.getHttpServer()).get('/products/not-a-uuid').expect(400);
    });
  });

  describe('PATCH /products/:id', () => {
    it('allows the owner to update a product', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 999 })
        .expect(200);

      expect(res.body.price).toBe(999);
    });

    it('returns 403 when another user updates the product', async () => {
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ price: 1 })
        .expect(403);
    });

    it('returns 401 without token', async () => {
      await request(app.getHttpServer())
        .patch(`/products/${productId}`)
        .send({ price: 1 })
        .expect(401);
    });
  });

  describe('DELETE /products/:id', () => {
    it('allows the owner to delete a product', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('returns 403 when another user deletes the product', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('returns 404 for a missing product', async () => {
      await request(app.getHttpServer())
        .delete('/products/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
