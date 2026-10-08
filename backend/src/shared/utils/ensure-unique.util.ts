import { AppError } from '@/shared/error';

export async function ensureUnique<T extends { id: string }>(
  finder: () => Promise<T | null>,
  excludeId?: string,
  message = 'Value already in use',
): Promise<void> {
  const existing = await finder();

  if (existing && existing.id !== excludeId) {
    throw AppError.alreadyExists(message);
  }
}
