import {
  mapToEntity,
  type EntityFactory,
  type WithTimestamps,
} from './map-to-entity.util';

import { Prisma } from '@/generated/prisma/client';
import type { RedisCacheService } from '@/shared';

export async function updateAndInvalidate<
  TModel extends WithTimestamps,
  TEntity,
>(params: {
  updateFn: () => Promise<TModel>;
  cache: RedisCacheService;
  invalidateKeys: (model: TModel) => string[];
  entityClass: EntityFactory<TModel, TEntity>;
}): Promise<TEntity | null> {
  try {
    const updated = await params.updateFn();
    await Promise.all(
      params
        .invalidateKeys(updated)
        .map((key) => params.cache.deleteByPattern(key)),
    );
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
