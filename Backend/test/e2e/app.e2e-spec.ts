import type { Server } from 'http';

import type { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import request from 'supertest';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  }, 30000);

  it('/products (GET) — повертає список продуктів', () => {
    return request(app.getHttpServer() as Server)
      .get('/products')
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
