import { useSearchCategoryQuery } from "@/entities";

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const useSearchCategory = (query?: string) => {
  const isSlug = !!query && SLUG_REGEX.test(query);

  const searchParams = isSlug ? { slug: query } : { name: query };

  const result = useSearchCategoryQuery(searchParams, {
    skip: !query,
  });

  return {
    category: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
  };
};
