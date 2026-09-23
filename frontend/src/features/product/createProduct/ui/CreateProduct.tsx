import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useGetAllCategory } from "@/features/category/getAllCategory";
import {
  useCreateProduct,
  useCreateProductForm,
  type ProductFormValues,
} from "@/features/product/createProduct/model";
import UploadImage from "@/features/upload/ui";
import { useQueryState } from "@/shared";
import { useSlugField } from "@/shared/hooks/useSlugField";
import { Button } from "@/shared/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";
import FormFields from "@/shared/ui/form-parts/FormField/FormField";
import FormShell from "@/shared/ui/form-parts/FormShell";

function CreateProduct() {
  const { createProduct, isLoading, error, isError } = useCreateProduct();
  const { categories } = useGetAllCategory();
  // const { inspirations, isLoading: isInspirationsLoading } =
  //   useGetAllInspiration();
  const { register, handleSubmit, errors, control, watch, setValue } =
    useCreateProductForm();
  const { t } = useTranslation();
  // const user = useUser();

  const nameValue = watch("name");
  const slugRegister = register("slug");

  const { isSlugTouched, onSlugChange, resetSlug } = useSlugField(
    nameValue,
    setValue,
    "slug"
  );

  const onSubmit = async (value: ProductFormValues) => {
    try {
      await createProduct({
        ...value,
        productTypeId: value.productTypeId ?? null,
        originId: value.originId ?? null,
        colorId: value.colorId ?? null,
      });
    } catch (e) {
      console.error(e);
    }
  };
  const queryState = useQueryState(isLoading, isError, error);

  const categoriesOptions = [
    { value: "", label: t("common.selectPlaceholder") },
    ...(categories?.map((category) => ({
      value: category.id,
      label: category.name,
    })) ?? []),
  ];

  return (
    <FormShell
      title={t("admin.createProduct")}
      onSubmit={handleSubmit(onSubmit, (validationErrors) => {
        console.log(validationErrors);
      })}
      isLoading={isLoading}
      queryState={queryState}
      submitText={t("admin.createProduct")}
    >
      {
        <FieldGroup>
          <FormFields
            fields={[
              { name: "name", label: t("product.name") },
              // { name: "slug", label: t("product.slug") },
              {
                name: "description",
                label: t("product.description"),
                type: "textarea",
              },
              { name: "price", label: t("product.price"), type: "number" },
              { name: "stock", label: t("product.stock"), type: "number" },
              // { name: "images", label: t("product.images"), type: "select" },
              {
                name: "categoryId",
                label: t("product.categoryId"),
                options: categoriesOptions,
                type: "select",
              },
            ]}
            errors={errors}
            register={register}
          />

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
              />
              {isSlugTouched && (
                <Button type="button" onClick={resetSlug}>
                  {t("product.resetSlug")}
                </Button>
              )}
            </div>
            {errors.slug && <FieldError>{errors.slug.message}</FieldError>}
          </Field>

          <Field>
            <FieldLabel htmlFor="images">{t("product.images")}</FieldLabel>
            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <UploadImage value={field.value} onChange={field.onChange} />
              )}
            />

            {errors.images && <FieldError>{errors.images.message}</FieldError>}
          </Field>
        </FieldGroup>
      }
    </FormShell>
  );
}

export default CreateProduct;
