import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFindCategoryById } from "@/features/category/findCategoryById";
import { useUpdateCategory } from "@/features/category/updateCategory/model";
import type { ICategoryResponse } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";

function UpdateCategory() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const { category, isLoading: isCategoryLoading } = useFindCategoryById(id);

  if (isCategoryLoading || !category) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

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
    <form
      onSubmit={handleUpdateCategory}
      className="mx-auto flex max-w-md flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold text-foreground">
          {t("category.editTitle", "Edit category")}
        </h2>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          {t("category.active", "Active")}
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">{t("category.name")}</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">{t("category.slug")}</Label>
        <Input
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
      </div>

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error?.toString()}
        </p>
      )}

      <Button
        type="submit"
        disabled={!isChanged || isLoading}
        className="ml-auto flex items-center gap-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {t("save")}
      </Button>
    </form>
  );
}

export default UpdateCategory;
