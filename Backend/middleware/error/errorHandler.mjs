/**
 * Універсальний error handler для JSON API
 * @param {any} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export function errorHandler(err, req, res, _next) {
  // Гарантуємо, що res.locals.isProd встановлено (якщо не встановлено security middleware)
  if (typeof res.locals.isProd === 'undefined') {
    res.locals.isProd = process.env.NODE_ENV === 'production'
  }

  const status = Number(err?.status || err?.statusCode || 500)
  const safeStatus = status >= 400 && status < 600 ? status : 500

  const payload = {
    message:
      safeStatus === 500 ? 'Internal Server Error' : err?.message || 'Error',
    reqId: req?.id,
  }

  if (!res.locals.isProd && err?.stack) payload.stack = err.stack
  res.status(safeStatus).json(payload)
}
