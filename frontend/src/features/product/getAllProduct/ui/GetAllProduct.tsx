import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useGetAllProduct } from "@/features/product/getAllProduct/model";
import type { IGetProductsQuery } from "@/shared";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

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

  const { t } = useTranslation();

  if (isLoading) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <Input
        type="text"
        value={query.search}
        onChange={(e) =>
          setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))
        }
        placeholder={t("product.searchPlaceholder")}
      />

      <select
        value={query.sortBy}
        onChange={(e) =>
          setQuery((prev) => ({
            ...prev,
            sortBy: e.target.value as IGetProductsQuery["sortBy"],
          }))
        }
      >
        <option value="createdAt">{t("product.sortByCreatedAt")}</option>
        <option value="name">{t("product.sortByName")}</option>
        <option value="price">{t("product.sortByPrice")}</option>
      </select>

      <select
        value={query.sortOrder}
        onChange={(e) =>
          setQuery((prev) => ({
            ...prev,
            sortOrder: e.target.value as IGetProductsQuery["sortOrder"],
          }))
        }
      >
        <option value="asc">{t("common.asc")}</option>
        <option value="desc">{t("common.desc")}</option>
      </select>

      {isFetching && <div>{t("common.updating")}</div>}

      <ul>
        {products?.map((item) => (
          <li key={item.id}>
            <p>{item.name}</p>
            <p>{item.price}</p>
            <p>{item.isActive ? t("common.yes") : t("common.no")}</p>
          </li>
        ))}
      </ul>

      {meta && (
        <div>
          <button
            disabled={query.page === 1}
            onClick={() =>
              setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) - 1 }))
            }
          >
            {t("common.previous")}
          </button>

          <span>
            {query.page} / {meta.totalPages}
          </span>

          <button
            disabled={query.page === meta.totalPages}
            onClick={() =>
              setQuery((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }))
            }
          >
            {t("common.next")}
          </button>
        </div>
      )}

      <button onClick={() => refetch()}>{t("common.refresh")}</button>
    </div>
  );
}

export default GetAllProduct;
