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

    const categoryRes = await request(app.getHttpServer() as Server)
      .post('/category')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Natural Stone' })
      .expect(201);
    const categoryBody = categoryRes.body as CategoryBody;
    categoryId = categoryBody.id;
  });

  describe('POST /category', () => {
    it('admin can create a category', async () => {
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

    it('returns 403 for a regular user', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Marble' })
        .expect(403);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .send({ name: 'Marble' })
        .expect(401);
    });

    it('returns 400 for an empty name', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: '' })
        .expect(400);
    });

    it('returns 409 on duplicate name', async () => {
      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Stone' })
        .expect(201);

      await request(app.getHttpServer() as Server)
        .post('/category')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Unique Stone' })
        .expect(409);
    });
  });

  describe('GET /category', () => {
    it('returns the list of categories (public endpoint)', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get('/category')
        .expect(200);

      const body = res.body as PaginatedBody;
      expect(Array.isArray(body.items)).toBe(true);
      expect(body.total).toBeGreaterThan(0);
      expect(body.page).toBe(1);
      expect(body.limit).toBe(20);
    });

    it('returns an empty list when there are no categories', async () => {
      await cleanDatabase();

      const res = await request(app.getHttpServer() as Server)
        .get('/category')
        .expect(200);

      const body = res.body as PaginatedBody;
      expect(body.items).toHaveLength(0);
      expect(body.total).toBe(0);
    });
  });

  describe('GET /category/:id', () => {
    it('returns a category by id', async () => {
      const res = await request(app.getHttpServer() as Server)
        .get(`/category/${categoryId}`)
        .expect(200);

      const body = res.body as CategoryBody;
      expect(body.id).toBe(categoryId);
      expect(body.name).toBe('Natural Stone');
    });

    it('returns 404 for a non-existent category', async () => {
      await request(app.getHttpServer() as Server)
        .get('/category/00000000-0000-4000-8000-000000000000')
        .expect(404);
    });

    it('returns 400 for an invalid UUID', async () => {
      await request(app.getHttpServer() as Server)
        .get('/category/not-a-uuid')
        .expect(400);
    });
  });

  describe('PATCH /category/:id', () => {
    it('admin can update a category', async () => {
      const res = await request(app.getHttpServer() as Server)
        .patch(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Premium Natural Stone' })
        .expect(200);

      const body = res.body as CategoryBody;
      expect(body.name).toBe('Premium Natural Stone');
      expect(body.slug).toMatch(/^premium-natural-stone-[a-f0-9]{8}$/);
    });

    it('returns 403 for a regular user', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Hack' })
        .expect(403);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .patch(`/category/${categoryId}`)
        .send({ name: 'Hack' })
        .expect(401);
    });

    it('returns 404 for a non-existent category', async () => {
      await request(app.getHttpServer() as Server)
        .patch('/category/00000000-0000-4000-8000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Marble' })
        .expect(404);
    });
  });

  describe('DELETE /category/:id', () => {
    it('admin can delete a category', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      await request(app.getHttpServer() as Server)
        .get(`/category/${categoryId}`)
        .expect(404);
    });

    it('returns 403 for a regular user', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/category/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('returns 401 without a token', async () => {
      await request(app.getHttpServer() as Server)
        .delete(`/category/${categoryId}`)
        .expect(401);
    });

    it('returns 404 for a non-existent category', async () => {
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
