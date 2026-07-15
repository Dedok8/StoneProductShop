import type { MockProxy } from 'jest-mock-extended';
import { mock } from 'jest-mock-extended';

import type { WithTimestamps } from '@/shared';
import {
  createAndInvalidate,
  deleteAndInvalidate,
  findManyCached,
  findOneCached,
  invalidateCacheKeys,
  type RedisCacheService,
} from '@/shared';

jest.mock('./map-to-entity.util', () => ({
  mapToEntity: jest.fn(
    (raw: unknown, EntityClass: new (raw: unknown) => unknown) =>
      new EntityClass(raw),
  ),
}));

class TestEntity {
  constructor(public raw: WithTimestamps) {}

  static fromPersistence(raw: WithTimestamps): TestEntity {
    return new TestEntity(raw);
  }
}

const makeRaw = (overrides: Record<string, unknown> = {}) => ({
  id: 'id-1',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...overrides,
});

describe('findOneCached', () => {
  let cache: MockProxy<RedisCacheService>;

  beforeEach(() => {
    cache = mock<RedisCacheService>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns the cached value mapped to an entity without calling fetch, on a cache hit', async () => {
    const raw = makeRaw();
    cache.getJson.mockResolvedValue(raw);
    const fetch = jest.fn();

    const result = await findOneCached({
      cache,
      key: 'key-1',
      ttl: 60,
      fetch,
      entityClass: TestEntity,
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toBeInstanceOf(TestEntity);
    expect(result!.raw).toEqual(raw);
  });

  it('calls fetch, caches the result, and returns the mapped entity on a cache miss', async () => {
    const raw = makeRaw();
    cache.getJson.mockResolvedValue(null);
    const fetch = jest.fn().mockResolvedValue(raw);

    const result = await findOneCached({
      cache,
      key: 'key-1',
      ttl: 60,
      fetch,
      entityClass: TestEntity,
    });

    expect(fetch).toHaveBeenCalled();
    expect(cache.setJson).toHaveBeenCalledWith('key-1', raw, 60);
    expect(result!.raw).toEqual(raw);
  });

  it('returns null and does not write to the cache if fetch finds nothing', async () => {
    cache.getJson.mockResolvedValue(null);
    const fetch = jest.fn().mockResolvedValue(null);

    const result = await findOneCached({
      cache,
      key: 'key-1',
      ttl: 60,
      fetch,
      entityClass: TestEntity,
    });

    expect(result).toBeNull();
    expect(cache.setJson).not.toHaveBeenCalled();
  });

  it('applies the toCache/fromCache transforms when provided', async () => {
    const raw = makeRaw({ secret: 'hidden' });
    cache.getJson.mockResolvedValue(null);
    const fetch = jest.fn().mockResolvedValue(raw);
    const toCache = jest.fn((r: typeof raw) => ({ id: r.id }));
    const fromCache = jest.fn((c: { id: string }) => makeRaw({ id: c.id }));

    await findOneCached({
      cache,
      key: 'key-1',
      ttl: 60,
      fetch,
      entityClass: TestEntity,
      toCache,
      fromCache,
    });

    expect(toCache).toHaveBeenCalledWith(raw);
    expect(cache.setJson).toHaveBeenCalledWith('key-1', { id: raw.id }, 60);
  });
});

describe('findManyCached', () => {
  let cache: MockProxy<RedisCacheService>;

  beforeEach(() => {
    cache = mock<RedisCacheService>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('returns cached items mapped to entities without calling fetch, on a cache hit', async () => {
    const raw = makeRaw();
    cache.getJson.mockResolvedValue({ items: [raw], total: 1 });
    const fetch = jest.fn();

    const result = await findManyCached({
      cache,
      key: 'key-1',
      ttl: 60,
      fetch,
      entityClass: TestEntity,
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.total).toBe(1);
    expect(result.items[0]).toBeInstanceOf(TestEntity);
  });

  it('calls fetch, caches the result, and returns mapped entities on a cache miss', async () => {
    const raw = makeRaw();
    cache.getJson.mockResolvedValue(null);
    const fetch = jest.fn().mockResolvedValue({ items: [raw], total: 1 });

    const result = await findManyCached({
      cache,
      key: 'key-1',
      ttl: 60,
      fetch,
      entityClass: TestEntity,
    });

    expect(cache.setJson).toHaveBeenCalledWith(
      'key-1',
      { items: [raw], total: 1 },
      60,
    );
    expect(result.items).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('caches an empty result set if fetch returns no items', async () => {
    cache.getJson.mockResolvedValue(null);
    const fetch = jest.fn().mockResolvedValue({ items: [], total: 0 });

    const result = await findManyCached({
      cache,
      key: 'key-1',
      ttl: 60,
      fetch,
      entityClass: TestEntity,
    });

    expect(cache.setJson).toHaveBeenCalledWith(
      'key-1',
      { items: [], total: 0 },
      60,
    );
    expect(result.items).toEqual([]);
  });
});

describe('invalidateCacheKeys', () => {
  let cache: MockProxy<RedisCacheService>;

  beforeEach(() => {
    cache = mock<RedisCacheService>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls deleteByPattern for every key provided', async () => {
    await invalidateCacheKeys(cache, ['products:1', 'products:all']);

    expect(cache.deleteByPattern).toHaveBeenCalledWith('products:1');
    expect(cache.deleteByPattern).toHaveBeenCalledWith('products:all');
    expect(cache.deleteByPattern).toHaveBeenCalledTimes(2);
  });

  it('does nothing if no keys are provided', async () => {
    await invalidateCacheKeys(cache, []);

    expect(cache.deleteByPattern).not.toHaveBeenCalled();
  });
});

describe('createAndInvalidate', () => {
  let cache: MockProxy<RedisCacheService>;

  beforeEach(() => {
    cache = mock<RedisCacheService>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('creates the record, invalidates the derived cache keys, and returns the mapped entity', async () => {
    const created = makeRaw();
    const createFn = jest.fn().mockResolvedValue(created);
    const invalidateKeys = jest.fn().mockReturnValue(['products:all']);

    const result = await createAndInvalidate({
      createFn,
      cache,
      invalidateKeys,
      entityClass: TestEntity,
    });

    expect(createFn).toHaveBeenCalled();
    expect(invalidateKeys).toHaveBeenCalledWith(created);
    expect(cache.deleteByPattern).toHaveBeenCalledWith('products:all');
    expect(result).toBeInstanceOf(TestEntity);
  });
});

describe('deleteAndInvalidate', () => {
  let cache: MockProxy<RedisCacheService>;

  beforeEach(() => {
    cache = mock<RedisCacheService>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('deletes the record and invalidates the derived cache keys', async () => {
    const deleted = makeRaw();
    const deleteFn = jest.fn().mockResolvedValue(deleted);
    const invalidateKeys = jest.fn().mockReturnValue(['products:1']);

    await deleteAndInvalidate({ deleteFn, cache, invalidateKeys });

    expect(deleteFn).toHaveBeenCalled();
    expect(invalidateKeys).toHaveBeenCalledWith(deleted);
    expect(cache.deleteByPattern).toHaveBeenCalledWith('products:1');
  });
});
