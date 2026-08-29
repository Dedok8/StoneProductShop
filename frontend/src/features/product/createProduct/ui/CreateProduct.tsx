import { useTranslation } from "react-i18next";

import { useGetAllCategory } from "@/features/category/getAllCategory";
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
  const { register, handleSubmit, errors } = useCreateProductForm();
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

      {isError && <p>{error?.toString()}</p>}

      <button type="submit" disabled={isLoading}>
        {t("product.create")}{" "}
      </button>
    </form>
  );
}

export default CreateProduct;
