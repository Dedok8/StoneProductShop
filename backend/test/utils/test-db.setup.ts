import { exec } from 'child_process';
import { promisify } from 'util';

import { PrismaPg } from '@prisma/adapter-pg';
import { config } from 'dotenv';
import { Pool } from 'pg';

import { PrismaClient } from '@/generated/prisma/client';

config({ path: '.env.test' });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

const execAsync = promisify(exec);

export async function setupTestDatabase(): Promise<void> {
  await execAsync('npx prisma migrate deploy', {
    env: process.env,
  });
}

export async function cleanDatabase(): Promise<void> {
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function disconnectTestDatabase(): Promise<void> {
  await prisma.$disconnect();
  await pool.end();
}

export { prisma as testPrismaClient };
