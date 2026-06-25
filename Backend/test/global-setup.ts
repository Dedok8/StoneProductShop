import { execSync } from 'child_process';

import dotenv from 'dotenv';

export default async function globalSetup() {
  // Загружаем тестовые переменные окружения
  dotenv.config({ path: '.env.test' });
  process.env.DATABASE_URL = process.env.DATABASE_URL;

  // Применяем миграции к тестовой БД перед всеми тестами
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL },
    stdio: 'inherit',
  });
}
