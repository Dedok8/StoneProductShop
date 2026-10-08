import { useGetAllLeadQuery } from "@/entities";
import { useGetAllPaginated } from "@/shared/hooks/RTK";
import type { IGetLeadQuery, ILeadsResponse } from "@/shared/types";

export const useGetAllLead = (query: IGetLeadQuery) => {
  const { items, meta, isLoading, error, isError, isFetching } =
    useGetAllPaginated<IGetLeadQuery, ILeadsResponse>(
      useGetAllLeadQuery,
      query
    );
  return { items, meta, isLoading, error, isError, isFetching };
};
