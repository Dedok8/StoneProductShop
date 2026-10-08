import { useCreateProductTypeMutation } from "@/entities/productType/api";
import { useCreateEntity } from "@/shared/hooks/RTK";
import type {
  ICreateProductTypeRequest,
  IProductTypeResponse,
} from "@/shared/types";

export const useCreateProductType = () => {
  const { createEntity, isLoading, error, isError } = useCreateEntity<
    ICreateProductTypeRequest,
    IProductTypeResponse
  >(useCreateProductTypeMutation);

  return { createProductType: createEntity, isLoading, error, isError };
};
