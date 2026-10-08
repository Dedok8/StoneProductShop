import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useSearchUser } from "@/features/adminUser/searchUser/model";
import { useQueryState } from "@/shared";
import type { IUserResponse } from "@/shared/types";
import { Input } from "@/shared/ui/components/input";

interface ISearchUserProps {
  value: string;
  onChange: (value: string) => void;
}

function SearchUser({ value, onChange }: ISearchUserProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { users, isLoading, isFetching, isError, error, hasQuery } =
    useSearchUser(value);

  const queryState = useQueryState(isLoading, isError, error);

  const handleSearch = (user: IUserResponse) => {
    onChange(user.name);
    setIsOpen(false);
  };

  const showDropdown = isOpen && hasQuery;
  return (
    <div className="relative w-full max-w-sm">
      <Input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          setTimeout(() => setIsOpen(false), 150);
        }}
        placeholder={t("admin.searchPlaceholder", "Search by name or email")}
      />

      {showDropdown && (
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
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSearch(user)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    {user.name} — {user.email}
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
