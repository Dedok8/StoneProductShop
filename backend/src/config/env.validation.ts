import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  PORT: Joi.number().port().default(3000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),

  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().port().default(6379),

  REDIS_PASSWORD: Joi.string()
    .allow('')
    .when('NODE_ENV', {
      is: 'production',
      then: Joi.string().min(16).required(),
      otherwise: Joi.string().allow('').optional(),
    }),

  REDIS_DB: Joi.number().integer().min(0).default(0),

  REDIS_TTL: Joi.number().integer().positive().default(3600),

  ALLOWED_ORIGINS: Joi.string().allow('').optional(),

  SENTRY_DSN: Joi.string().allow('').optional(),

  PGADMIN_EMAIL: Joi.string().email().optional(),
  PGADMIN_PASSWORD: Joi.string().optional(),
  PGADMIN_HOST_PORT: Joi.number().port().optional(),
  PGADMIN_CONTAINER_PORT: Joi.number().port().optional(),
});
