import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Підключає middleware для обробки статичних файлів (public, uploads)
 * @param {import('express').Express} app
 * @param {string} [baseDir] - Базова директорія (за замовчуванням: директорія цього файлу)
 */
export function setupStaticFiles(app, baseDir) {
  // Визначення поточного файлу і директорії, якщо не передано baseDir
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = baseDir || path.dirname(__filename)

  // Middleware для обробки статичних файлів з директорії public
  app.use(express.static(path.join(__dirname, '../public')))

  // Middleware для обробки статичних файлів з директорії uploads
  app.use(express.static(path.join(__dirname, '../uploads')))
}
