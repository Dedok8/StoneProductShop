/**
 * requestId.mjs
 * -------------
 * Мідлвар, який:
 *  - гарантує, що кожен запит має унікальний ідентифікатор (req.id)
 *  - повертає його клієнту у заголовку відповіді X-Request-Id
 *
 * Навіщо це потрібно (практично):
 *  - Можна корелювати логи між різними мідлварами/маршрутами
 *  - Можна попросити користувача надати "reqId", якщо щось пішло не так
 *  - Якщо пізніше додати трасування (OpenTelemetry), request id стане природним ключем для кореляції
 *
 * Примітки:
 *  - Спочатку враховується вхідний "x-request-id" (корисно, якщо у вас є gateway/proxy, який вже його призначає)
 *  - Інакше генерується UUID v4 через crypto.randomUUID()
 */

import crypto from 'node:crypto'

/**
 * Створити мідлвар для request id.
 *
 * @returns {(req: import('express').Request & {id?: string}, res: import('express').Response, next: import('express').NextFunction) => void}
 */
export function requestId() {
  return (req, res, next) => {
    // 1) Якщо зворотний проксі / API gateway вже встановив X-Request-Id, використовуємо його.
    //    Це важливо у розподілених системах: потрібен один id для всіх переходів.
    const incoming = req.headers['x-request-id']

    // Переконуємось, що це рядок (деякі рантайми можуть надати string | string[])
    const id =
      (typeof incoming === 'string' && incoming.trim()) ||
      // 2) Інакше генеруємо новий для цього запиту.
      crypto.randomUUID()

    // Додаємо до req для коду додатку і до res для клієнта.
    req.id = id
    res.setHeader('x-request-id', id)

    next()
  }
}
