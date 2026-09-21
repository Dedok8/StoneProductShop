import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useCreateOrder } from "@/features/order/createOrder/model";
import { useGetAllProduct } from "@/features/product/getAllProduct";
import { useQueryState } from "@/shared";
import type { ICreateOrderItemRequest } from "@/shared/types";
import { Button } from "@/shared/ui/components/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/shared/ui/components/field";
import { Input } from "@/shared/ui/components/input";

function CreateOrder() {
  const { createOrder, isLoading, error, isError } = useCreateOrder();
  const { products, isLoading: isProductLoading } = useGetAllProduct({
    page: 1,
    limit: 100,
  });
  const { t } = useTranslation();
  const [items, setItems] = useState<ICreateOrderItemRequest[]>([
    { productId: "", quantity: 1 },
  ]);

  const handleAddItem = () =>
    setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const handleRemoveItem = (index: number) =>
    setItems((prev) => prev.filter((_, i) => i !== index));
  const handleItemChange = (
    index: number,
    field: keyof ICreateOrderItemRequest,
    value: string | number
  ) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const isValid =
    items.length > 0 && items.every((i) => i.productId && i.quantity >= 1);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      await createOrder({ items });
    } catch (e) {
      console.error(e);
    }
  };
  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex max-w-2xl flex-col gap-5 rounded-xl border bg-card p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-foreground">
        {t("order.create")}
      </h2>

      <FieldGroup>
        {items.map((item, index) => (
          <div key={index}>
            {index > 0 && <FieldSeparator />}
            <Field
              orientation="responsive"
              className="items-end gap-3 sm:grid-cols-[1fr_auto_auto]"
            >
              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={`productId-${index}`}>
                  {t("order.selectProduct")}
                </FieldLabel>
                <select
                  id={`productId-${index}`}
                  value={item.productId}
                  onChange={(e) =>
                    handleItemChange(index, "productId", e.target.value)
                  }
                  disabled={isProductLoading}
                  className="rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">{t("order.selectProduct")}</option>
                  {products?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel htmlFor={`quantity-${index}`}>
                  {t("order.quantity")}
                </FieldLabel>
                <Input
                  id={`quantity-${index}`}
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", Number(e.target.value))
                  }
                  className="w-24"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleRemoveItem(index)}
                disabled={items.length === 1}
              >
                {t("common.remove")}
              </Button>
            </Field>
          </div>
        ))}
      </FieldGroup>

      <Button type="button" variant="outline" onClick={handleAddItem}>
        {t("order.addItem")}
      </Button>

      {queryState}

      <Button type="submit" disabled={!isValid || isLoading}>
        {t("order.create")}
      </Button>
    </form>
  );
}

export default CreateOrder;
