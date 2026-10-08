import { useUpdateProductColorMutation } from "@/entities";
import { useUpdateEntity } from "@/shared/hooks/RTK";
import type {
  IProductColorResponse,
  IUpdateProductColorRequest,
} from "@/shared/types";

export const useUpdateProductColor = () => {
  const { updateEntity, isLoading, error, isError } = useUpdateEntity<
    { id: string; body: IUpdateProductColorRequest },
    IProductColorResponse
  >(useUpdateProductColorMutation);

  return { updateProductColor: updateEntity, isLoading, error, isError };
};
