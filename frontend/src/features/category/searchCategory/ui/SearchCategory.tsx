import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSearchCategory } from "@/features/category/searchCategory/model";
import { useQueryState } from "@/shared";
import { Input } from "@/shared/ui/components/input";

function SearchCategory() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const { category, isLoading, error, isError, isFetching } =
    useSearchCategory(query);

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or slug"
      />

      {queryState}

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
