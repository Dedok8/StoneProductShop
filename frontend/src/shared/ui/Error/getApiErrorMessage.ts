import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getApiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null;

  if ("data" in error) {
    const err = error as FetchBaseQueryError;
    return (err.data as { message?: string })?.message ?? null;
  }

  return null;
}
