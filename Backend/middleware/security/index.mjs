/**
 * index.mjs (композитор security bundle)
 * --------------------------------------
 * Цей файл компонувує окремі модулі security middleware у професійному порядку.
 *
 * Чому цей підхід "production-grade":
 *  - Кожна задача ізольована у своєму файлі (тестується, перевикористовується)
 *  - Цей index експортує ОДНУ функцію для застосування всього одразу (зручно у використанні)
 *  - Можна пізніше додати "профілі":
 *      applySecurityPublic(app, opts)
 *      applySecurityAdmin(app, opts)
 *    без переписування всієї логіки підключення.
 *
 * Рекомендований порядок middleware:
 *  0) Базове посилення (x-powered-by, trust proxy)
 *  1) request id (для кореляції логів якнайшвидше)
 *  2) body limits (захист від DoS)
 *  3) security headers (helmet / CSP)
 *  4) CORS
 *  5) rate limits (глобальні + auth + дорогі)
 *  6) маркер середовища для error handler (опційно)
 */

import { requestId } from './requestId.mjs'
import { bodyLimits } from './bodyLimits.mjs'
import { securityHeaders } from './headers.mjs'
import { corsPolicy } from './cors.mjs'
import { createLimiters } from './rateLimit.mjs'

/**
 * Apply security middleware bundle to an Express app.
 *
 * @param {import('express').Express} app
 * @param {{
 *   trustProxy?: number|boolean|string,
 *   apiPrefix?: string,
 *   isProd?: boolean,
 *   allowedOrigins?: string[],
 *   corsAllowNoOrigin?: boolean,
 *   corsCredentials?: boolean,
 *   jsonLimit?: string,
 *   urlencodedLimit?: string,
 *   helmetCsp?: boolean,
 *   cspDirectives?: import('helmet').ContentSecurityPolicyOptions['directives'],
 *   rate?: Parameters<typeof createLimiters>[0],
 *   expensiveRoutes?: string[],
 * }} [opts]
 *
 * @returns {{ limiters: ReturnType<typeof createLimiters> }}
 */
export function applySecurity(app, opts = {}) {
  const {
    trustProxy = 1,
    apiPrefix = '/api',
    isProd = process.env.NODE_ENV === 'production',

    // CORS
    allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:8080',
    ],
    corsAllowNoOrigin = true,
    corsCredentials = true,

    // Body limits
    jsonLimit = '100kb',
    urlencodedLimit = '50kb',

    // Helmet/CSP
    helmetCsp = true,
    cspDirectives,

    // Rate limits
    rate = {},

    // Which routes are considered "expensive" (search/reports/export by default)
    expensiveRoutes = ['/search', '/reports', '/export'],
  } = opts

  // --- 0) Core hardening
  app.disable('x-powered-by')

  // trust proxy is CRITICAL if you run behind:
  //  - Nginx, Cloudflare, Heroku/Render, a load balancer, etc.
  // It allows Express (and rate-limit) to see the real client IP.
  app.set('trust proxy', trustProxy)

  // --- 1) Request ID early (so everything can log it)
  app.use(requestId())

  // --- 2) Body limits: mitigate large-body abuse
  for (const mw of bodyLimits({ jsonLimit, urlencodedLimit })) {
    app.use(mw)
  }

  // --- 3) Security headers
  app.use(securityHeaders({ enableCsp: helmetCsp, cspDirectives }))

  // --- 4) CORS policy
  app.use(
    corsPolicy({
      allowedOrigins,
      allowNoOrigin: corsAllowNoOrigin,
      credentials: corsCredentials,
    }),
  )

  // --- 5) Rate limiters
  const limiters = createLimiters(rate)

  // Global limiter applies to ALL /api traffic:
  app.use(apiPrefix, limiters.global)

  // Strict limiter for auth endpoints:
  app.use(`${apiPrefix}/auth`, limiters.auth)

  // Expensive endpoints limiter:
  for (const route of expensiveRoutes) {
    // Ensure route starts with '/'
    const normalized = route.startsWith('/') ? route : `/${route}`
    app.use(`${apiPrefix}${normalized}`, limiters.expensive)
  }

  // --- 6) Mark environment for the error handler (to hide stack traces in prod)
  app.use((req, res, next) => {
    res.locals.isProd = isProd
    next()
  })

  return { limiters }
}
