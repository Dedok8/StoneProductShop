import { useTranslation } from "react-i18next";

import { useSearchCategory } from "@/features/category/searchCategory/model";
import type { ICategoryResponse } from "@/shared/types";
import Search from "@/shared/ui/search/Search";
interface ISearchCategoryProps {
  value: string;
  onChange: (value: string) => void;
}
function SearchCategory({ value, onChange }: ISearchCategoryProps) {
  const { t } = useTranslation();

  const { categories, isLoading, error, isError, isFetching } =
    useSearchCategory(value);

  return (
    <Search<ICategoryResponse>
      value={value}
      onChange={onChange}
      onSelect={(category) => onChange(category.id)}
      items={categories ? [categories] : []}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      error={error}
      hasQuery={value.trim().length > 0}
      getKey={(category) => category.id}
      renderItem={(item) => (
        <>
          <span className="font-medium text-stone-900">{item.name}</span>
          <span className="text-xs text-stone-400">{item.slug}</span>
          <span className="text-xs text-stone-400">{item.isActive}</span>
        </>
      )}
      placeholder={t("category.searchPlaceholder", "Search by name or slug")}
      emptyText={t("category.noCategoryFound")}
    />
  );
}

export default SearchCategory;
