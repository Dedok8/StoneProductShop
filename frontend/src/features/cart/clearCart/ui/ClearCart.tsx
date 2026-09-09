import { useTranslation } from "react-i18next";

import { useClearCart } from "@/features/cart/clearCart/model";
import { useQueryState } from "@/shared";
import { Button } from "@/shared/ui/components/button";

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
  const queryState = useQueryState(isLoading, isError, error);
  return (
    <div>
      <Button variant="destructive" onClick={handleClear} disabled={isLoading}>
        {t("cart.clear")}
      </Button>

      {queryState}
    </div>
  );
}

export default ClearCart;
