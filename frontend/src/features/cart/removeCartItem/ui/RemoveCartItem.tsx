import { useTranslation } from "react-i18next";

import { useRemoveCartItem } from "@/features/cart/removeCartItem/model";
import { Button } from "@/shared/ui/components/button";
import { getApiErrorMessage } from "@/shared/ui/Error/getApiErrorMessage";

function RemoveCartItem({ productId }: { productId: string }) {
  const { removeCartItem, isLoading, error, isError } = useRemoveCartItem();
  const { t } = useTranslation();

  const handleRemove = async () => {
    try {
      await removeCartItem(productId);
    } catch (e) {
      //
    }
  };

  return (
    <div>
      <Button variant="destructive" onClick={handleRemove} disabled={isLoading}>
        {t("cart.remove")}
      </Button>

      {isError && <p>{getApiErrorMessage(error, t)}</p>}
    </div>
  );
}

export default RemoveCartItem;
