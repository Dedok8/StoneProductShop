import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSearchProduct } from "@/features/product/searchProduct/model";
import { useQueryState } from "@/shared";
import type { IProductResponse } from "@/shared/types";
import { Input } from "@/shared/ui/components/input";

interface ISearchProductProps {
  onSelectProduct: (product: IProductResponse) => void;
}

function SearchProduct({ onSelectProduct }: ISearchProductProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const { products, isLoading, isFetching, isError, error, hasQuery } =
    useSearchProduct(query);

  const queryState = useQueryState(isLoading, isError, error);

  const handleSearch = (product: IProductResponse) => {
    onSelectProduct(product);
    setQuery("");
  };

  return (
    <div className="relative mb-8">
      <Input
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        placeholder={t(
          "product.searchPlaceholder",
          "Search by name or slug/price"
        )}
        className="w-full max-w-md"
      />

      {hasQuery && (
        <div className="absolute z-20 mt-1 w-full max-w-md overflow-hidden rounded-lg border border-stone-200 bg-white shadow-lg">
          {(isLoading || isFetching) && (
            <p className="px-3 py-2 text-sm text-stone-400">
              {t("common.loading")}
            </p>
          )}

          {queryState}

          {!isLoading && !isFetching && !isError && products.length === 0 && (
            <p className="px-3 py-2 text-sm text-stone-400">
              {t("product.noProductsFound", "No product found")}
            </p>
          )}

          {products.length > 0 && (
            <ul className="max-h-72 divide-y divide-stone-100 overflow-y-auto">
              {products.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    onClick={() => handleSearch(product)}
                    className="flex w-full flex-col items-start px-3 py-2 text-left text-sm transition-colors hover:bg-stone-50"
                  >
                    <span className="font-medium text-stone-900">
                      {product.name}
                    </span>
                    <span className="text-xs text-stone-400">
                      {product.slug}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchProduct;
