import { useGetAllUsersQuery } from "@/entities";
import { useDebouncedValue } from "@/shared";

const DEBOUNCE_MS = 350;

export const useSearchUser = (query?: string) => {
  const trimmedQuery = useDebouncedValue(query ?? "", DEBOUNCE_MS).trim();

  const { data, isLoading, isFetching, isError, error } = useGetAllUsersQuery(
    { search: trimmedQuery, limit: 10 },
    { skip: trimmedQuery.length < 2 }
  );

  return {
    users: data?.items ?? [],
    total: data?.meta.total ?? 0,
    isLoading,
    isFetching,
    isError,
    error,
    hasQuery: trimmedQuery.length >= 2,
  };
};
