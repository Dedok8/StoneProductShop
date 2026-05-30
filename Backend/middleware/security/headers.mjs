/**
 * headers.mjs
 * ----------
 * Встановлює захищені HTTP-заголовки через helmet.
 *
 * Проблема:
 *  - Багато браузерних атак використовують відсутні або небезпечні заголовки:
 *    - Clickjacking (фреймування вашого сайту)
 *    - MIME sniffing (неочікуване трактування контенту як JS/HTML)
 *    - Слабка політика referrer
 *    - Відсутність захисту між доменами тощо
 *
 * Рішення:
 *  - Використовуйте helmet з ретельно підібраними налаштуваннями.
 *  - За потреби застосовуйте CSP (Content Security Policy) для зменшення ризику XSS.
 *
 * Професійна практика:
 *  - CSP потужний, але може зламати додаток при неправильному налаштуванні.
 *  - Починайте з мінімального CSP, тестуйте на staging, потім поступово посилюйте.
 *  - Якщо фронтенд подається з іншого домену (SPA), CSP для API часто можна вимкнути.
 */

import helmet from 'helmet'

/**
 * Build a helmet middleware.
 *
 * @param {{
 *   enableCsp?: boolean,
 *   cspDirectives?: import('helmet').ContentSecurityPolicyOptions['directives']
 * }} [opts]
 *
 * @returns {import('express').RequestHandler}
 */
export function securityHeaders({ enableCsp = true, cspDirectives } = {}) {
  // Minimal, fairly safe CSP defaults.
  // You MUST adjust for:
  //  - Your CDN domains
  //  - Analytics scripts
  //  - Inline scripts/styles (avoid if possible)
  const contentSecurityPolicy = enableCsp
    ? {
        useDefaults: true,
        directives: cspDirectives ?? {
          'default-src': ["'self'"],
          'base-uri': ["'self'"],
          'object-src': ["'none'"],
          'frame-ancestors': ["'none'"],

          // If you serve an API only (no HTML), CSP is less critical.
          // If you serve HTML/SSR, CSP becomes important.
          'script-src': ["'self'"],

          // 'unsafe-inline' is not ideal. Prefer hashed/nonced styles if you can.
          // Kept here as a pragmatic default for many templates.
          'style-src': ["'self'", "'unsafe-inline'"],

          'img-src': ["'self'", 'data:'],
          'connect-src': ["'self'"],
        },
      }
    : false

  return helmet({
    contentSecurityPolicy,
    // Prevent some cross-origin data leaks in modern browsers.
    crossOriginResourcePolicy: { policy: 'same-site' },
    // Clickjacking protection.
    frameguard: { action: 'deny' },
  })
}
