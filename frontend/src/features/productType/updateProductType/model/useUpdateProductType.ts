import { useUpdateEntity } from "@/shared/hooks/RTK";
import type {
  IProductTypeResponse,
  IUpdateProductTypeRequest,
} from "@/shared/types";

export const useUpdateProductType = () => {
  const { updateEntity, isLoading, isError, error } = useUpdateEntity<
    { id: string; body: IUpdateProductTypeRequest },
    IProductTypeResponse
  >(useUpdateProductType);

  return { updateProductType: updateEntity, isLoading, isError, error };
};
