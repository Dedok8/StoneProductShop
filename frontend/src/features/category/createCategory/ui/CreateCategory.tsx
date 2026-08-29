import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

import {
  useCreateCategory,
  useCreateCategoryForm,
} from "@/features/category/createCategory/model";
import { slugify } from "@/shared";
import type { ICreateCategoryRequest } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function CreateCategory() {
  const { createCategory, isLoading, error, isError } = useCreateCategory();
  const { register, handleSubmit, errors, watch, setValue,  } =
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

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register("name")} placeholder={t("category.name")} />
      {errors.name && <span>{errors.name.message}</span>}

      <div>
        <Input
          {...slugRegister}
          placeholder={t("category.slug")}
          onChange={(e) => {
            setIsSlugTouched(true);
            slugRegister.onChange(e);
          }}
        />
        {isSlugTouched && (
          <button type="button" onClick={handleResetSlug}>
            {t("category.resetSlug")}
          </button>
        )}
      </div>
      {errors.slug && <span>{errors.slug.message}</span>}

      {isError && <div>{getApiErrorMessage(error, t)}</div>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("commandIcon.loading") : t("admin.createCategory")}
      </Button>
    </form>
  );
}

export default CreateCategory;
