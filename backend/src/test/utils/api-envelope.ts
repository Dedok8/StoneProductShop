export interface ApiEnvelope<T> {
  data: T;
  timestamp: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedPayload<T> {
  items: T[];
  meta: PaginationMeta;
}

export function asEnvelope<T>(body: unknown): ApiEnvelope<T> {
  return body as ApiEnvelope<T>;
}
