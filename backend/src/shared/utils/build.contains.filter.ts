export function buildContainsFilter(
  search?: string,
): { contains: string; mode: 'insensitive' } | undefined {
  if (!search) return undefined;

  return { contains: search, mode: 'insensitive' };
}
