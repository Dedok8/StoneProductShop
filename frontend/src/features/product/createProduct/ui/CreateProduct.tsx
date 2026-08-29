import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useGetAllCategory } from "@/features/category/getAllCategory";
import { useGetAllInspiration } from "@/features/inspiration/getAllInspiration";
import {
  useCreateProduct,
  useCreateProductForm,
  type ProductFormValues,
} from "@/features/product/createProduct/model";
import { useUser } from "@/shared";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";

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
  const onError = (formErrors: typeof errors) => {
    console.log("VALIDATION ERRORS:", formErrors);
  };
  return (
    <form onSubmit={handleSubmit(onSubmit, onError)}>
      <div>
        <label htmlFor="name">{t("product.name")}</label>
        <Input id="name" {...register("name")} />
        {errors.name && <p>{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="slug">{t("product.slug")}</label>
        <Input id="slug" {...register("slug")} />
        {errors.slug && <p>{errors.slug.message}</p>}
      </div>

      <div>
        <label htmlFor="description">{t("product.description")}</label>
        <textarea id="description" {...register("description")} />
        {errors.description && <p>{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="price">{t("product.price")}</label>
        <Input id="price" type="number" step="0.01" {...register("price")} />
        {errors.price && <p>{errors.price.message}</p>}
      </div>

      <div>
        <label htmlFor="stock">{t("product.stock")}</label>
        <Input id="stock" type="number" {...register("stock")} />
        {errors.stock && <p>{errors.stock.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="categoryId">{t("product.category")}</Label>
        <select
          id="categoryId"
          disabled={isCategoriesLoading}
          className="border rounded-lg px-3 py-2 text-sm"
          defaultValue=""
          {...register("categoryId")}
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
        {errors.categoryId && <p>{errors.categoryId.message}</p>}
      </div>

      <div>
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
                  <p>{t("common.loading", "Loading...")}</p>
                )}

                {inspirations?.map((inspiration) => {
                  const isSelected = selectedIds.includes(inspiration.id);

                  return (
                    <button
                      key={inspiration.id}
                      type="button"
                      onClick={() => toggleImage(inspiration.id)}
                      className={`relative rounded-lg overflow-hidden border-2 transition ${
                        isSelected ? "border-blue-500" : "border-transparent"
                      }`}
                    >
                      <img
                        src={inspiration.imageUrl}
                        alt={inspiration.alt}
                        className="w-full h-24 object-cover"
                      />
                      {isSelected && (
                        <span className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
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
        {errors.images && <p>{errors.images.message}</p>}
      </div>

      {isError && <p>{error?.toString()}</p>}

      <button type="submit" disabled={isLoading}>
        {t("product.create")}{" "}
      </button>
    </form>
  );
}

export default CreateProduct;
