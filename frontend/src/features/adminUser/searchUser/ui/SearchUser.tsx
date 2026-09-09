import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSearchUser } from "@/features/adminUser/searchUser/model";
import { useQueryState } from "@/shared";
import type { IUserResponse } from "@/shared/types";
import { Input } from "@/shared/ui/components/input";

interface SearchUserProps {
  onSelectUser: (user: IUserResponse) => void;
}

function SearchUser({ onSelectUser }: SearchUserProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");

  const { users, isLoading, isFetching, isError, error, hasQuery } =
    useSearchUser(query);

  const queryState = useQueryState(isLoading, isError, error);

  const handleSelect = (user: IUserResponse) => {
    onSelectUser(user);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-sm">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("admin.searchPlaceholder", "Search by name or email")}
      />

      {hasQuery && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-md">
          {(isLoading || isFetching) && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t("common.loading")}
            </p>
          )}

          {queryState}

          {!isLoading && !isFetching && !isError && users.length === 0 && (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t("admin.noUsersFound", "No users found")}
            </p>
          )}

          {users.length > 0 && (
            <ul className="max-h-64 overflow-auto">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(u)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {u.name} — {u.email}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchUser;
