import { ConflictException } from '@nestjs/common';

export async function ensureUnique<T extends { id: string }>(
  finder: () => Promise<T | null>,
  excludeId?: string,
  message = 'Value already in use',
): Promise<void> {
  const existing = await finder();

  if (existing && existing.id !== excludeId) {
    throw new ConflictException(message);
  }
}