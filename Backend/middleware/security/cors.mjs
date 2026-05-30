/**
 * cors.mjs
 * --------
 * Фабрика політик CORS (строга за замовчуванням).
 *
 * Проблема:
 *  - Неправильна конфігурація CORS може відкрити ваш API для небажаних джерел
 *  - Класична помилка: origin: '*' + credentials: true
 *    (це небезпечно і часто не працює як очікується)
 *
 * Рішення:
 *  - У production/staging використовуємо allow-list точних origin'ів.
 *  - У development дозволяємо будь-які origin для зручності розробки.
 *
 * Примітки:
 *  - Якщо API використовує ТІЛЬКИ Bearer tokens (без cookies),
 *    можна credentials: false.
 *  - Дозволяємо запити без Origin (curl/Postman/server-to-server),
 *    якщо allowNoOrigin = true.
 */

import cors from 'cors'

/**
 * @param {{
 *   /**
 *    * Список дозволених origin'ів (allow-list).
 *    *
 *    * Приклади реальних значень:
 *    * [
 *    *   // ✅ Production frontend
 *    *   'https://example.com',
 *    *   'https://www.example.com',
 *    *
 *    *   // ✅ Admin panel
 *    *   'https://admin.example.com',
 *    *
 *    *   // ✅ Staging / preview
 *    *   'https://staging.example.com',
 *    *   'https://preview.example.com',
 *    *
 *    *   // ✅ Local development (інколи дозволяють у staging)
 *    *   'http://localhost:3000',
 *    *   'http://localhost:5173',
 *    *   'http://127.0.0.1:3000',
 *    *
 *    *   // ✅ Mobile/webview dev servers
 *    *   'http://192.168.0.10:3000',
 *    *
 *    *   // ✅ Тимчасові тунелі (краще не в проді)
 *    *   'https://myapp.ngrok.io',
 *    *   'https://myapp.trycloudflare.com'
 *    * ]
 *    *
 *    * ВАЖЛИВО:
 *    *  - origin включає протокол + домен + порт
 *    *  - 'example.com' без https — НЕ валідний origin
 *    *  - '*' тут НЕ використовується у безпечних конфігураціях
 *    */
//  *   allowedOrigins?: string[],
//  *
//  *   /**
//  *    * Чи дозволяти запити без Origin header:
//  *    *  - curl
//  *    *  - Postman
//  *    *  - server-to-server
//  *    */
//  *   allowNoOrigin?: boolean,
//  *
//  *   /**
//  *    * Чи дозволяти credentials (cookies, session).
//  *    * true — для cookie/session auth
//  *    * false — для чистого Bearer token API
//  *    */
//  *   credentials?: boolean
//  * }} [opts]
//  *
//  * @returns {import('express').RequestHandler}
//  */
export function corsPolicy({
  allowedOrigins = [],
  allowNoOrigin = true,
  credentials = true,
} = {}) {
  // ✅ DEV MODE: дозволяємо будь-які origin (для localhost/портів/тунелів)
  const isDev = process.env.NODE_ENV === 'development'

  // Для швидкого lookup у production/staging
  const set = new Set(allowedOrigins)

  return cors({
    origin(origin, cb) {
      /**
       * ✅ DEVELOPMENT MODE
       * --------------------
       * У dev дозволяємо все. Важливо: повертаємо true, а не '*',
       * щоб коректно працювало з credentials.
       */
      if (isDev) return cb(null, true)

      /**
       * ✅ NO ORIGIN
       * ------------
       * Зазвичай означає:
       *  - server-to-server
       *  - curl/postman
       */
      if (!origin) return cb(null, allowNoOrigin)

      /**
       * ✅ PRODUCTION/STAGING
       * ---------------------
       * Дозволяємо тільки whitelist.
       */
      if (set.has(origin)) return cb(null, true)

      /**
       * ❌ BLOCKED ORIGIN
       * -----------------
       * Професійна практика: можна логувати для аудиту.
       */
      return cb(null, false)
    },

    credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    // Мінімально необхідний набір.
    // Розширюйте лише за потреби.
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'X-Request-Id',
    ],

    // Кешуємо preflight 10 хвилин
    maxAge: 600,
  })
}
