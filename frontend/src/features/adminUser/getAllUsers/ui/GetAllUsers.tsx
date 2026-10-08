import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DeleteUser } from "@/features/adminUser/deleteUser";
import { useGetAllUsers } from "@/features/adminUser/getAllUsers/model";
import { useSearchUser } from "@/features/adminUser/searchUser";
import SearchUser from "@/features/adminUser/searchUser/ui/SearchUser";
import UpdateUserRole from "@/features/adminUser/updateUserRole/ui/UpdateUserRole";
import { useQueryState } from "@/shared";
import { type IGetUsersQuery } from "@/shared/types";

const GRID_COLS = "grid-cols-[2fr_2fr_1fr_1.5fr]";

function GetAllUsers() {
  const [query, setQuery] = useState<IGetUsersQuery>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "asc",
  });

  const [searchTerm, setSearchTerm] = useState("");

  const isSearching = searchTerm.trim().length >= 2;
  const {
    users: rankedUsers,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isError: isSearchErrorState,
    error: searchError,
  } = useSearchUser(searchTerm);
  const {
    users: listUsers,
    meta,
    isLoading,
    error,
    isError,
    isFetching,
    refetch,
  } = useGetAllUsers(query);
  const { t } = useTranslation();

  const queryState = useQueryState(
    isSearching ? isSearchLoading : isLoading,
    isSearching ? isSearchErrorState : isError,
    isSearching ? searchError : error
  );
  const users = isSearching ? rankedUsers : listUsers;

  const fetching = isSearching ? isSearchFetching : isFetching;
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <SearchUser value={searchTerm} onChange={setSearchTerm} />

        {fetching && (
          <p className="mb-4 text-xs font-medium uppercase tracking-wider text-stone-400">
            {t("common.updating")}
          </p>
        )}

        <button
          onClick={refetch}
          disabled={isFetching}
          className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
          />
          {t("common.refresh")}
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div
          className={`grid ${GRID_COLS} gap-4 border-b bg-muted/50 px-4 py-3 text-left text-sm font-medium text-muted-foreground`}
        >
          <div>{t("user.name")}</div>
          <div>{t("user.email")}</div>
          <div>{t("user.role")}</div>
          <div>{t("common.actions")}</div>
        </div>

        {/* <div className="divide-y">
          {selectedUser && (
            <div className="bg-primary/5">
              <div
                className={`grid ${GRID_COLS} items-center gap-4 px-4 py-3 text-sm`}
              >
                <div className="font-medium text-foreground">
                  {selectedUser.name}
                </div>
                <div className="truncate text-muted-foreground">
                  {selectedUser.email}
                </div>
                <div>
                  <UpdateUserRole
                    userId={selectedUser.id}
                    currentRole={selectedUser.role}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <DeleteUser userId={selectedUser.id} />
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {t("common.close", "Close")}
                  </button>
                </div>
              </div>
              <div className="px-4 pb-3 text-xs text-muted-foreground">
                ID: {selectedUser.id} · {t("admin.createdAt", "Created")}:{" "}
                {selectedUser.createdAt}
              </div>
            </div>
          )}
              </div> */}

        {users.map((user) => (
          <div
            key={user.id}
            className={`grid ${GRID_COLS} items-center gap-4 px-4 py-3 text-sm transition-colors hover:bg-muted/40`}
          >
            <div className="font-medium text-foreground">{user.name}</div>
            <div className="truncate text-muted-foreground">{user.email}</div>
            <div>
              <UpdateUserRole userId={user.id} currentRole={user.role} />
            </div>
            <div className="flex items-center gap-3">
              <DeleteUser userId={user.id} />
            </div>
          </div>
        ))}

        {users?.length === 0 && (
          <div className="py-10 text-center text-sm text-muted-foreground">
            {t("common.noResults")}
          </div>
        )}
      </div>

      {meta && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("admin.page")} {meta.page} {t("admin.of")} {meta.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={meta.page <= 1}
              onClick={() =>
                setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))
              }
              className="rounded-md border border-input px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              {t("common.back")}
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))
              }
              className="rounded-md border border-input px-3 py-1.5 font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}

      {queryState}
    </div>
  );
}

export default GetAllUsers;
