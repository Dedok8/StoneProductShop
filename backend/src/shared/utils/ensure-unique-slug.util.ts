export async function ensureUniqueSlug(
  baseSlug: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await exists(baseSlug))) return baseSlug;

  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;

  while (await exists(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}
