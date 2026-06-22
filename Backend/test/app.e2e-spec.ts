import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // ⚠️ ЕСЛИ в main.ts у тебя есть префикс, раскомментируй строчку ниже:
    // app.setGlobalPrefix('api');

    await app.init();
  }, 30000); // Расширенный таймаут на запуск базы/редиса

  // Тестируем реальный эндпоинт вместо несуществующего "/"
  it('/products (GET) — должен вернуть список продуктов', () => {
    return request(app.getHttpServer())
      .get('/products') // Или '/api/products', если включил префикс выше
      .expect(200); // Проверяем, что эндпоинт в принципе доступен
  });

  afterAll(async () => {
    await app.close();
  });
});
