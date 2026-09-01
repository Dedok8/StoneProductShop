import { ShoppingCart } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ClearCart } from "@/features/cart/clearCart/ui";
import { useGetCart } from "@/features/cart/getCart/model";
import { RemoveCartItem } from "@/features/cart/removeCartItem/ui";
import { useUpdateCartItem } from "@/features/cart/updateCartItem/model";
import { QuantityStepper, useQueryState } from "@/shared";
import { getApiErrorMessage } from "@/shared/ui/Error/getApiErrorMessage";

function GetCart() {
  const { cart, isLoading, error, isError } = useGetCart();
  const {
    updateCartItem,
    error: updateError,
    isError: isUpdateError,
  } = useUpdateCartItem();

  const { t } = useTranslation();

  const qState = useQueryState(isLoading, isError, error);
  if (qState) return qState;

  if (!cart || cart.items.length === 0) {
    return (
      <div >
        <ShoppingCart  />
        <p>{t("cart.empty")}</p>
      </div>
    );
  }

  const handleQuantityChange = async (productId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      await updateCartItem(productId, { quantity });
    } catch (e) {
      //
    }
  };

  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div >
      <ul >
        {cart.items.map((item) => (
          <li
            key={item.productId}
          >
            <div >
              <span >{item.name}</span>
              <span >
                {item.price} $
              </span>
              {!item.isStock && (
                <span className="w-fit rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                  {t("cart.outOfStock")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <QuantityStepper
                quantity={item.quantity}
                onChange={(q) => handleQuantityChange(item.productId, q)}
                disabled={!item.isStock}
              />
              <RemoveCartItem productId={item.productId} />
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">
          {t("cart.total")}
        </span>
        <span className="text-lg font-semibold text-foreground">{total} $</span>
      </div>

      {isUpdateError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(updateError, t)}
        </p>
      )}

      <div className="flex justify-end">
        <ClearCart />
      </div>
    </div>
  );
}

export default GetCart;
