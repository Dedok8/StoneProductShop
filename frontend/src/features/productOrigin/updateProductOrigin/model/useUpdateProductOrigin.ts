import { useUpdateProductOriginMutation } from "@/entities/productOrigin/api/productOriginApi";
import { useUpdateEntity } from "@/shared/hooks/RTK";
import type {
  IProductOriginResponse,
  IUpdateProductOriginRequest,
} from "@/shared/types";

export const useUpdateProductOrigin = () => {
  const { updateEntity, isLoading, isError, error } = useUpdateEntity<
    { id: string; body: IUpdateProductOriginRequest },
    IProductOriginResponse
  >(useUpdateProductOriginMutation);

  return { updateProductOrigin: updateEntity, isLoading, isError, error };
};
