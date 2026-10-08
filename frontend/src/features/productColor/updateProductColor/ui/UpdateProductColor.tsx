import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

import { useFindProductColorById } from "@/features/productColor/findProductColorById/model";
import { useUpdateProductColor } from "@/features/productColor/updateProductColor/model/useUpdateProductColor";
import { useChangeTracking, useQueryState } from "@/shared";
import type { IProductColorResponse } from "@/shared/types";
import { Field } from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";
import FormerrorState from "@/shared/ui/form-parts/FormErrorState";
import FormShell from "@/shared/ui/form-parts/FormShell";
import SubmitButton from "@/shared/ui/form-parts/SubmitButton";

function UpdateProductColor() {
  const { id } = useParams<{ id: string }>();

  const {
    productColor,
    isLoading: isProductColorLoading,
    isError: isProductColorError,
    error: errorProductColor,
  } = useFindProductColorById(id);

  const queryState = useQueryState(
    isProductColorLoading,
    isProductColorError,
    errorProductColor
  );

  if (queryState) return queryState;
  if (!productColor) return null;

  return <UpdateProductColorForm productColor={productColor} />;
}

function UpdateProductColorForm({
  productColor,
}: {
  productColor: IProductColorResponse;
}) {
  const { t } = useTranslation();

  const { updateProductColor, isLoading, error, isError } =
    useUpdateProductColor();

  const { state, setField, changes, isChanged } = useChangeTracking({
    name: productColor.name,
    hex: productColor.hex,
  });

  const handleUpdateProductColor: React.SubmitEventHandler<
    HTMLFormElement
  > = async (e) => {
    e.preventDefault();

    try {
      await updateProductColor(productColor.id, changes);
    } catch (e) {
      //
    }
  };

  return (
    <FormShell title={t("productColor.editTitle")}>
      <form onSubmit={handleUpdateProductColor}>
        <Field aria-label={t("category.name")}>
          <Input
            value={state.name}
            onChange={(e) => setField("name", e.target.value)}
          />
        </Field>
        <Field aria-label={t("category.hex")}>
          <Input
            value={state.hex}
            onChange={(e) => setField("hex", e.target.value)}
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

export default UpdateProductColor;
