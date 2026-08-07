import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFindCategoryById } from "@/features/category/findCategoryById";
import { useUpdateCategory } from "@/features/category/updateCategory/model";
import type { ICategoryResponse } from "@/shared";

function UpdateCategory() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { category, isLoading: isCategoryLoading } = useFindCategoryById(id);

  if (isCategoryLoading || !category) return <div>{t("common.loading")}</div>;

  return <UpdateCategoryForm category={category} />;
}

function UpdateCategoryForm({ category }: { category: ICategoryResponse }) {
  const { updateCategory, isLoading, error, isError } = useUpdateCategory();
  const { t } = useTranslation();

  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [isActive, setIsActive] = useState<boolean>(category.isActive);

  const isChanged =
    name !== category.name ||
    slug !== category.slug ||
    isActive !== category.isActive;

  const handleUpdateCategory: React.SubmitEventHandler<
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();

    if (!isChanged) return;

    const changes: Partial<{
      name: string;
      slug: string;
      isActive: boolean;
    }> = {};

    if (name !== category.name) changes.name = name;
    if (slug !== category.slug) changes.slug = slug;
    if (isActive !== category.isActive) changes.isActive = isActive;

    try {
      await updateCategory(category.id, changes);
    } catch (e) {
      //
    }
  };

  return (
    <form onSubmit={handleUpdateCategory}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <input value={slug} onChange={(e) => setSlug(e.target.value)} />
      <input
        type="checkbox"
        checked={isActive}
        onChange={(e) => setIsActive(e.target.checked)}
      />
      <button type="submit" disabled={!isChanged || isLoading}>
        {t("save")}
      </button>
      {isError && <p>{error?.toString()}</p>}
    </form>
  );
}

export default UpdateCategory;
