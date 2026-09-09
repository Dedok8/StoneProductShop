import { useEffect, useState } from "react";

export const useDebouncedValue = <T>(value: T, delayMs: number): T => {
  const [debouncedQuery, setDebouncedQuery] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(value), delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedQuery;
};
