import type { QueryState } from "@/shared/hooks/RTK/mutationTypes";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";

const DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH = 2;

type SearchQueryHook<Result> = (
  query: string,
  options: { skip: boolean }
) => QueryState & {
  data?: Result[];

  isFetching: boolean;
};

export function useSearchQueryEntity<Result>(
  useQuery: SearchQueryHook<Result>,
  query?: string
) {
  const trimmedQuery = useDebouncedValue(query ?? "", DEBOUNCE_MS).trim();

  const { data, isLoading, isFetching, isError, error } = useQuery(
    trimmedQuery,
    { skip: trimmedQuery.length < MIN_QUERY_LENGTH }
  );

  return {
    items: data ?? [],
    total: data?.length ?? 0,
    isLoading,
    isFetching,
    isError,
    error,
    hasQuery: trimmedQuery.length >= MIN_QUERY_LENGTH,
  };
}
