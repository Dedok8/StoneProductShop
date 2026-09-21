import { useState } from "react";

import { useFindProductColorById } from "@/features/productColor/findProductColorById/model";
import { useQueryState } from "@/shared";
import { CardContent } from "@/shared/ui/components/card";
import { Input } from "@/shared/ui/components/input";

function FindProductColorById() {
  const [query, setQuery] = useState("");
  const { productColor, isLoading, error, isError, isFetching } =
    useFindProductColorById(query);

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <CardContent>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        type="text"
        placeholder="Search by product color ID"
      />
      {productColor && (
        <div>
          <p>id: {productColor.id}</p>
          <p> name: {productColor.name}</p>
          <p> hex?: {productColor?.hex}</p>
          <p> createdAt: {productColor.createdAt}</p>
          <p> updatedAt: {new Date(productColor.updatedAt).toLocaleString()}</p>
        </div>
      )}

      {queryState}
    </CardContent>
  );
}

export default FindProductColorById;
