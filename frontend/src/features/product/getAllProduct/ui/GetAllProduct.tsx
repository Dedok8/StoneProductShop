import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import AddToCartItem from "@/features/cart/addCartItem/ui/AddToCartItem";
import DeleteProduct from "@/features/product/deleteProduct/ui/DeleteProduct";
import { useGetAllProduct } from "@/features/product/getAllProduct/model";
import SearchProduct from "@/features/product/searchProduct/ui/SearchProduct";
import { FRONT_ROUTES, useQueryState, useUser } from "@/shared";
import type { IGetProductsQuery, IProductResponse } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";

const GRID_COLS = "grid-cols-[2fr_2fr_1fr_1.5fr]";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function GetAllProduct() {
  const [query, setQuery] = useState<IGetProductsQuery>({
    page: 1,
    limit: 20,
    search: "",
    sortBy: "createdAt",
    sortOrder: "asc",
  });

  const [selectedProduct, setSelectedProduct] =
    useState<IProductResponse | null>(null);

  const { products, meta, isLoading, error, isError, isFetching, refetch } =
    useGetAllProduct(query);
  const user = useUser();

  const { t } = useTranslation();

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SearchProduct onSelectProduct={setSelectedProduct} />
        {isFetching && (
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-400">
            {t("common.updating")}
          </p>
        )}

        {products?.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-24 text-center">
            <p className="text-sm text-stone-500">{t("product.emptyState")}</p>
          </div>
        )}

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products?.map((item) => {
            const isCardActive =
              item.isActive && item.category.isActive !== false;

            return (
              <li
                key={item.id}
                className={`group relative flex flex-col overflow-hidden rounded-lg border border-stone-200 bg-white transition-shadow hover:shadow-md hover:shadow-stone-200/60 ${
                  !isCardActive ? "opacity-60 grayscale" : ""
                }`}
              >
                <div className="relative aspect-square overflow-hidden bg-stone-100">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
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

                  <div className="border-t border-stone-100">
                    {selectedProduct?.id === item.id && (
                      <div className="space-y-3 bg-stone-50 p-4">
                        <div>
                          <p className="text-sm font-semibold text-stone-900">
                            {selectedProduct.name}
                          </p>
                          <p className="text-xs text-stone-500">
                            {selectedProduct.slug}
                          </p>
                        </div>

                        {/* {user?.role === "ADMIN" && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <UpdateProduct />
                              <DeleteProduct prodId={selectedProduct.id} />
                              <button
                                type="button"
                                onClick={() => setSelectedProduct(null)}
                                className="ml-auto text-xs text-stone-500 hover:text-stone-800 hover:underline"
                              >
                                {t("common.close", "Close")}
                              </button>
                            </div>
                            <p className="text-xs text-stone-400">
                              ID: {selectedProduct.id} ·{" "}
                              {t("admin.createdAt", "Created")}:{" "}
                              {selectedProduct.createdAt}
                            </p>
                          </div>
                        )} */}
                      </div>
                    )}
                  </div>

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

                    {/* <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        item.isActive
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      {item.isActive === false
                        ? t("category.active")
                        : t("category.unActive")}
                    </span> */}

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
              </li>
            );
          })}
        </ul>

        {meta && meta.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4 border-t border-stone-200 pt-6">
            <button
              disabled={query.page === 1}
              onClick={() =>
                setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
              }
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("common.previous")}
            </button>

            <span className="text-sm text-stone-500">
              {query.page} / {meta.totalPages}
            </span>

            <button
              disabled={query.page === meta.totalPages}
              onClick={() =>
                setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
              }
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("common.next")}
            </button>
          </div>
        )}

        {queryState}
      </div>
    </div>
  );
}

export default GetAllProduct;
