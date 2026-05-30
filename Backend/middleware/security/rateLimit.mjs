/**
 * rateLimit.mjs
 * ------------
 * Створює набір лімітерів для різних зон API.
 *
 * Проблема:
 *  - Брутфорс на login/OTP endpoint'ах
 *  - Боти, що навантажують дорогі endpoint'и (пошук, звіти, експорт)
 *  - Загальне зловживання API (занадто багато запитів з однієї IP)
 *
 * Рішення:
 *  - Використовувати кілька лімітерів:
 *    1) global: м'який ліміт для всього
 *    2) auth: суворий ліміт для /auth/*
 *    3) expensive: помірно суворий для дорогих endpoint'ів
 *
 * Важливо (production):
 *  - У багатопроцесних розгортаннях (PM2 cluster / k8s / декілька контейнерів)
 *    використовуйте спільне сховище (зазвичай Redis). Без цього кожен інстанс має свої лічильники.
 *  - express-rate-limit підтримує сховища; можна передати `store` у кожен лімітер.
 */

import rateLimit from 'express-rate-limit'

/**
 * @typedef {{
 *   windowMs: number,
 *   limit: number
 * }} LimiterConfig
 */

/**
 * @param {{
 *   global?: LimiterConfig,
 *   auth?: LimiterConfig,
 *   expensive?: LimiterConfig,
 *   // store?: import('express-rate-limit').Store
 * }} [opts]
 */
export function createLimiters({
  global = { windowMs: 15 * 60 * 1000, limit: 600 },
  auth = { windowMs: 10 * 60 * 1000, limit: 20 },
  expensive = { windowMs: 5 * 60 * 1000, limit: 60 },
  // store,
} = {}) {
  // Common headers:
  //  - standardHeaders: returns the standardized RateLimit headers (draft-7)
  //  - legacyHeaders: disables X-RateLimit-* legacy headers
  const common = {
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }

  return {
    global: rateLimit({
      ...common,
      windowMs: global.windowMs,
      limit: global.limit,
      message: { message: 'Too many requests. Try again later.' },
      // store,
    }),

    auth: rateLimit({
      ...common,
      windowMs: auth.windowMs,
      limit: auth.limit,
      message: { message: 'Too many auth attempts. Try later.' },
      // store,
    }),

    expensive: rateLimit({
      ...common,
      windowMs: expensive.windowMs,
      limit: expensive.limit,
      message: { message: 'Rate limit exceeded for this endpoint.' },
      // store,
    }),
  }
}
