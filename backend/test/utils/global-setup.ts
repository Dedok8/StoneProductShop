import { setupTestDatabase } from './migrate';

export default async function globalSetup() {
  await setupTestDatabase();
}
