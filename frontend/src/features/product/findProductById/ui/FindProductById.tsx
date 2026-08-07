import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useFindProductById } from "@/features/product/findProductById/model";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function FindProductById() {
  const [query, setQuery] = useState("");
  const { product, isLoading, error, isError, isFetching } =
    useFindProductById(query);

  const { t } = useTranslation();

  if (isLoading || isFetching) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by product ID"
      />

      {product && (
        <div>
          <p>ID: {product.id}</p>
          <p>Name: {product.name}</p>
          <p>Slug: {product.slug}</p>
          <p>Description: {product.description}</p>
          <p>Price: {product.price}</p>
          <p>Stock: {product.stock}</p>
          <p>Category ID: {product.categoryId}</p>
          <p>Active: {product.isActive ? t("common.yes") : t("common.no")}</p>
          <p>Created: {new Date(product.createdAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default FindProductById;
