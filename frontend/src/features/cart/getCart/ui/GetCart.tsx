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
    return <div>{t("cart.empty")}</div>;
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
      {cart.items.map((item) => (
        <div
          key={item.productId}
        >
          <div>
            <div >{item.name}</div>
            <div >{item.price} ₽ / шт.</div>
            {!item.isStock && (
              <div >{t("cart.outOfStock")}</div>
            )}
          </div>

          <div>
            <QuantityStepper
              quantity={item.quantity}
              onChange={(q) => handleQuantityChange(item.productId, q)}
              disabled={!item.isStock}
            />

            <RemoveCartItem productId={item.productId} />
          </div>
        </div>
      ))}

      <div >
        <span>{t("cart.total")}</span>
        <span>{total} ₽</span>
      </div>

      <ClearCart />

      {isUpdateError && <p>{getApiErrorMessage(updateError, t)}</p>}
    </div>
  );
}

export default GetCart;
