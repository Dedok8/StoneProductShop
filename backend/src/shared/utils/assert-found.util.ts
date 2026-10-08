import { AppError } from '@/shared/error';

export function assertFound<T>(
  entity: T | null | undefined,
  message = 'Entity not found',
): T {
  if (!entity) throw AppError.notFound(message);
  return entity;
}
