import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import { asEnvelope } from '../utils/api-envelope';
import { createTestApp } from '../utils/test-app.factory';

interface HealthPayload {
  status: string;
  timestamp: string;
}

describe('Health (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health returns ok status, wrapped in the response envelope', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    const { data, timestamp } = asEnvelope<HealthPayload>(res.body);

    expect(data.status).toBe('ok');
    expect(data.timestamp).toEqual(expect.any(String));
    expect(timestamp).toEqual(expect.any(String));
  });

  it('is version-neutral — /api/v1/health does not exist', async () => {
    await request(app.getHttpServer()).get('/api/v1/health').expect(404);
  });
});
