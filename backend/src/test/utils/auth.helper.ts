import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';

import type { UserFixture } from '../fixtures/user.fixture';

export interface RegisteredSession {
  accessToken: string;
  refreshCookie: string;
}

interface AuthResponse {
  data: {
    accessToken: string;
  };
}

export async function registerAndLogin(
  app: INestApplication<App>,
  overrides: { name?: string; email?: string; password?: string } = {},
): Promise<RegisteredSession> {
  const uniqueId = Math.floor(Math.random() * 1_000_000);

  const payload = {
    name: overrides.name ?? `E2E User ${uniqueId}`,
    email: overrides.email ?? `e2e_user_${uniqueId}@example.com`,
    password: overrides.password ?? 'Password123',
  };

  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/register')
    .send(payload)
    .expect(201);

  const setCookie = res.headers['set-cookie'];
  const refreshCookie = (
    Array.isArray(setCookie) ? (setCookie[0] ?? '') : (setCookie ?? '')
  ) as string;

  const body = res.body as AuthResponse;

  return {
    accessToken: body.data.accessToken,
    refreshCookie,
  };
}

export interface AdminOrRoleSession {
  accessToken: string;
  userId: string;
  email: string;
}

const DEFAULT_PASSWORD = 'Password123!';

export async function loginAs(
  app: INestApplication<App>,
  userFixture: UserFixture,
  role: 'USER' | 'MANAGER' | 'ADMIN' = 'USER',
): Promise<AdminOrRoleSession> {
  const user = await userFixture.create({ role, password: DEFAULT_PASSWORD });

  const res = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({ email: user.email, password: DEFAULT_PASSWORD })
    .expect(200);

  const body = res.body as AuthResponse;

  return {
    accessToken: body.data.accessToken,
    userId: user.id,
    email: user.email,
  };
}
