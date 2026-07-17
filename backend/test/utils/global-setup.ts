import { setupTestDatabase } from './test-db.setup';

export default async function globalSetup() {
  await setupTestDatabase();
}
