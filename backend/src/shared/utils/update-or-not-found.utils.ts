import type { EntityFactory, WithTimestamps } from './map-to-entity.util';
import { mapToEntity } from './map-to-entity.util';

import { Prisma } from '@/generated/prisma/client';

export async function updateOrNotFound<
  TModel extends WithTimestamps,
  TEntity,
>(params: {
  updateFn: () => Promise<TModel>;
  entityClass: EntityFactory<TModel, TEntity>;
}): Promise<TEntity | null> {
  try {
    const updated = await params.updateFn();
    return mapToEntity(updated, params.entityClass);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return null;
    }
    throw error;
  }
}
