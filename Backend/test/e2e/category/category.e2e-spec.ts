import type { Server } from 'http';

import { TokenService } from '@modules/auth/infrastructure';
import { UserRole } from '@modules/user/domain';
import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { cleanDatabase } from 'test/config/setup';

// ─── Типи відповідей ──────────────────────────────────────────────────────

interface CategoryBody {
  id: string;
  name: string;
  slug: string;
}

interface PaginatedBody {
  items: CategoryBody[];
  total: number;
  page: number;
  limit: number;
}

describe('category (e2e)', () => {
  let app: INestApplication;
  let tokenService: TokenService;

  let adminToken: string;
  let userToken: string;
  let categoryId: string;

  // ─── Налаштування застосунку ─────────────────────────────────────────────

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

    adminToken = tokenService.signAccessToken({
      sub: 'admin-id',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    });

    const userRes = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@test.com',
        password: 'password123',
      })
      .expect(201);
    const { accessToken } = userRes.body as { accessToken: string };
    userToken = accessToken;

    // Створюємо категорію для тестів update/delete
    const categoryRes = await request(app.getHttpServer() as Server)
      .post('/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Natural Stone' })
      .expect(201);
    const categoryBody = categoryRes.body as CategoryBody;
    categoryId = categoryBody.id;
  });

  // ─── POST /category ──────────────────────────────────────────────────────

  describe('POST /category', () => {
    it('admin може створити категорію', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Granite' })
        .expect(201);

      const body = res.body as CategoryBody;
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('Granite');
      expect(body.slug).toMatch(/^granite-[a-f0-9]{8}$/);
    });

    it('повертає 403 для звичайного користувача', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Marble' })
        .expect(403);
    });

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .send({ name: 'Marble' })
        .expect(401);
    });

    it('повертає 400 для порожнього імені', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' })
        .expect(400);
    });

    it('повертає 409 при дублюванні імені', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Stone' })
        .expect(201);

      // Другий запит з тим самим іменем має повернути 409
      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Stone' })
        .expect(409);
    });
  });

  // ─── GET /category ───────────────────────────────────────────────────────

  describe('GET /category', () => {
    it('повертає список категорій (публічний endpoint)', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/category')
        .expect(200);

      const body = res.body as PaginatedBody;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.total).toBeGreaterThan(0);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(20);
    });

    it('повертає порожній список якщо категорій немає', async () => {
      await cleanDatabase();

      const res = await request(app.getHttpServer() as Server)
        .get('/category')
        .expect(200);

      const body = res.body as PaginatedBody;
      expect(body.items).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  // ─── GET /category/:id ───────────────────────────────────────────────────

  describe('GET /category/:id', () => {
    it('повертає категорію за id', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get(`/category/${categoryId}`)
        .expect(200);

      const body = res.body as CategoryBody;
      expect(body.id).toBe(categoryId);
      expect(body.name).toBe('Natural Stone');
    });

    it('повертає 404 для неіснуючої категорії', async () => {
      await request(app.getHttpServer() as Server)
        .get('/category/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('повертає 400 для невалідного UUID', async () => {
      await request(app.getHttpServer() as Server)
        .get('/category/not-a-uuid')
        .expect(400);
    });
  });

  // ─── PATCH /category/:id ─────────────────────────────────────────────────

  describe('PATCH /category/:id', () => {
    it('admin може оновити категорію', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Premium Natural Stone' })
        .expect(200);

      const body = res.body as CategoryBody;
      expect(body.name).toBe('Premium Natural Stone');
      expect(body.slug).toMatch(/^premium-natural-stone-[a-f0-9]{8}$/);
    });

    it('повертає 403 для звичайного користувача', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hack' })
        .expect(403);
    });

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/category/${categoryId}`)
        .send({ name: 'Hack' })
        .expect(401);
    });

    it('повертає 404 для неіснуючої категорії', async () => {
      await request(app.getHttpServer() as Server)
        .patch('/category/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Marble' })
        .expect(404);
    });
  });

  // ─── DELETE /category/:id ────────────────────────────────────────────────

  describe('DELETE /category/:id', () => {
    it('admin може видалити категорію', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer() as Server)
        .get(`/category/${categoryId}`)
        .expect(404);
    });

    it('повертає 403 для звичайного користувача', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/category/${categoryId}`)
        .expect(401);
    });

    it('повертає 404 для неіснуючої категорії', async () => {
      await request(app.getHttpServer() as Server)
        .delete('/category/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  beforeAll(async () => {
    await cleanDatabase();
  });
});
