import { useTranslation } from "react-i18next";

import {
  useCreateCategory,
  useCreateCategoryForm,
} from "@/features/category/createCategory/model";
import type { ICreateCategoryRequest } from "@/shared";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function CreateCategory() {
  const { createCategory, isLoading, error, isError } = useCreateCategory();
  const { register, handleSubmit, errors } = useCreateCategoryForm();
  const { t } = useTranslation();

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

      <Input {...register("slug")} placeholder={t("category.slug")} />
      {errors.slug && <span>{errors.slug.message}</span>}

      {isError && <div>{getApiErrorMessage(error, t)}</div>}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? t("commandIcon.loading") : t("admin.createCategory")}
      </Button>
    </form>
  );
}

export default CreateCategory;
