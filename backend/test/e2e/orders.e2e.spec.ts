import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { CategoryFixture } from '../fixtures/category.fixture';
import { ProductFixture } from '../fixtures/product.fixture';
import { UserFixture } from '../fixtures/user.fixture';
import { asEnvelope, type PaginatedPayload } from '../utils/api-envelope';
import { loginAs } from '../utils/auth.helper';
import { createTestApp } from '../utils/test-app.factory';

import { HashService, PrismaService } from '@/shared';

interface OrderItemPayload {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subTotal: number;
}

interface OrderPayload {
  id: string;
  status: string;
  userId: string;
  items: OrderItemPayload[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let userFixture: UserFixture;
  let categoryFixture: CategoryFixture;
  let productFixture: ProductFixture;

  let adminToken: string;
  let adminId: string;
  let userToken: string;
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
    adminToken = admin.accessToken;
    adminId = admin.userId;

    const user = await loginAs(app, userFixture, 'USER');
    userToken = user.accessToken;

    categoryId = (await categoryFixture.create()).id;
  });

  describe('POST /api/v1/order', () => {
    it('creates an order and decrements product stock', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      const res = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 3 }] })
        .expect(201);

      const { data } = asEnvelope<OrderPayload>(res.body);
      expect(data.status).toBe('PENDING');
      expect(data.total).toBe(300);

      const updated = await prisma.product.findUniqueOrThrow({
        where: { id: product.id },
      });
      expect(updated.stock).toBe(7);
    });

    it('returns 409 when stock is insufficient', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 1,
        price: 100,
      });

      await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 5 }] })
        .expect(409);
    });

    it('rejects an empty items array', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [] })
        .expect(400);
    });

    it('rejects without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/order')
        .send({
          items: [
            { productId: '00000000-0000-0000-0000-000000000000', quantity: 1 },
          ],
        })
        .expect(401);
    });
  });

  describe('GET /api/v1/order/my', () => {
    it('returns only the current user orders', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] })
        .expect(201);

      const res = await request(app.getHttpServer())
        .get('/api/v1/order/my')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // у admin своих заказов нет
      const { data } = asEnvelope<PaginatedPayload<OrderPayload>>(res.body);
      expect(data.items).toEqual([]);
    });
  });

  describe('GET /api/v1/order/:id', () => {
    it('lets the owner see their own order', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      const created = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] });

      const { data: createdOrder } = asEnvelope<OrderPayload>(created.body);

      const res = await request(app.getHttpServer())
        .get(`/api/v1/order/${createdOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const { data } = asEnvelope<OrderPayload>(res.body);
      expect(data.id).toBe(createdOrder.id);
    });

    it('hides another user order (404) unless requester is ADMIN', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      const created = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] });

      const { data: createdOrder } = asEnvelope<OrderPayload>(created.body);
      const otherUser = await loginAs(app, userFixture, 'USER');

      await request(app.getHttpServer())
        .get(`/api/v1/order/${createdOrder.id}`)
        .set('Authorization', `Bearer ${otherUser.accessToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/api/v1/order/${createdOrder.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  describe('GET /api/v1/order (ADMIN only)', () => {
    it('lists all orders for ADMIN', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/order')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('is forbidden for a regular user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('PATCH /api/v1/order/:id/status', () => {
    it('allows a valid PENDING -> PAID transition', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      const created = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] });

      const { data: createdOrder } = asEnvelope<OrderPayload>(created.body);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/order/${createdOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PAID' })
        .expect(200);

      const { data } = asEnvelope<OrderPayload>(res.body);
      expect(data.status).toBe('PAID');
    });

    it('rejects an invalid transition (PENDING -> SHIPPED)', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      const created = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] });

      const { data: createdOrder } = asEnvelope<OrderPayload>(created.body);

      await request(app.getHttpServer())
        .patch(`/api/v1/order/${createdOrder.id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'SHIPPED' })
        .expect(400);
    });

    it('is forbidden for a non-admin', async () => {
      const product = await productFixture.create({
        categoryId,
        ownerId: adminId,
        stock: 10,
        price: 100,
      });

      const created = await request(app.getHttpServer())
        .post('/api/v1/order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] });

      const { data: createdOrder } = asEnvelope<OrderPayload>(created.body);

      await request(app.getHttpServer())
        .patch(`/api/v1/order/${createdOrder.id}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'PAID' })
        .expect(403);
    });
  });
});
