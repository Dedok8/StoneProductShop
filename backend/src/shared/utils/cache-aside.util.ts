import {
  mapToEntity,
  type EntityFactory,
  type WithTimestamps,
} from './map-to-entity.util';

import type { RedisCacheService } from '@/shared';


export async function findOneCached<TCached, TRaw extends WithTimestamps, TEntity>(params: {
  cache: RedisCacheService;
  key: string;
  ttl: number;
  fetch: () => Promise<TRaw | null>;
  entityClass: EntityFactory<TRaw, TEntity>;
  toCache?: (raw: TRaw) => TCached;
  fromCache?: (cached: TCached) => TRaw;
}): Promise<TEntity | null> {
  const cached = await params.cache.getJson<TCached>(params.key);

  if (cached) {
    const raw = params.fromCache
      ? params.fromCache(cached)
      : (cached as unknown as TRaw);
    return mapToEntity(raw, params.entityClass);
  }

  const raw = await params.fetch();

  if (raw) {
    const toStore = params.toCache
      ? params.toCache(raw)
      : (raw as unknown as TCached);
    await params.cache.setJson(params.key, toStore, params.ttl);
  }

  return raw ? mapToEntity(raw, params.entityClass) : null;
}

export async function findManyCached<TCached, TRaw extends WithTimestamps, TEntity>(params: {
  cache: RedisCacheService;
  key: string;
  ttl: number;
  fetch: () => Promise<{ items: TRaw[]; total: number }>;
  entityClass: EntityFactory<TRaw, TEntity>;
  toCache?: (raw: TRaw) => TCached;
  fromCache?: (cached: TCached) => TRaw;
}): Promise<{ items: TEntity[]; total: number }> {
  const cached = await params.cache.getJson<{
    items: TCached[];
    total: number;
  }>(params.key);

  if (cached) {
    return {
      items: cached.items.map((c) =>
        mapToEntity(
          params.fromCache ? params.fromCache(c) : (c as unknown as TRaw),
          params.entityClass,
        ),
      ),
      total: cached.total,
    };
  }

  const result = await params.fetch();

  await params.cache.setJson(
    params.key,
    {
      items: result.items.map((raw) =>
        params.toCache ? params.toCache(raw) : (raw as unknown as TCached),
      ),
      total: result.total,
    },
    params.ttl,
  );

  return {
    items: result.items.map((raw) => mapToEntity(raw, params.entityClass)),
    total: result.total,
  };
}


export async function invalidateCacheKeys(
  cache: RedisCacheService,
  keys: string[],
): Promise<void> {
  await Promise.all(keys.map((key) => cache.deleteByPattern(key)));
}


export async function createAndInvalidate<TModel extends WithTimestamps, TEntity>(params: {
  createFn: () => Promise<TModel>;
  cache: RedisCacheService;
  invalidateKeys: (model: TModel) => string[];
  entityClass: EntityFactory<TModel, TEntity>;
}): Promise<TEntity> {
  const created = await params.createFn();
  await invalidateCacheKeys(params.cache, params.invalidateKeys(created));
  return mapToEntity(created, params.entityClass);
}


export async function deleteAndInvalidate<TModel extends WithTimestamps>(params: {
  deleteFn: () => Promise<TModel>;
  cache: RedisCacheService;
  invalidateKeys: (model: TModel) => string[];
}): Promise<void> {
  const deleted = await params.deleteFn();
  await invalidateCacheKeys(params.cache, params.invalidateKeys(deleted));
}
