import { errorHandler } from './errorHandler.mjs'
import { notFoundHandler } from './notFoundHandler.mjs'

// Централізований error middleware для app.use(errorMiddlewareHandler)
export function errorMiddlewareHandler(app) {
  // 404 handler (має бути після всіх роутів)
  app.use(notFoundHandler)
  // error handler (має бути після notFoundHandler)
  app.use(errorHandler)
}
