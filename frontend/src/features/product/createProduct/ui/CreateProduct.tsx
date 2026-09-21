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
import { useSlugField } from "@/shared/hooks/useSlugField";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";

function CreateProduct() {
  const { createProduct, isLoading, error, isError } = useCreateProduct();
  const { categories, isLoading: isCategoriesLoading } = useGetAllCategory();
  const { inspirations, isLoading: isInspirationsLoading } =
    useGetAllInspiration();
  const { register, handleSubmit, errors, control, watch, setValue } =
    useCreateProductForm();
  const { t } = useTranslation();
  const user = useUser();

  const nameValue = watch("name");
  const slugRegister = register("slug");

  const { isSlugTouched, onSlugChange, resetSlug } = useSlugField(
    nameValue,
    setValue,
    "slug"
  );

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

      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{t("product.name")}</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.slug}>
          <FieldLabel htmlFor="slug">{t("product.slug")}</FieldLabel>
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
                {t("common.resetSlug")}
              </button>
            )}
          </div>
          {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.price}>
          <FieldLabel htmlFor="price">{t("product.price")}</FieldLabel>
          <Input
            id="price"
            type="number"
            step="0.01"
            aria-invalid={!!errors.price}
            {...register("price")}
          />
          {errors.price && <FieldError>{errors.price.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.stock}>
          <FieldLabel htmlFor="stock">{t("product.stock")}</FieldLabel>
          <Input
            id="stock"
            type="number"
            aria-invalid={!!errors.stock}
            {...register("stock")}
          />
          {errors.stock && <FieldError>{errors.stock.message}</FieldError>}
        </Field>
      </FieldGroup>

      <Field data-invalid={!!errors.description}>
        <FieldLabel htmlFor="description">
          {t("product.description")}
        </FieldLabel>
        <textarea
          id="description"
          rows={4}
          aria-invalid={!!errors.description}
          {...register("description")}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        {errors.description && (
          <FieldError>{errors.description.message}</FieldError>
        )}
      </Field>

      <Field data-invalid={!!errors.categoryId}>
        <FieldLabel htmlFor="categoryId">{t("product.category")}</FieldLabel>
        <select
          id="categoryId"
          disabled={isCategoriesLoading}
          defaultValue=""
          aria-invalid={!!errors.categoryId}
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
        {errors.categoryId && (
          <FieldError>{errors.categoryId.message}</FieldError>
        )}
      </Field>

      <Field data-invalid={!!errors.images}>
        <FieldLabel>{t("product.images")}</FieldLabel>
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
        {errors.images && <FieldError>{errors.images.message}</FieldError>}
      </Field>

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
