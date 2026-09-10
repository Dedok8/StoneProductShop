import { useSearchUserQuery } from "@/entities";
import { useDebouncedValue } from "@/shared";

const DEBOUNCE_MS = 350;

export const useSearchUser = (query?: string) => {
  const trimmedQuery = useDebouncedValue(query ?? "", DEBOUNCE_MS).trim();

  const { data, isLoading, isFetching, isError, error } = useSearchUserQuery(
    trimmedQuery,
    { skip: trimmedQuery.length < 2 }
  );

  return {
    users: data ?? [],
    total: data?.length ?? 0,
    isLoading,
    isFetching,
    isError,
    error,
    hasQuery: trimmedQuery.length >= 2,
  };
};
