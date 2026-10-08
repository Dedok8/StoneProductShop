import type { QueryState } from "@/shared/hooks/RTK/mutationTypes";
import type { IPaginated } from "@/shared/types";

type PaginatedQueryHook<Arg, Item> = (arg: Arg) => QueryState & {
  data?: IPaginated<Item>;
  refetch: () => void;
};

export function useGetAllPaginated<Arg, Item>(
  useQuery: PaginatedQueryHook<Arg, Item>,
  arg: Arg
) {
  const { data, isLoading, error, isError, isFetching, refetch } =
    useQuery(arg);

  return {
    items: data?.items ?? [],
    meta: data?.meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  };
}
