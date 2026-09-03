import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import AddToCartItem from "@/features/cart/addCartItem/ui/AddToCartItem";
import DeleteProduct from "@/features/product/deleteProduct/ui/DeleteProduct";
import { useGetAllProduct } from "@/features/product/getAllProduct/model";
import { FRONT_ROUTES, useUser } from "@/shared";
import type { IGetProductsQuery } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

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

  const { products, meta, isLoading, error, isError, isFetching, refetch } =
    useGetAllProduct(query);
  const user = useUser();

  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-stone-50">
        <div className="flex items-center gap-3 text-stone-500">
          <span className="size-4 animate-spin rounded-full border-2 border-stone-300 border-t-emerald-700" />
          <span className="text-sm tracking-wide">{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
        <p className="text-sm font-medium text-red-700">
          {getApiErrorMessage(error, t)}
        </p>
        <button
          onClick={() => refetch()}
          className="rounded-md border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:border-stone-400 hover:bg-stone-100"
        >
          {t("common.refresh")}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex-1">
            <Input
              type="text"
              value={query.search}
              onChange={(e) =>
                setQuery((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
              placeholder={t("product.searchPlaceholder")}
              className="h-11 w-full max-w-sm rounded-md border border-stone-300 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <select
                value={query.sortBy}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    sortBy: e.target.value as IGetProductsQuery["sortBy"],
                  }))
                }
                className="h-11 appearance-none rounded-md border border-stone-300 bg-white pl-3 pr-9 text-sm text-stone-700 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="createdAt">
                  {t("product.sortByCreatedAt")}
                </option>
                <option value="name">{t("product.sortByName")}</option>
                <option value="price">{t("product.sortByPrice")}</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d="M1 1.5 6 6.5 11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="relative">
              <select
                value={query.sortOrder}
                onChange={(e) =>
                  setQuery((prev) => ({
                    ...prev,
                    sortOrder: e.target.value as IGetProductsQuery["sortOrder"],
                  }))
                }
                className="h-11 appearance-none rounded-md border border-stone-300 bg-white pl-3 pr-9 text-sm text-stone-700 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="asc">{t("common.asc")}</option>
                <option value="desc">{t("common.desc")}</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-stone-400"
                viewBox="0 0 12 8"
                fill="none"
              >
                <path
                  d="M1 1.5 6 6.5 11 1.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );
}

export default GetAllProduct;
