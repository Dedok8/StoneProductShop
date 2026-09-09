import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateCategory,
  useCreateCategoryForm,
} from "@/features/category/createCategory/model";
import { slugify, useQueryState } from "@/shared";
import type { ICreateCategoryRequest } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";

function CreateCategory() {
  const { createCategory, isLoading, error, isError } = useCreateCategory();
  const { register, handleSubmit, errors, watch, setValue } =
    useCreateCategoryForm();
  const { t } = useTranslation();

  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const nameValue = watch("name");
  const slugRegister = register("slug");

  useEffect(() => {
    if (!isSlugTouched) {
      setValue("slug", slugify(nameValue || ""), { shouldValidate: true });
    }
  }, [nameValue, isSlugTouched, setValue]);

  const handleResetSlug = () => {
    setIsSlugTouched(false);
    setValue("slug", slugify(nameValue || ""), { shouldValidate: true });
  };

  const onSubmit = async (value: ICreateCategoryRequest) => {
    try {
      await createCategory(value);
    } catch (e) {
      //
    }
  };
  const queryState = useQueryState(isLoading, isError, error);
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-md flex-col gap-4 rounded-xl border bg-card p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-foreground">
        {t("admin.createCategory")}
      </h2>

      <div className="flex flex-col gap-1.5">
        <Input {...register("name")} placeholder={t("category.name")} />
        {errors.name && (
          <span className="text-sm text-destructive">
            {errors.name.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Input
            {...slugRegister}
            placeholder={t("category.slug")}
            onChange={(e) => {
              setIsSlugTouched(true);
              slugRegister.onChange(e);
            }}
            className="flex-1"
          />
          {isSlugTouched && (
            <button
              type="button"
              onClick={handleResetSlug}
              className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
            >
              {t("category.resetSlug")}
            </button>
          )}
        </div>
        {errors.slug && (
          <span className="text-sm text-destructive">
            {errors.slug.message}
          </span>
        )}
      </div>

      {queryState}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("common.loading") : t("admin.createCategory")}
      </Button>
    </form>
  );
}

export default CreateCategory;
