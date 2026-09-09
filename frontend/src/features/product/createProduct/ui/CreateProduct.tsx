import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useGetAllCategory } from "@/features/category/getAllCategory";
import { useGetAllInspiration } from "@/features/inspiration/getAllInspiration";
import {
  useCreateProduct,
  useCreateProductForm,
  type ProductFormValues,
} from "@/features/product/createProduct/model";
import { useQueryState, useUser } from "@/shared";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function CreateProduct() {
  const { createProduct, isLoading, error, isError } = useCreateProduct();
  const { categories, isLoading: isCategoriesLoading } = useGetAllCategory();
  const { inspirations, isLoading: isInspirationsLoading } =
    useGetAllInspiration();
  const { register, handleSubmit, errors, control } = useCreateProductForm();
  const { t } = useTranslation();
  const user = useUser();

  const onSubmit = async (value: ProductFormValues) => {
    try {
      await createProduct({ ...value, ownerId: user?.id });
    } catch (e) {
      console.error(e);
    }
  };
  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex max-w-2xl flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-foreground">
        {t("product.create")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("product.name")}
          htmlFor="name"
          error={errors.name?.message}
        >
          <Input id="name" {...register("name")} />
        </Field>

        <Field
          label={t("product.slug")}
          htmlFor="slug"
          error={errors.slug?.message}
        >
          <Input id="slug" {...register("slug")} />
        </Field>

        <Field
          label={t("product.price")}
          htmlFor="price"
          error={errors.price?.message}
        >
          <Input id="price" type="number" step="0.01" {...register("price")} />
        </Field>

        <Field
          label={t("product.stock")}
          htmlFor="stock"
          error={errors.stock?.message}
        >
          <Input id="stock" type="number" {...register("stock")} />
        </Field>
      </div>

      <Field
        label={t("product.description")}
        htmlFor="description"
        error={errors.description?.message}
      >
        <textarea
          id="description"
          rows={4}
          {...register("description")}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </Field>

      <Field
        label={t("product.category")}
        htmlFor="categoryId"
        error={errors.categoryId?.message}
      >
        <select
          id="categoryId"
          disabled={isCategoriesLoading}
          defaultValue=""
          {...register("categoryId")}
          className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="" disabled>
            {isCategoriesLoading
              ? t("common.loading", "Loading...")
              : t("product.selectCategory", "Select a category")}
          </option>
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-col gap-1.5">
        <Label>{t("product.images")}</Label>
        <Controller
          name="images"
          control={control}
          defaultValue={[]}
          render={({ field }) => {
            const selectedIds: string[] = field.value ?? [];

            const toggleImage = (id: string) => {
              const next = selectedIds.includes(id)
                ? selectedIds.filter((existingId) => existingId !== id)
                : [...selectedIds, id];
              field.onChange(next);
            };

            return (
              <div className="grid grid-cols-4 gap-2">
                {isInspirationsLoading && (
                  <p className="col-span-4 text-sm text-muted-foreground">
                    {t("common.loading", "Loading...")}
                  </p>
                )}

                {inspirations?.map((inspiration) => {
                  const isSelected = selectedIds.includes(inspiration.id);

                  return (
                    <button
                      key={inspiration.id}
                      type="button"
                      onClick={() => toggleImage(inspiration.id)}
                      className={`relative overflow-hidden rounded-lg border-2 transition-colors ${
                        isSelected
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <img
                        src={inspiration.imageUrl}
                        alt={inspiration.alt}
                        className="h-24 w-full object-cover"
                      />
                      {isSelected && (
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          }}
        />
        {errors.images && (
          <p className="text-sm text-destructive">{errors.images.message}</p>
        )}
      </div>

      {queryState}

      <button
        type="submit"
        disabled={isLoading}
        className="ml-auto rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
      >
        {t("product.create")}
      </button>
    </form>
  );
}

export default CreateProduct;
