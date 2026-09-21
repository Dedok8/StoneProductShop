import { useSearchCategoryQuery } from "@/entities";
import { useDebouncedValue } from "@/shared";

const DEBOUNCE_MS = 350;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const useSearchCategory = (query?: string) => {
  const debouncedValue = useDebouncedValue(query ?? "", DEBOUNCE_MS).trim();

  const isSlug = !!debouncedValue && SLUG_REGEX.test(debouncedValue);

  const searchParams = isSlug
    ? { slug: debouncedValue }
    : { name: debouncedValue };

  const result = useSearchCategoryQuery(searchParams, {
    skip: !debouncedValue,
  });

  return {
    categories: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    isError: result.isError,
    error: result.error,
  };
};
