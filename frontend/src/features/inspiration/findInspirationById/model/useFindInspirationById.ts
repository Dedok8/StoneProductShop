import { useFindInspirationByIdQuery } from "@/entities";
import { useGetByIdQueryEntity } from "@/shared/hooks/RTK";
import type { IInspirationResponse } from "@/shared/types";

export const useFindInspirationById = (id?: string) => {
  const { data, isLoading, error, isError, isFetching } = useGetByIdQueryEntity<
    string,
    IInspirationResponse
  >(useFindInspirationByIdQuery, id);
  return {
    inspiration: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
