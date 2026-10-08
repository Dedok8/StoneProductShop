import { useSearchQueryEntity } from "@/shared/hooks/RTK";
import type { IUserResponse } from "@/shared/types";

export const useSearchUser = (query?: string) => {
  const { items, total, isLoading, isFetching, isError, error, hasQuery } =
    useSearchQueryEntity<IUserResponse>(useSearchUser, query);

  return {
    users: items,
    total,
    isLoading,
    isFetching,
    isError,
    error,
    hasQuery,
  };
};
