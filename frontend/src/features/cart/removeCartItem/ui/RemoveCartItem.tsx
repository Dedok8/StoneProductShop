import { useTranslation } from "react-i18next";

import { useRemoveCartItem } from "@/features/cart/removeCartItem/model";
import { useQueryState } from "@/shared";
import { Button } from "@/shared/ui/components/button";

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
  const queryState = useQueryState(isLoading, isError, error);
  return (
    <div>
      <Button variant="destructive" onClick={handleRemove} disabled={isLoading}>
        {t("cart.remove")}
      </Button>

      {queryState}
    </div>
  );
}

export default RemoveCartItem;
