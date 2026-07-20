export function resolveSslConfig(connectionString?: string) {
  if (!connectionString) return undefined;
  try {
    const { hostname } = new URL(connectionString);
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    return isLocal ? undefined : { rejectUnauthorized: false };
  } catch {
    return undefined;
  }
}
