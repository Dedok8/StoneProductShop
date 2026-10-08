import { exec } from 'child_process';
import { promisify } from 'util';

import { config } from 'dotenv';

config({ path: '.env.test' });

const execAsync = promisify(exec);

export async function setupTestDatabase(): Promise<void> {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await execAsync('npx prisma migrate deploy', { env: process.env });
      return;
    } catch (err) {
      if (attempt === maxAttempts) throw err;
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}
