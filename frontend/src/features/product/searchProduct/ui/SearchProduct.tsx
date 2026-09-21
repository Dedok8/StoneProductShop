import { useTranslation } from "react-i18next";

import { useSearchProduct } from "@/features/product/searchProduct/model";
import type { IProductResponse } from "@/shared/types";
import Search from "@/shared/ui/search/Search";

interface ISearchProductProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchProduct({ value, onChange }: ISearchProductProps) {
  const { t } = useTranslation();
  const { products, isLoading, isFetching, isError, error, hasQuery } =
    useSearchProduct(value);

  return (
    <Search<IProductResponse>
      value={value}
      onChange={onChange}
      onSelect={(products) => onChange(products.id)}
      items={products ?? []}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      error={error}
      hasQuery={hasQuery}
      getKey={(product) => product.id}
      renderItem={(item) => (
        <>
          <span className="font-medium text-stone-900">{item.name}</span>
          <span className="text-xs text-stone-400">{item.slug}</span>
        </>
      )}
      placeholder={t(
        "product.searchPlaceholder",
        "Search by name or slug/price"
      )}
      emptyText={t("product.noProductsFound")}
    />
  );
}

export default SearchProduct;
