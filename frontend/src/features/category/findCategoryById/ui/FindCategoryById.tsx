import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useFindCategoryById } from "@/features/category/findCategoryById/model";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function FindCategoryById() {
  const [query, setQuery] = useState("");
  const { category, isLoading, error, isError, isFetching } =
    useFindCategoryById(query);
  const { t } = useTranslation();

  if (isLoading || isFetching) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by category ID"
      />

      {isError && (
        <p>
          Error:{""}
          {error && "status" in error
            ? String(error.status)
            : "Failed to fetch category"}
        </p>
      )}

      {category && (
        <div>
          <p>ID: {category.id}</p>
          <p>Name: {category.name}</p>
          <p>Email: {category.slug}</p>
          <p>Role: {category.isActive}</p>
          <p>Created: {new Date(category.createdAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default FindCategoryById;
