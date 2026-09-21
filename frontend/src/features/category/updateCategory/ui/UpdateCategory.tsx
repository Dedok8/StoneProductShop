import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFindCategoryById } from "@/features/category/findCategoryById";
import { useUpdateCategory } from "@/features/category/updateCategory/model";
import { useChangeTracking, useQueryState } from "@/shared";
import type { ICategoryResponse } from "@/shared/types";
import { Field } from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";
import FormerrorState from "@/shared/ui/form-parts/FormErrorState";
import FormShell from "@/shared/ui/form-parts/FormShell";
import SubmitButton from "@/shared/ui/form-parts/SubmitButton";

function UpdateCategory() {
  const { id } = useParams<{ id: string }>();

  const {
    category,
    isLoading: isCategoryLoading,
    isError: isCategoryError,
    error: categoryError,
  } = useFindCategoryById(id);

  const queryState = useQueryState(
    isCategoryLoading,
    isCategoryError,
    categoryError
  );

  if (queryState) return queryState;
  if (!category) return null;

  return <UpdateCategoryForm category={category} />;
}

function UpdateCategoryForm({ category }: { category: ICategoryResponse }) {
  const { updateCategory, isLoading, error, isError } = useUpdateCategory();
  const { t } = useTranslation();

  const { state, setField, changes, isChanged } = useChangeTracking({
    name: category.name,
    slug: category.slug,
    isActive: category.isActive,
  });

  const handleUpdateCategory: React.SubmitEventHandler<
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();

    try {
      await updateCategory(category.id, changes);
    } catch (e) {
      //
    }
  };

  return (
    <FormShell
      title={t("category.editTitle")}
      isActive={state.isActive}
      onActiveChange={(v) => setField("isActive", v)}
      activeLabel={t("category.active")}
    >
      <form onSubmit={handleUpdateCategory} className="flex flex-col gap-5">
        <Field aria-label={t("category.name")}>
          <Input
            value={state.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </Field>
        <Field aria-label={t("category.slug")}>
          <Input
            value={state.slug}
            onChange={(e) => setField("slug", e.target.value)}
          />
        </Field>
        <FormerrorState isError={isError} error={error} />
        <SubmitButton
          disabled={!isChanged || isLoading}
          isLoading={isLoading}
          label={t("save")}
        />
      </form>
    </FormShell>
  );
}

export default UpdateCategory;
