export function buildQueryCacheKey<T extends object>(
  prefix: string,
  query: T,
): string {
  const entries = Object.entries(query) as [string, unknown][];

  const normalized = entries
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');

  return `${prefix}:${normalized || 'all'}`;
}
