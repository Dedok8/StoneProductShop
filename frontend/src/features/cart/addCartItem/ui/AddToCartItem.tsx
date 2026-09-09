import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useAddToCartItem } from "@/features/cart/addCartItem/model";
import { QuantityStepper, useQueryState } from "@/shared";
import { Button } from "@/shared/ui/components/button";

interface IAddToCartItemProps {
  productId: string;
  disabled: boolean;
}

function AddToCartItem({ productId, disabled }: IAddToCartItemProps) {
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

  const queryState = useQueryState(isLoading, isError, error);

  return (
    <form onSubmit={handleAddItem} className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <QuantityStepper quantity={quantity} onChange={(q) => setQuantity(q)} />

        <Button
          type="submit"
          disabled={isLoading || quantity < 1 || disabled}
          className="flex-1"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {t("cart.addToCart")}
            </>
          )}
        </Button>
      </div>

      {queryState}
    </form>
  );
}

export default AddToCartItem;
