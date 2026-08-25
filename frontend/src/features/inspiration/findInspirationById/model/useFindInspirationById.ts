import { useFindInspirationByIdQuery } from "@/entities";

export const useFindInspirationById = (inspirationId?: string) => {
  const { data, isLoading, error, isError, isFetching } =
    useFindInspirationByIdQuery(inspirationId ?? "", { skip: !inspirationId });

  return {
    inspiration: data,
    isLoading,
    error,
    isError,
    isFetching,
  };
};
