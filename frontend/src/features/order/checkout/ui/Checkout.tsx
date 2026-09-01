import { ShoppingBag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { useGetCart } from "@/features/cart/getCart/model";
import { useCheckout } from "@/features/order/checkout/model";
import { Button } from "@/shared/ui/components/button";
import { getApiErrorMessage } from "@/shared/ui/Error";

function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { cart, isLoading: isCartLoading } = useGetCart();
  const { checkout, isLoading: isCheckingOut, error, isError } = useCheckout();

  if (isCartLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        {t("common.loading")}
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center text-muted-foreground">
        <ShoppingBag className="h-8 w-8" />
        <p>{t("cart.empty")}</p>
      </div>
    );
  }

  const hasOutOfStock = cart.items.some((item) => !item.isStock);
  const total = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    try {
      const order = await checkout();
      navigate(`/orders/${order.id}`);
    } catch (e) {
      //
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <ul className="flex flex-col divide-y rounded-xl border bg-card">
        {cart.items.map((item) => (
          <li
            key={item.productId}
            className="flex items-center justify-between p-4"
          >
            <div className="flex flex-col">
              <span className="font-medium text-foreground">{item.name}</span>
              <span className="text-sm text-muted-foreground">
                {item.quantity} × {item.price} $
              </span>
            </div>
            <span className="font-medium text-foreground">
              {item.price * item.quantity} $
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">
          {t("cart.total")}
        </span>
        <span className="text-lg font-semibold text-foreground">{total} $</span>
      </div>

      {hasOutOfStock && (
        <p className="rounded-md bg-amber-100 px-3 py-2 text-sm text-amber-800">
          {t("checkout.someOutOfStock", "Some items are out of stock")}
        </p>
      )}

      {isError && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {getApiErrorMessage(error, t)}
        </p>
      )}

      <Button
        onClick={handleCheckout}
        disabled={isCheckingOut || hasOutOfStock}
        className="ml-auto"
      >
        {t("checkout.placeOrder", "Place order")}
      </Button>
    </div>
  );
}

export default Checkout;
