import { useState, useCallback } from "react";

function isEqual(a: unknown, b: unknown) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => v === b[i]);
  }
  return a === b;
}

export function useChangeTracking<T extends Record<string, unknown>>(
  initial: T
) {
  const [state, setState] = useState<T>(initial);

  const setField = useCallback(
    <K extends keyof T>(key: K, value: T[K]) =>
      setState((prev) => ({ ...prev, [key]: value })),
    []
  );

  const changes = (Object.keys(state) as (keyof T)[]).reduce((acc, key) => {
    if (!isEqual(state[key], initial[key])) acc[key] = state[key];
    return acc;
  }, {} as Partial<T>);

  return {
    state,
    setField,
    changes,
    isChanged: Object.keys(changes).length > 0,
  };
}
