import type { QueryState } from "@/shared/hooks/RTK/mutationTypes";

type GetByIdQueryHook<Arg, Result> = (
  id: Arg,
  options?: { skip?: boolean }
) => QueryState & {
  data: Result | undefined;
  isFetching: boolean;
};

export function useGetByIdQueryEntity<Arg, Result>(
  useQuery: GetByIdQueryHook<Arg, Result>,
  id: Arg | undefined
) {
  const { data, isLoading, error, isError, isFetching } = useQuery(id as Arg, {
    skip: !id,
  });

  return { data, isLoading, error, isError, isFetching };
}
