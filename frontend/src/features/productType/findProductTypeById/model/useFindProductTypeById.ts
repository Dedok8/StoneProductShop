import { useFindProductTypeByIdQuery } from "@/entities/productType/api";
import { useGetByIdQueryEntity } from "@/shared/hooks/RTK";
import type { IProductTypeResponse } from "@/shared/types";

export const useFindProductTypeById = (id?: string) => {
  const {data, isLoading, isError, error } = useGetByIdQueryEntity<
    string,
    IProductTypeResponse
  >(useFindProductTypeByIdQuery, id);

  return {productType:data, isLoading, isError, error };
};
