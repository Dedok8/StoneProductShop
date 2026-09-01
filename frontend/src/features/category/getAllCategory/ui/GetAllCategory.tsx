import { RefreshCw, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import DeleteCategory from "@/features/category/deleteCategory/ui/DeleteCategory";
import { useGetAllCategory } from "@/features/category/getAllCategory/model";
import { FRONT_ROUTES, useUser } from "@/shared";
import { Button } from "@/shared/ui/components/button";
import { getApiErrorMessage } from "@/shared/ui/Error";

function GetAllCategory() {
  const { categories, isLoading, error, isError, refetch } =
    useGetAllCategory();
  const user = useUser();
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
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {t("category.title", "Categories")}
        </h2>
        <button
          onClick={refetch}
          className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          {t("common.refresh")}
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
          <FolderOpen className="h-8 w-8" />
          <p>{t("category.notFound")}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex flex-col gap-1 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
            >
              <h3 className="font-medium text-foreground">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.slug}</p>
              {user?.role === "ADMIN" && (
                <>
                  <DeleteCategory categoryId={category.id} />
                  <Link
                    to={FRONT_ROUTES.pages.UpdateCategory.path(category.id)}
                  >
                    <Button>{t("common.edit")}</Button>
                  </Link>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default GetAllCategory;
