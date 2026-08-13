import { useTranslation } from "react-i18next";

import { useClearCart } from "@/features/cart/clearCart/model";
import { Button } from "@/shared/ui/components/button";
import { getApiErrorMessage } from "@/shared/ui/Error/getApiErrorMessage";

function ClearCart() {
  const { clearCart, isLoading, error, isError } = useClearCart();
  const { t } = useTranslation();

  const handleClear = async () => {
    try {
      await clearCart();
    } catch (e) {
      //
    }
  };

  return (
    <div>
      <Button variant="destructive" onClick={handleClear} disabled={isLoading}>
        {t("cart.clear")}
      </Button>

      {isError && <p>{getApiErrorMessage(error, t)}</p>}
    </div>
  );
}

export default ClearCart;
