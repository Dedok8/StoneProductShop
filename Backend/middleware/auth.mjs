import { parseAccessBearer } from '../utils/jwtHelpers.mjs'

// Список відкритих шляхів, які доступні для GET запитів без авторизації
const publicGetPaths = [
  '/api/v1/products',
  '/api/v1/users-types',
  '/api/v1/users/active-sellers',
]

// Шляхи, які завжди відкриті (наприклад, логін)
const alwaysOpenPaths = [
  '/api/v1/auth/login',
  '/api/v1/auth/signup',
  '/api/v1/auth/refresh-token',
  '/api/v1/auth/logout',
]

// Middleware для перевірки ролей
export function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles]
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ result: 'Forbidden: insufficient rights' })
    }
    next()
  }
}

// Middleware для аутентифікації
export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (authHeader) {
    try {
      req.user = parseAccessBearer(authHeader, req.headers)
    } catch (err) {
      const isAlwaysOpen = alwaysOpenPaths.includes(req.path)
      const isPublicGet = req.method === 'GET' && publicGetPaths.includes(req.path)

      if (!isAlwaysOpen && !isPublicGet) {
        return res.status(401).json({ result: 'Access Denied', error: err.message })
      }
      // If public/open, we allow the request to proceed but without req.user (guest mode)
      delete req.headers.authorization
    }
  }

  // Paths that are ALWAYS open (login, etc)
  if (alwaysOpenPaths.includes(req.path)) {
    return next()
  }

  // Publicly accessible GET paths
  if (req.method === 'GET' && publicGetPaths.includes(req.path)) {
    return next()
  }

  // Fallback: require valid req.user
  if (!req.user) {
    return res.status(401).json({ result: 'No token provided or invalid' })
  }

  next()
}

// Головна функція для підключення middleware
const auth = (app) => {
  // Підключення middleware для аутентифікації
  app.use(authenticate)
}

export default auth
