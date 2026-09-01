import { RefreshCw, Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DeleteUser } from "@/features/adminUser/deleteUser";
import { useGetAllUsers } from "@/features/adminUser/getAllUsers/model";
import UpdateUserRole from "@/features/adminUser/updateUserRole/ui/UpdateUserRole";
import { type IGetUsersQuery } from "@/shared/types";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

const GRID_COLS = "grid-cols-[2fr_2fr_1fr_1.5fr]";

function GetAllUsers() {
  const [query, setQuery] = useState<IGetUsersQuery>({
    page: 1,
    limit: 20,
    sortBy: "createdAt",
    sortOrder: "asc",
  });
  const { users, meta, isLoading, error, isError, isFetching, refetch } =
    useGetAllUsers(query);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {getApiErrorMessage(error, t)}
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query.search ?? ""}
            onChange={(e) =>
              setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
            }
            placeholder={t("admin.searchByEmail")}
            className="pl-8"
          />
        </div>

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

        <div className="divide-y">
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
        </div>

        {users.length === 0 && (
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
    </div>
  );
}

export default GetAllUsers;
