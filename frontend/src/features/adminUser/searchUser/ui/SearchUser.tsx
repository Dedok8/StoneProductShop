import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSearchUser } from "@/features/adminUser/searchUser/model";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function SearchUser() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const { user, isLoading, isFetching, isError, error } = useSearchUser(query);

  if (isLoading || isFetching) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by email or user ID"
      />

      {isError && (
        <p>
          Error:{" "}
          {error && "status" in error
            ? String(error.status)
            : "Failed to fetch user"}
        </p>
      )}

      {user && (
        <div>
          <p>ID: {user.id}</p>
          <p>Name: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <p>Created: {new Date(user.createdAt).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
}

export default SearchUser;
