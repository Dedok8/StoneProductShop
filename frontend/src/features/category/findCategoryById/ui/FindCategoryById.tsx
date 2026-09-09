import { useState } from "react";

import { useFindCategoryById } from "@/features/category/findCategoryById/model";
import { useQueryState } from "@/shared";
import { Input } from "@/shared/ui/components/input";

function FindCategoryById() {
  const [query, setQuery] = useState("");
  const { category, isLoading, error, isError } = useFindCategoryById(query);

  const queryState = useQueryState(isLoading, isError, error);
  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by category ID"
      />

      {queryState}

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
