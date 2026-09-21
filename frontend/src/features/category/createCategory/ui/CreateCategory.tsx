import { useTranslation } from "react-i18next";

import {
  useCreateCategory,
  useCreateCategoryForm,
} from "@/features/category/createCategory/model";
import { useQueryState } from "@/shared";
import { useSlugField } from "@/shared/hooks/useSlugField";
import type { ICreateCategoryRequest } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";

function CreateCategory() {
  const { createCategory, isLoading, error, isError } = useCreateCategory();
  const { register, handleSubmit, errors, watch, setValue } =
    useCreateCategoryForm();
  const { t } = useTranslation();

  const nameValue = watch("name");
  const slugRegister = register("slug");
  const { isSlugTouched, onSlugChange, resetSlug } = useSlugField(
    nameValue,
    setValue,
    "slug"
  );

  const onSubmit = async (value: ICreateCategoryRequest) => {
    try {
      await createCategory(value);
    } catch (e) {
      console.error(e);
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

      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{t("category.name")}</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="slug">{t("category.slug")}</FieldLabel>
          <div className="flex items-center gap-2">
            <Input
              id="slug"
              aria-invalid={!!errors.slug}
              {...slugRegister}
              onChange={(e) => {
                onSlugChange();
                slugRegister.onChange(e);
              }}
              className="flex-1"
            />
            {isSlugTouched && (
              <button
                type="button"
                onClick={resetSlug}
                className="whitespace-nowrap text-sm font-medium text-primary hover:underline"
              >
                {t("category.resetSlug")}
              </button>
            )}
          </div>
          {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
        </Field>
      </FieldGroup>

      {queryState}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("common.loading") : t("admin.createCategory")}
      </Button>
    </form>
  );
}

export default CreateCategory;
