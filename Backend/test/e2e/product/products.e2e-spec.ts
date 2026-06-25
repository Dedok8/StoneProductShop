import type { Server } from 'http';

import type { INestApplication } from '@nestjs/common';
import { ValidationPipe } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest';
import { cleanDatabase, prisma } from 'test/config/setup';

// ─── Типи відповідей ──────────────────────────────────────────────────────

interface ProductBody {
  id: string;
  name: string;
  price: number;
  categoryId: string;
}

interface PaginatedProductBody {
  items: ProductBody[];
  total: number;
  page: number;
  limit: number;
}

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

    const owner = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({ name: 'Owner', email: 'owner@test.com', password: 'password123' })
      .expect(201);
    const { accessToken: oToken } = owner.body as { accessToken: string };
    userToken = oToken;

    const other = await request(app.getHttpServer() as Server)
      .post('/auth/register')
      .send({ name: 'Other', email: 'other@test.com', password: 'password123' })
      .expect(201);
    const { accessToken: aToken } = other.body as { accessToken: string };
    anotherUserToken = aToken;

    const productRes = await request(app.getHttpServer() as Server)
      .post('/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ ...createProductDto, categoryId })
      .expect(201);

    const { id: pId } = productRes.body as { id: string };
    productId = pId;
  });

  describe('POST /products', () => {
    it('дозволяє автентифікованому користувачу створити продукт', async () => {
      const res = await request(app.getHttpServer() as Server)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          ...createProductDto,
          name: 'New Stone',
          categoryId,
        })
        .expect(201);

      const body = res.body as ProductBody;
      expect(body).toHaveProperty('id');
      expect(body.name).toBe('New Stone');
      expect(body.categoryId).toBe(categoryId);
    });

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .post('/products')
        .send({ ...createProductDto, categoryId })
        .expect(401);
    });

    it("повертає 400 для від'ємної ціни", async () => {
      await request(app.getHttpServer() as Server)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...createProductDto, price: -100, categoryId })
        .expect(400);
    });

    it('повертає 400 для порожнього імені', async () => {
      await request(app.getHttpServer() as Server)
        .post('/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...createProductDto, name: '', categoryId })
        .expect(400);
    });
  });

  describe('GET /products', () => {
    it('повертає пагінований список продуктів', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/products')
        .expect(200);

      const body = res.body as PaginatedProductBody;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.total).toBeGreaterThan(0);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(20);
    });
  });

  describe('GET /products/:id', () => {
    it('повертає продукт за id', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get(`/products/${productId}`)
        .expect(200);

      const body = res.body as ProductBody;
      expect(body.id).toBe(productId);
    });

    it('повертає 404 для відсутнього UUID', async () => {
      await request(app.getHttpServer() as Server)
        .get('/products/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('повертає 400 для невалідного UUID', async () => {
      await request(app.getHttpServer() as Server)
        .get('/products/not-a-uuid')
        .expect(400);
    });
  });

  describe('PATCH /products/:id', () => {
    it('дозволяє власнику оновити продукт', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ price: 999 })
        .expect(200);

      const body = res.body as ProductBody;
      expect(body.price).toBe(999);
    });

    it('повертає 403 коли інший користувач намагається оновити продукт', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/products/${productId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send({ price: 1 })
        .expect(403);
    });

    it('повертає 401 без токена', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/products/${productId}`)
        .send({ price: 1 })
        .expect(401);
    });
  });

  describe('DELETE /products/:id', () => {
    it('дозволяє власнику видалити продукт', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    });

    it('повертає 403 коли інший користувач намагається видалити продукт', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/products/${productId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(403);
    });

    it('повертає 404 для відсутнього продукту', async () => {
      await request(app.getHttpServer() as Server)
        .delete('/products/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });

  beforeAll(async () => {
    await cleanDatabase();
  });
});
