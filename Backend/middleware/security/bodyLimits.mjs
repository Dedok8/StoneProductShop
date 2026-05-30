/**
 * bodyLimits.mjs
 * --------------
 * Централізовані ліміти для парсингу тіла запиту (захист від DoS / зловживання ресурсами).
 *
 * Проблема:
 *  - Атакуючі можуть надсилати дуже великі JSON/form тіла, щоб витрачати CPU/RAM (або сповільнювати парсинг).
 *  - Навіть "легітимні" клієнти можуть випадково надіслати величезні payload'и й погіршити продуктивність.
 *
 * Рішення:
 *  - Тримайте тіла запитів малими за замовчуванням і збільшуйте лише для конкретних endpoint'ів, де це дійсно потрібно.
 *
 * Професійна практика:
 *  - Використовуйте "глобальний дефолтний" ліміт (наприклад, 100kb)
 *  - Якщо у вас є завантаження файлів, НЕ підвищуйте ці ліміти глобально; використовуйте окремий upload middleware (multer/busboy)
 *    зі строгими лімітами лише на відповідному endpoint'і.
 */

import express from 'express'

/**
 * Returns an array of middleware: json parser + urlencoded parser.
 * You can app.use(...bodyLimits()) or iterate and app.use each.
 *
 * @param {{ jsonLimit?: string, urlencodedLimit?: string }} [opts]
 * @returns {Array<import('express').RequestHandler>}
 */
export function bodyLimits({
  jsonLimit = '100kb',
  urlencodedLimit = '50kb',
} = {}) {
  // JSON: typical REST API payloads rarely need more than 100kb.
  // If you have big objects (reports etc.) consider pagination / streaming instead.
  const json = express.json({ limit: jsonLimit })

  // urlencoded: mainly for classic form posts; keep smaller.
  const urlencoded = express.urlencoded({
    extended: false,
    limit: urlencodedLimit,
  })

  return [json, urlencoded]
}
