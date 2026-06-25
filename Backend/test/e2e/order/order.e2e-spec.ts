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

// ─── Типи відповідей ──────────────────────────────────────────────────────

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

  // ─── Налаштування застосунку ─────────────────────────────────────────────

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

  // ─── Підготовка даних ────────────────────────────────────────────────────

  beforeEach(async () => {
    await cleanDatabase();

    // Категорія
    const category = await prisma.category.create({
      data: { name: 'E2E Orders Cat', slug: 'e2e-orders-cat' },
    });
    categoryId = category.id;

    // Користувачі
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

    // Продукт зі stock
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

    // Замовлення для подальших тестів
    const orderRes = await request(app.getHttpServer() as Server)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId, quantity: 2 }] })
      .expect(201);
    const { id: oId } = orderRes.body as { id: string };
    orderId = oId;
  });

  // ─── POST /orders ─────────────────────────────────────────────────────────

  describe('POST /orders', () => {
    it('створює замовлення з ціною з бази', async () => {
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

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .send({ items: [{ productId, quantity: 1 }] })
        .expect(401);
    });

    it('повертає 400 при порожньому масиві items', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [] })
        .expect(400);
    });

    it('повертає 400 при quantity < 1', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 0 }] })
        .expect(400);
    });

    it('повертає 404 якщо продукт не існує', async () => {
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

    it('зменшує stock продукту після замовлення', async () => {
      await request(app.getHttpServer() as Server)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 3 }] })
        .expect(201);

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      // Початковий stock 10, у beforeEach вже створено замовлення на 2, тут ще 3 -> 5
      expect(product!.stock).toBe(5);
    });
  });

  // ─── GET /orders/mine ─────────────────────────────────────────────────────

  describe('GET /orders/mine', () => {
    it('повертає замовлення поточного користувача', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/orders/mine')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as PaginatedOrderBody;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.total).toBeGreaterThan(0);
      expect(body.items[0].userId).toBeDefined();
    });

    it('не повертає замовлення інших користувачів', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/orders/mine')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(200);

      const body = res.body as PaginatedOrderBody;
      expect(body.total).toBe(0);
    });

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/mine')
        .expect(401);
    });
  });

  // ─── GET /orders/all (admin) ──────────────────────────────────────────────

  describe('GET /orders/all', () => {
    it('дозволяє admin бачити всі замовлення', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/orders/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as PaginatedOrderBody;
      expect(body.total).toBeGreaterThan(0);
    });

    it('повертає 403 для звичайного користувача', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/all')
        .expect(401);
    });
  });

  // ─── GET /orders/:id ──────────────────────────────────────────────────────

  describe('GET /orders/:id', () => {
    it('власник може отримати своє замовлення', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.id).toBe(orderId);
    });

    it('admin може отримати будь-яке замовлення', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.id).toBe(orderId);
    });

    it('повертає 403 якщо не власник і не admin', async () => {
      await request(app.getHttpServer() as Server)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('повертає 404 для неіснуючого замовлення', async () => {
      await request(app.getHttpServer() as Server)
        .get('/orders/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /orders/:id/cancel ─────────────────────────────────────────────

  describe('PATCH /orders/:id/cancel', () => {
    it('власник може скасувати PENDING замовлення', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.status).toBe('CANCELLED');
    });

    it('admin може скасувати будь-яке PENDING замовлення', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.status).toBe('CANCELLED');
    });

    it('повертає 403 якщо не власник', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('повертає 404 для неіснуючого замовлення', async () => {
      await request(app.getHttpServer() as Server)
        .patch('/orders/00000000-0000-4000-8000-000000000000/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /orders/:id/status (admin) ────────────────────────────────────

  describe('PATCH /orders/:id/status', () => {
    it('admin може змінити статус замовлення', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PAID' })
        .expect(200);

      const body = res.body as OrderBody;
      expect(body.status).toBe('PAID');
    });

    it('повертає 403 для звичайного користувача', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'PAID' })
        .expect(403);
    });

    it('повертає 400 для невалідного статусу', async () => {
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
