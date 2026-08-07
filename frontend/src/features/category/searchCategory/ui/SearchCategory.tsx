import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSearchCategory } from "@/features/category/searchCategory/model";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function SearchCategory() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const { category, isLoading, error, isError, isFetching } =
    useSearchCategory(query);

  if (isLoading || isFetching) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or slug"
      />

      {isError && (
        <p>
          Error:{" "}
          {error && "status" in error
            ? String(error.status)
            : "Failed to fetch user"}
        </p>
      )}

      {category && (
        <div>
          <p>ID: {category.id}</p>
          <p>Name: {category.name}</p>
          <p>isActive: {category.isActive}</p>
          <p>Created: {new Date(category.createdAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default SearchCategory;
