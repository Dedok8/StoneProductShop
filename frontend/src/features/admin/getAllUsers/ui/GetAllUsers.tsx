import { useState } from "react";
import { useTranslation } from "react-i18next";

import { DeleteUser } from "@/features/admin/deleteUser";
import { useGetAllUsers } from "@/features/admin/getAllUsers/model";
import { type IGetUsersQuery } from "@/shared";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

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

  if (isLoading) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <div>
        <button onClick={refetch} disabled={isFetching}>
          {isFetching ? t("common.loading") : t("common.refresh")}
        </button>
        <label>
          <Input
            value={query.search ?? ""}
            onChange={(e) =>
              setQuery((q) => ({ ...q, search: e.target.value, page: 1 }))
            }
            placeholder={t("admin.searchByEmail")}
          />
        </label>
      </div>
      <div>
        <div>
          <div>
            <div>{t("user.name")}</div>
            <div>{t("user.email")}</div>
            <div>{t("user.role")}</div>
            <div>{t("common.actions")}</div>
          </div>

          {users.map((user) => (
            <div key={user.id}>
              <div>{user.name}</div>
              <div>{user.email}</div>
              <div>{t(`role.${user.role}`)}</div>
              <div>
                <DeleteUser />
                {t("admin.changeRole")}
              </div>
            </div>
          ))}

          {users.length === 0 && <div>{t("common.noResults")}</div>}
        </div>
      </div>
      <div>
        {meta && (
          <div>
            {t("admin.page")} {meta.page} {t("admin.of")} {meta.totalPages}
            <button
              disabled={meta.page <= 1}
              onClick={() =>
                setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))
              }
            >
              {t("common.back")}
            </button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() =>
                setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))
              }
            >
              {t("common.next")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default GetAllUsers;
