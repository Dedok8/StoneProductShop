// Перевірка валідності MongoDB ObjectId
import mongoose from 'mongoose'
export function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id)
}

// Екранує спецсимволи у рядку для безпечного використання у RegExp
export function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Парсинг булевого значення з рядка/числа
export function parseBoolean(v) {
  const s = String(v).trim().toLowerCase()
  if (s === 'true' || s === '1') return true
  if (s === 'false' || s === '0') return false
  return null
}

// Парсинг числа з рядка
export function parseNumber(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// Парсинг цілого числа (тільки якщо ціле)
export function parseIntStrict(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isInteger(n) ? n : null
}

// Парсинг дати з рядка
export function parseDate(v) {
  if (!v) return null
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d
}

// Парсинг рядка (trim, null якщо порожній)
export function parseString(v) {
  if (v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

// Парсинг числа з плаваючою точкою (тільки якщо коректне)
export function parseFloatStrict(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// Парсинг масиву (через роздільник або JSON)
export function parseArray(v, delimiter = ',') {
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    try {
      // JSON масив
      if (v.trim().startsWith('[')) return JSON.parse(v)
      // Роздільник
      return v
        .split(delimiter)
        .map((s) => s.trim())
        .filter(Boolean)
    } catch {
      return null
    }
  }
  return null
}

// Парсинг об'єкта (JSON або null)
export function parseObject(v) {
  if (typeof v === 'object' && v !== null) return v
  if (typeof v === 'string') {
    try {
      return JSON.parse(v)
    } catch {
      return null
    }
  }
  return null
}

// Безпечний парсинг JSON
export function parseJson(v) {
  try {
    return JSON.parse(v)
  } catch {
    return null
  }
}

// Парсинг enum (тільки якщо входить у перелік)
export function parseEnum(v, allowed) {
  if (!allowed) return null
  const val = String(v).trim()
  return allowed.includes(val) ? val : null
}

// Обмеження числа в діапазоні
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

// Перетворення на масив (навіть якщо вже масив)
export function toArray(val) {
  if (Array.isArray(val)) return val
  if (val === undefined || val === null) return []
  return [val]
}

// Перевірка на "порожнє" значення (null, undefined, '', [], {})
export function isEmpty(val) {
  if (val == null) return true
  if (typeof val === 'string' && val.trim() === '') return true
  if (Array.isArray(val) && val.length === 0) return true
  if (typeof val === 'object' && Object.keys(val).length === 0) return true
  return false
}

// Вибрати лише певні ключі з об'єкта
export function pick(obj, keys) {
  const out = {}
  for (const k of keys) if (k in obj) out[k] = obj[k]
  return out
}

// Відкинути певні ключі з об'єкта
export function omit(obj, keys) {
  const out = { ...obj }
  for (const k of keys) delete out[k]
  return out
}

// Перша літера велика
export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Debounce для функцій (затримка виконання)
export function debounce(fn, delay) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
