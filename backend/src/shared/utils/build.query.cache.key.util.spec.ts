import { buildQueryCacheKey } from '@/shared/utils/build.query.cache.key';

describe('buildQueryCacheKey', () => {
  it('builds a key from the prefix and sorted query entries', () => {
    const key = buildQueryCacheKey('products', { limit: 20, page: 1 });

    expect(key).toBe('products:limit=20&page=1');
  });

  it('produces the same key regardless of property order', () => {
    const keyA = buildQueryCacheKey('products', { page: 1, limit: 20 });
    const keyB = buildQueryCacheKey('products', { limit: 20, page: 1 });

    expect(keyA).toBe(keyB);
  });

  it('filters out undefined and null values', () => {
    const key = buildQueryCacheKey('products', {
      page: 1,
      categoryId: undefined,
      ownerId: null,
    });

    expect(key).toBe('products:page=1');
  });

  it('returns "prefix:all" if the query has no defined values', () => {
    const key = buildQueryCacheKey('products', {});

    expect(key).toBe('products:all');
  });

  it('stringifies non-string values such as booleans', () => {
    const key = buildQueryCacheKey('products', { isActive: true });

    expect(key).toBe('products:isActive=true');
  });
});
