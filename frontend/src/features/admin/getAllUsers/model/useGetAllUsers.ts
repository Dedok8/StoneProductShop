import { useGetAllUsersQuery } from "@/entities";
import type { IGetUsersQuery } from "@/shared";

export const useGetAllUsers = (query: IGetUsersQuery) => {
  const { data, isLoading, error, isError, isFetching, refetch } =
    useGetAllUsersQuery(query);

  return {
    users: data?.items ?? [],
    meta: data?.meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  };
};
