import type { Server } from 'http';

import { TokenService } from '@modules/auth/infrastructure';
import { UserRole } from '@modules/user/domain';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { cleanDatabase, prisma } from 'test/config/setup';

interface OrderItemBody {
  price: number;
}

interface OrderBody {
  id: string;
  status: string;
  userId: string;
  items: OrderItemBody[];
}

interface PaginatedOrderBody {
  items: OrderBody[];
  total: number;
}

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let tokenService: TokenService;

  let userToken: string;
  let adminToken: string;
  let anotherUserToken: string;

  let categoryId: string;
  let productId: string;
  let orderId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    tokenService = app.get(TokenService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDatabase();

    const category = await prisma.category.create({
      data: { name: 'E2E Orders Cat', slug: 'e2e-orders-cat' },
    });
    categoryId = category.id;

    const userRes = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        name: 'Order User',
        email: 'order@test.com',
        password: 'password123',
      })
      .expect(201);
    const { accessToken: uToken } = userRes.body as { accessToken: string };
    userToken = uToken;

    const anotherRes = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        name: 'Another User',
        email: 'another@test.com',
        password: 'password123',
      })
      .expect(201);
    const { accessToken: aToken } = anotherRes.body as { accessToken: string };
    anotherUserToken = aToken;

    adminToken = tokenService.signAccessToken({
      sub: 'admin-id',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });

    const productRes = await request(app.getHttpServer() as Server)
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'E2E Order Stone',
        price: 500,
        stock: 10,
        categoryId,
        images: [],
      })
      .expect(201);
    const { id: pId } = productRes.body as { id: string };
    productId = pId;

    const orderRes = await request(app.getHttpServer() as Server)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId, quantity: 2 }] })
      .expect(201);
    const { id: oId } = orderRes.body as { id: string };
    orderId = oId;
  });

  describe('POST /orders', () => {
    it('creates an order with the price from the database', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 1 }] })
        .expect(201);

      const body = res.body as OrderBody;
      expect(body).toHaveProperty('id');
      expect(body.items).toHaveLength(1);
      expect(body.items[0].price).toBe(500);
      expect(body.status).toBe('PENDING');
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .send({ items: [{ productId, quantity: 1 }] })
        .expect(401);
    });

    it('returns 400 for an empty items array', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [] })
        .expect(400);
    });

    it('returns 400 when quantity is less than 1', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 0 }] })
        .expect(400);
    });

    it('returns 404 if the product does not exist', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            { productId: '00000000-0000-4000-8000-000000000000', quantity: 1 },
          ],
        })
        .expect(404);
    });

    it('decrements the product stock after an order', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 3 }] })
        .expect(201);

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      expect(product!.stock).toBe(5);
    });
  });

  describe('GET /orders/mine', () => {
    it("returns the current user's orders", async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/orders/mine')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as PaginatedOrderBody;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.total).toBeGreaterThan(0);
      expect(body.items[0].userId).toBeDefined();
    });

    it("does not return other users' orders", async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/orders/mine')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(200);

      const body = res.body as PaginatedOrderBody;
      expect(body.total).toBe(0);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/mine')
        .expect(401);
    });
  });

  describe('GET /orders/all', () => {
    it('allows admin to see all orders', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/orders/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as PaginatedOrderBody;
      expect(body.total).toBeGreaterThan(0);
    });

    it('returns 403 for a regular user', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/all')
        .expect(401);
    });
  });

  describe('GET /orders/:id', () => {
    it('owner can retrieve their own order', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.id).toBe(orderId);
    });

    it('admin can retrieve any order', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.id).toBe(orderId);
    });

    it('returns 403 if not the owner and not an admin', async () => {
      await request(app.getHttpServer() as Server)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('returns 404 for a non-existent order', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /orders/:id/cancel', () => {
    it('owner can cancel a PENDING order', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.status).toBe('CANCELLED');
    });

    it('admin can cancel any PENDING order', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.status).toBe('CANCELLED');
    });

    it('returns 403 if not the owner', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('returns 404 for a non-existent order', async () => {
      await request(app.getHttpServer() as Server)
        .patch('/orders/00000000-0000-4000-8000-000000000000/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    it('admin can change the order status', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PAID' })
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.status).toBe('PAID');
    });

    it('returns 403 for a regular user', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'PAID' })
        .expect(403);
    });

    it('returns 400 for an invalid status', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  beforeAll(async () => {
    await cleanDatabase();
  });
});
