import { NotFoundException } from '@nestjs/common';

export function assertFound<T>(
  entity: T | null | undefined,
  message = 'Entity not found',
): T {
  if (!entity) throw new NotFoundException(message);
  return entity;
}
