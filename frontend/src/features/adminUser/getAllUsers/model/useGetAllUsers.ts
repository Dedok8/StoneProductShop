import { useGetAllUsersQuery } from "@/entities";
import { useGetAllPaginated } from "@/shared/hooks/RTK";
import type { IGetUsersQuery, IUserResponse } from "@/shared/types";

export const useGetAllUsers = (query: IGetUsersQuery) => {
  const { items, meta, isLoading, error, isError, isFetching, refetch } =
    useGetAllPaginated<IGetUsersQuery, IUserResponse>(
      useGetAllUsersQuery,
      query
    );

  return {
    users: items,
    meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  };
};
