import { setupTestDatabase } from 'test/utils/test-db.setup';

export default async function globalSetup() {
  await setupTestDatabase();
}
