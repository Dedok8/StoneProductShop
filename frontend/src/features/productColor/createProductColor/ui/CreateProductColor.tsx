import { useTranslation } from "react-i18next";

import { useCreateProductColor } from "@/features/productColor/createProductColor/model/useCreateProductColor";
import {
  useCreateProductColorForm,
  type ProductColorValues,
} from "@/features/productColor/createProductColor/model/useCreateProductColorForm";
import { useQueryState } from "@/shared";
import { Button } from "@/shared/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";

function CreateProductColor() {
  const { createProductColor, isLoading, isError, error } =
    useCreateProductColor();
  const { register, handleSubmit, errors } = useCreateProductColorForm();
  const { t } = useTranslation();

  const onSubmit = async (value: ProductColorValues) => {
    try {
      await createProductColor({
        ...value,
        hex: value.hex ?? undefined,
      });
    } catch (e) {
      //
    }
  };

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="text-lg font-semibold text-foreground">
        {t("productColor.create")}
      </h2>

      <FieldGroup className="grid gap-4 sm:grid-cols-2">
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">{t("product.name")}</FieldLabel>
          <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
          {errors.name && <FieldError>{errors.name.message}</FieldError>}
        </Field>

        <Field data-invalid={!!errors.hex}>
          <FieldLabel htmlFor="hex">{t("product.hex")}</FieldLabel>
          <Input id="hex" aria-invalid={!!errors.hex} {...register("hex")} />
          {errors.hex && <FieldError>{errors.hex.message}</FieldError>}
        </Field>
      </FieldGroup>

      {queryState}

      <Button type="submit" disabled={isLoading}>
        {t("productColor.create")}
      </Button>
    </form>
  );
}

export default CreateProductColor;
