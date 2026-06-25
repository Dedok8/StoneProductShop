import { execSync } from 'child_process';

import dotenv from 'dotenv';

export default function globalSetup() {
  dotenv.config({ path: '.env.test' });

  execSync('npx prisma migrate deploy', {
    env: { ...process.env },
    stdio: 'inherit',
  });
}
