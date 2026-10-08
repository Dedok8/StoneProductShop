import { FolderOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import AddToCartItem from "@/features/cart/addCartItem/ui/AddToCartItem";
import { useGetAllCategory } from "@/features/category/getAllCategory";
import DeleteProduct from "@/features/product/deleteProduct/ui/DeleteProduct";
import { useGetAllProduct } from "@/features/product/getAllProduct/model";
import { useSearchProduct } from "@/features/product/searchProduct/model";
import SearchProduct from "@/features/product/searchProduct/ui/SearchProduct";
import { useGetAllProductColor } from "@/features/productColor/getAllProductColor/model";
import { useGetAllProductOrigin } from "@/features/productOrigin/getAllProductOrigin/model";
import { useGetAllProductType } from "@/features/productType/getAllProductType/model";
import { FRONT_ROUTES, useQueryState, useUser } from "@/shared";
import type { IGetProductsQuery, IProductResponse } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import { Card, CardContent } from "@/shared/ui/components/card";
import EmptyComp from "@/shared/ui/getAll/EmptyComp";
import EntityGridMap from "@/shared/ui/getAll/EntityGridMap";
import Pagination from "@/shared/ui/pagination";
import ProductAsideFilter from "@/shared/ui/productAsideFilter/ProductAsideFilter";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function isProductActive(item: IProductResponse) {
  return item.isActive && item.category.isActive !== false;
}

function GetAllProduct() {
  const [query, setQuery] = useState<IGetProductsQuery>({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "asc",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const isSearching = searchTerm.trim().length >= 2;

  const {
    products: rankedProducts,
    isLoading: isSearchLoading,
    isError: isSearchErrorState,
    error: searchError,
  } = useSearchProduct(searchTerm);

  const {
    products: listProducts,
    meta,
    isLoading,
    error,
    isError,
  } = useGetAllProduct(query);

  const user = useUser();
  const { t } = useTranslation();

  const products = isSearching ? rankedProducts : listProducts;

  const sortedProducts = useMemo(() => {
    return [...products].sort(
      (a, b) => Number(isProductActive(b)) - Number(isProductActive(a))
    );
  }, [products]);

  const queryState = useQueryState(
    isSearching ? isSearchLoading : isLoading,
    isSearching ? isSearchErrorState : isError,
    isSearching ? searchError : error
  );

  const { categories } = useGetAllCategory();
  const { productType } = useGetAllProductType();

  const { productOrigin } = useGetAllProductOrigin();
  const { productColor } = useGetAllProductColor();

  const handleSelectId = (
    field: "productTypeId" | "originId" | "colorId" | "categoryId",
    id: string
  ) => {
    setQuery((prev) => ({
      ...prev,
      [field]: prev[field] === id ? undefined : id,
      page: 1,
    }));
  };

  return (
    <Card>
      <CardContent>
        <ProductAsideFilter
          category={categories}
          categoryId={query.categoryId}
          onSelectCategoryId={(id) => handleSelectId("categoryId", id)}
          productType={productType}
          productTypeId={query.productTypeId}
          onSelectProductTypeId={(id) => handleSelectId("productTypeId", id)}
          productColor={productColor}
          productColorId={query.colorId}
          onSelectProductColorId={(id) => handleSelectId("colorId", id)}
          productOrigin={productOrigin}
          productOriginId={query.originId}
          onSelectProductOriginId={(id) => handleSelectId("originId", id)}
        />
        <SearchProduct value={searchTerm} onChange={setSearchTerm} />

        {sortedProducts.length === 0 ? (
          <EmptyComp icon={FolderOpen} message={t("product.notFound")} />
        ) : (
          <EntityGridMap
            items={sortedProducts}
            getKey={(prod) => prod.id}
            renderItem={(item) => {
              const isCardActive = isProductActive(item);

              const sortedProduct = [
                ...(item.images ?? []).sort((a, b) => a.order - b.order),
              ];

              const mainImage = sortedProduct[0];

              return (
                <div
                  className={`group relative flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md hover:shadow-stone-200/60 ${
                    !isCardActive ? "opacity-60 grayscale" : ""
                  }`}
                >
                  <div className="relative aspect-square overflow-hidden bg-stone-100">
                    {mainImage ? (
                      <img
                        src={mainImage.url}
                        alt={mainImage.alt}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-stone-400">
                        {t("product.noImage")}
                      </div>
                    )}

                    {!isCardActive && (
                      <span className="absolute right-3 top-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-white">
                        {t("product.inactive")}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <p className="text-sm font-medium leading-snug text-stone-900">
                      {item.name}
                    </p>

                    <div className="mt-auto flex items-baseline gap-2 pt-2">
                      <span className="text-base font-semibold tracking-tight text-stone-900">
                        {formatPrice(item.price)}
                      </span>
                    </div>

                    <p className="text-sm font-medium leading-snug text-stone-900">
                      {t("product.slug")} - {item.productType?.slug}
                    </p>

                    <p className="text-sm font-medium leading-snug text-stone-900">
                      {t("product.origin")} - {item.origin?.name}
                    </p>

                    <p className="text-sm font-medium leading-snug text-stone-900">
                      {t("product.color")} - {item.color?.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          item.stock > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-100 text-stone-500"
                        }`}
                      >
                        {item.stock > 0
                          ? t("product.inStock")
                          : t("product.outOfStock")}
                      </span>

                      {item.category?.isActive === false && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800">
                          {t("category.inactive")}
                        </span>
                      )}
                    </div>
                  </div>

                  {user?.role === "ADMIN" && (
                    <>
                      <DeleteProduct prodId={item.id} />
                      <Link to={FRONT_ROUTES.pages.UpdateProduct.path(item.id)}>
                        <Button>{t("common.edit")}</Button>
                      </Link>
                    </>
                  )}

                  <AddToCartItem productId={item.id} disabled={!isCardActive} />
                </div>
              );
            }}
          />
        )}
      </CardContent>

      {queryState}

      {!isSearching && meta && meta.totalPages > 1 && (
        <Pagination
          page={query.page ?? 1}
          totalPages={meta.totalPages}
          onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
        />
      )}
    </Card>
  );
}

export default GetAllProduct;
