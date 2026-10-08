import { useCreateProductColorMutation } from "@/entities/productColor/api/productColorApi";
import { useCreateEntity } from "@/shared/hooks/RTK";
import type {
  ICreateProductColorRequest,
  IProductColorResponse,
} from "@/shared/types";

export const useCreateProductColor = () => {
  const { createEntity, isLoading, error, isError } = useCreateEntity<
    ICreateProductColorRequest,
    IProductColorResponse
  >(useCreateProductColorMutation);

  return { createProductColor: createEntity, isLoading, error, isError };
};
