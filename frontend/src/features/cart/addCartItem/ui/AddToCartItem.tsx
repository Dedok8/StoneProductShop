import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAddToCartItem } from "@/features/cart/addCartItem/model";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";

function AddToCartItem({ productId }: { productId: string }) {
  const { addToCartItem, isLoading, error, isError } = useAddToCartItem();
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState(1);

  const handleAddItem: React.SubmitEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();

    if (quantity < 1) return;

    try {
      await addToCartItem({ productId, quantity });
    } catch (e) {
      //
    }
  };
  return (
    <form onSubmit={handleAddItem}>
      <Input
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <Button type="submit" disabled={isLoading || quantity < 1}>
        {t("cart.addToCart")}
      </Button>

      {isError && <p>{error?.toString()}</p>}
    </form>
  );
}

export default AddToCartItem;
