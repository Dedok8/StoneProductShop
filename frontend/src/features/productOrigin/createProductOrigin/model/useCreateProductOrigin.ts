import { useCreateProductColorMutation } from "@/entities";
import { useCreateEntity } from "@/shared/hooks/RTK";
import type {
  ICreateProductColorRequest,
  IProductColorResponse,
} from "@/shared/types";

export const useCreateProductOrigin = () => {
  const { createEntity, isLoading, error, isError } = useCreateEntity<
    ICreateProductColorRequest,
    IProductColorResponse
  >(useCreateProductColorMutation);

  return { createProductOrigin: createEntity, isLoading, error, isError };
};
