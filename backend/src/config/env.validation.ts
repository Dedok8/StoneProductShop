import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    ENABLE_SWAGGER: z.enum(['true', 'false']).default('false'),
    APP_URL: z.url(),
    ALLOWED_ORIGINS: z.string().default(''),
    SENTRY_DSN: z.string().default(''),

    DATABASE_URL: z.string().min(1),
    DATABASE_SSL: z.enum(['true', 'false']).optional(),

    JWT_ACCESS_SECRET: z.string().min(32),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_SECRET: z.string().min(32),
    JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

    REDIS_HOST: z.string().default('localhost'),
    REDIS_PORT: z.coerce.number().int().min(1).max(65535).default(6379),
    REDIS_PASSWORD: z.string().default(''),
    REDIS_DB: z.coerce.number().int().min(0).default(0),
    REDIS_TTL: z.coerce.number().int().positive().default(3600),

    MAIL_HOST: z.string().optional(),
    MAIL_PORT: z.string().optional(),
    MAIL_USER: z.string().optional(),
    MAIL_PASSWORD: z.string().optional(),
    MAIL_FROM: z.string().optional(),
    MANAGER_EMAIL: z.string().optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production' && env.REDIS_PASSWORD.length < 16) {
      ctx.addIssue({
        code: 'custom',
        path: ['REDIS_PASSWORD'],
        message:
          'In production, the Redis password must be at least 16 characters long',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(
      `Error in environment variables:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
