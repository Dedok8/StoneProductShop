import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { CategoryFixture } from '../fixtures/category.fixture';
import { ProductFixture } from '../fixtures/product.fixture';
import { UserFixture } from '../fixtures/user.fixture';
import { asEnvelope } from '../utils/api-envelope';
import { loginAs } from '../utils/auth.helper';
import { createTestApp } from '../utils/test-app.factory';

import { HashService, PrismaService } from '@/shared';

interface CartItemPayload {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  isStock: boolean;
}

interface CartPayload {
  id: string;
  userId: string;
  items: CartItemPayload[];
  createdAt: string;
  updatedAt: string;
}

const NON_EXISTENT_UUID = '00000000-0000-0000-0000-000000000000';

describe('Cart (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userFixture: UserFixture;
  let categoryFixture: CategoryFixture;
  let productFixture: ProductFixture;

  let userToken: string;
  let userId: string;
  let adminId: string;
  let categoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
    userFixture = new UserFixture(prisma, app.get(HashService));
    categoryFixture = new CategoryFixture(prisma);
    productFixture = new ProductFixture(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.onCleanDatabase();

    const admin = await loginAs(app, userFixture, 'ADMIN');
    adminId = admin.userId;

    const user = await loginAs(app, userFixture, 'USER');
    userToken = user.accessToken;
    userId = user.userId;

    categoryId = (await categoryFixture.create()).id;
  });

  describe('GET /api/v1/cart', () => {
    it('creates and returns an empty cart for a user without one', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.userId).toBe(userId);
      expect(data.items).toEqual([]);
    });

    it('rejects without authentication', async () => {
      await request(app.getHttpServer()).get('/api/v1/cart').expect(401);
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('adds a product to the cart', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 })
        .expect(201);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items).toHaveLength(1);
      expect(data.items[0]).toMatchObject({
        productId: product.id,
        quantity: 2,
        name: product.name,
        price: Number(product.price),
        isStock: true,
      });
    });

    it('increments the quantity when the product is already in the cart', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 3 })
        .expect(201);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].quantity).toBe(5);
    });

    it('marks the item as out of stock when requested quantity exceeds available stock', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 2,
        price: 100,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 5 })
        .expect(201);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items[0].isStock).toBe(false);
    });

    it('returns 409 when the product does not exist', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: NON_EXISTENT_UUID, quantity: 1 })
        .expect(409);
    });

    it('rejects a non-positive quantity', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 0 })
        .expect(400);
    });

    it('rejects a malformed productId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: 'not-a-uuid', quantity: 1 })
        .expect(400);
    });

    it('rejects without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .send({ productId: NON_EXISTENT_UUID, quantity: 1 })
        .expect(401);
    });
  });

  describe('PATCH /api/v1/cart/items/:productId', () => {
    it('updates the quantity of an item already in the cart', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 2 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 7 })
        .expect(200);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].quantity).toBe(7);
    });

    it('rejects a non-positive quantity', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      await request(app.getHttpServer())
        .patch(`/api/v1/cart/items/${product.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 0 })
        .expect(400);
    });

    it('rejects a malformed productId param', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/cart/items/not-a-uuid')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 })
        .expect(400);
    });

    it('rejects without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/cart/items/${NON_EXISTENT_UUID}`)
        .send({ quantity: 1 })
        .expect(401);
    });
  });

  describe('DELETE /api/v1/cart/items/:productId', () => {
    it('removes a single item from the cart', async () => {
      const productA = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });
      const productB = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 50,
      });

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: productA.id, quantity: 1 })
        .expect(201);
      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: productB.id, quantity: 1 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .delete(`/api/v1/cart/items/${productA.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].productId).toBe(productB.id);
    });

    it('is a no-op (200, unchanged cart) when the product is not in the cart', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/cart/items/${NON_EXISTENT_UUID}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items).toEqual([]);
    });

    it('rejects a malformed productId param', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/cart/items/not-a-uuid')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('rejects without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/cart/items/${NON_EXISTENT_UUID}`)
        .expect(401);
    });
  });

  describe('DELETE /api/v1/cart', () => {
    it('clears every item from the cart and returns 204', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 })
        .expect(201);

      await request(app.getHttpServer())
        .delete('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      const res = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items).toEqual([]);
    });

    it('rejects without authentication', async () => {
      await request(app.getHttpServer()).delete('/api/v1/cart').expect(401);
    });
  });

  describe('cart isolation between users', () => {
    it('never mixes items from one user cart into another', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      await request(app.getHttpServer())
        .post('/api/v1/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ productId: product.id, quantity: 1 })
        .expect(201);

      const otherUser = await loginAs(app, userFixture, 'USER');

      const res = await request(app.getHttpServer())
        .get('/api/v1/cart')
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .expect(200);

      const { data } = asEnvelope<CartPayload>(res.body);
      expect(data.items).toEqual([]);
    });
  });
});
