import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useCreateOrder } from "@/features/order/createOrder/model";
import { useGetAllProduct } from "@/features/product/getAllProduct";
import type { ICreateOrderItemRequest } from "@/shared";
import { Button } from "@/shared/ui/components/button";
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

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!isValid) return;

    try {
      await createOrder({ items });
    } catch (e) {
      //
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {items.map((item, index) => (
        <div key={index}>
          <select
            value={item.productId}
            onChange={(e) =>
              handleItemChange(index, "productId", e.target.value)
            }
            disabled={isProductLoading}
          >
            <option value="">{t("order.selectProduct")}</option>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <Input
            type="number"
            min={1}
            value={item.quantity}
            onChange={(e) =>
              handleItemChange(index, "quantity", Number(e.target.value))
            }
          />

          <Button
            type="button"
            onClick={() => handleRemoveItem(index)}
            disabled={items.length === 1}
          >
            {t("common.remove")}
          </Button>
        </div>
      ))}

      <Button type="button" onClick={handleAddItem}>
        {t("order.addItem")}
      </Button>

      <Button type="submit" disabled={!isValid || isLoading}>
        {t("order.create")}
      </Button>

      {isError && <p>{error?.toString()}</p>}
    </form>
  );
}

export default CreateOrder;
