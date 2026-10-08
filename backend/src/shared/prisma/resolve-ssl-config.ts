export function resolveSslConfig(connectionString?: string) {
  if (!connectionString) return undefined;

  if (process.env.DATABASE_SSL === 'false') return undefined;
  if (process.env.DATABASE_SSL === 'true') return { rejectUnauthorized: false };

  try {
    new URL(connectionString);

    const isLocal = process.env.NODE_ENV !== 'production';

    return isLocal ? undefined : { rejectUnauthorized: false };
  } catch {
    return undefined;
  }
}
