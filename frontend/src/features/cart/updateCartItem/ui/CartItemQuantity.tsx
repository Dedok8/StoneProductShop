import { useEffect, useRef } from "react";

import { useUpdateCartItem } from "@/features/cart/updateCartItem/model";
import { QuantityStepper } from "@/shared";

interface ICartItemQuantityProps {
  productId: string;
  quantity: number;
  disabled?: boolean;
}

const DEBOUNCE_MS = 400;

function CartItemQuantity({
  productId,
  quantity,
  disabled,
}: ICartItemQuantityProps) {
  const { updateCartItem } = useUpdateCartItem();
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleChange = (q: number) => {
    if (q < 1) return;

    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      updateCartItem(productId, { quantity: q }).catch(() => {});
    }, DEBOUNCE_MS);
  };
  return (
    <QuantityStepper
      quantity={quantity}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}

export default CartItemQuantity;
