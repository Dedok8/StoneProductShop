import express from 'express'
import cookieParser from 'cookie-parser'
import loggerConfig from '../config/logger.mjs'
import sessionConfig from '../config/session.mjs'
import auth from './auth.mjs'
import dotenv from 'dotenv'
import { applySecurity } from './security/index.mjs'
import { setupStaticFiles } from './staticFiles.mjs'

import { errorMiddlewareHandler } from './error/index.mjs'

const middleware = (app, opts = {}) => {
  // Завантаження змінних середовища
  dotenv.config()

  // Middleware для парсингу cookies (move to top)
  app.use(cookieParser())

  // Middleware для парсингу тіла запиту (JSON + form-urlencoded)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Підключення security middleware bundle (helmet, cors, rateLimit, body limits, requestId, env marker)
  applySecurity(app, opts.security)

  // Middleware для аутентифікації та авторизації
  auth(app)

  // Middleware для логування запитів
  app.use(loggerConfig)

  // Middleware для обробки статичних файлів (public, uploads)
  setupStaticFiles(app)

  // Middleware для налаштування сесій
  app.use(sessionConfig)
}

export { middleware, errorMiddlewareHandler }
