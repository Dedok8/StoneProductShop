import { useTranslation } from "react-i18next";

import {
  useCreateProduct,
  useCreateProductForm,
  type ProductFormValues,
} from "@/features/product/createProduct/model";
import { Input } from "@/shared/ui/components/input";

function CreateProduct() {
  const { createProduct, isLoading, error, isError } = useCreateProduct();
  const { register, handleSubmit, errors } = useCreateProductForm();
  const { t } = useTranslation();

  const onSubmit = async (value: ProductFormValues) => {
    try {
      await createProduct(value);
    } catch (e) {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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

      <div>
        <label htmlFor="categoryId">{t("product.category")}</label>
        <Input id="categoryId" {...register("categoryId")} />
        {errors.categoryId && <p>{errors.categoryId.message}</p>}
      </div>

      {isError && <p>{error?.toString()}</p>}

      <button type="submit" disabled={isLoading}>
        {t("product.create")}
      </button>
    </form>
  );
}

export default CreateProduct;
