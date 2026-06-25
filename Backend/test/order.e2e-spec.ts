import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { TokenService } from '../src/modules/auth/infrastructure/token.service';
import { UserRole } from '../src/modules/user/domain/user-role.enum';

import { cleanDatabase, prisma } from './setup';

describe('Orders (e2e)', () => {
  let app: INestApplication;
  let tokenService: TokenService;

  let userToken: string;
  let adminToken: string;
  let anotherUserToken: string;

  let categoryId: string;
  let productId: string;
  let orderId: string;

  // ─── App setup ──────────────────────────────────────────────────────────

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

  // ─── Data setup ─────────────────────────────────────────────────────────

  beforeEach(async () => {
    await cleanDatabase();

    // Категория
    const category = await prisma.category.create({
      data: { name: 'E2E Orders Cat', slug: 'e2e-orders-cat' },
    });
    categoryId = category.id;

    // Пользователи
    const userRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Order User',
        email: 'order@test.com',
        password: 'password123',
      })
      .expect(201);
    userToken = userRes.body.accessToken;

    const anotherRes = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Another User',
        email: 'another@test.com',
        password: 'password123',
      })
      .expect(201);
    anotherUserToken = anotherRes.body.accessToken;

    adminToken = tokenService.signAccessToken({
      sub: 'admin-id',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });

    // Продукт с stock
    const productRes = await request(app.getHttpServer())
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
    productId = productRes.body.id;

    // Заказ для последующих тестов
    const orderRes = await request(app.getHttpServer())
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ items: [{ productId, quantity: 2 }] })
      .expect(201);
    orderId = orderRes.body.id;
  });

  // ─── POST /orders ────────────────────────────────────────────────────────

  describe('POST /orders', () => {
    it('создаёт заказ с ценой из базы', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 1 }] })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].price).toBe(500);
      expect(res.body.status).toBe('PENDING');
    });

    it('возвращает 401 без токена', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .send({ items: [{ productId, quantity: 1 }] })
        .expect(401);
    });

    it('возвращает 400 при пустом массиве items', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [] })
        .expect(400);
    });

    it('возвращает 400 при quantity < 1', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 0 }] })
        .expect(400);
    });

    it('возвращает 404 если продукт не существует', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          items: [
            { productId: '00000000-0000-4000-8000-000000000000', quantity: 1 },
          ],
        })
        .expect(404);
    });

    it('уменьшает stock продукта после заказа', async () => {
      await request(app.getHttpServer())
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ items: [{ productId, quantity: 3 }] })
        .expect(201);

      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      // Начальный stock 10, в beforeEach уже создан заказ на 2, тут ещё 3 -> 5 осталось
      expect(product!.stock).toBe(5);
    });
  });

  // ─── GET /orders/mine ────────────────────────────────────────────────────

  describe('GET /orders/mine', () => {
    it('возвращает заказы текущего пользователя', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/mine')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.items[0].userId).toBeDefined();
    });

    it('не возвращает заказы других пользователей', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/mine')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(200);

      expect(res.body.total).toBe(0);
    });

    it('возвращает 401 без токена', async () => {
      await request(app.getHttpServer()).get('/orders/mine').expect(401);
    });
  });

  // ─── GET /orders/all (admin) ─────────────────────────────────────────────

  describe('GET /orders/all', () => {
    it('позволяет admin видеть все заказы', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/all')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.total).toBeGreaterThan(0);
    });

    it('возвращает 403 для обычного пользователя', async () => {
      await request(app.getHttpServer())
        .get('/orders/all')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('возвращает 401 без токена', async () => {
      await request(app.getHttpServer()).get('/orders/all').expect(401);
    });
  });

  // ─── GET /orders/:id ─────────────────────────────────────────────────────

  describe('GET /orders/:id', () => {
    it('владелец может получить свой заказ', async () => {
      const res = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.id).toBe(orderId);
    });

    it('admin может получить любой заказ', async () => {
      const res = await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.id).toBe(orderId);
    });

    it('возвращает 403 если не владелец и не admin', async () => {
      await request(app.getHttpServer())
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('возвращает 404 для несуществующего заказа', async () => {
      await request(app.getHttpServer())
        .get('/orders/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /orders/:id/cancel ────────────────────────────────────────────

  describe('PATCH /orders/:id/cancel', () => {
    it('владелец может отменить PENDING заказ', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(res.body.status).toBe('CANCELLED');
    });

    it('admin может отменить любой PENDING заказ', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.status).toBe('CANCELLED');
    });

    it('возвращает 403 если не владелец', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/cancel`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('возвращает 404 для несуществующего заказа', async () => {
      await request(app.getHttpServer())
        .patch('/orders/00000000-0000-4000-8000-000000000000/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  // ─── PATCH /orders/:id/status (admin) ───────────────────────────────────

  describe('PATCH /orders/:id/status', () => {
    it('admin может изменить статус заказа', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'PAID' })
        .expect(200);

      expect(res.body.status).toBe('PAID');
    });

    it('возвращает 403 для обычного пользователя', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'PAID' })
        .expect(403);
    });

    it('возвращает 400 для невалидного статуса', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });
  });
});
