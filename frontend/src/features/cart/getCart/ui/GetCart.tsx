import { useGetCart } from "@/features/cart/getCart/model";
import { useQueryState, useUser } from "@/shared";
import { useTranslation } from "react-i18next";

function GetCart() {
  const {cart,  isLoading, error, isError, refetch} = useGetCart()
  const isAdmin = useUser()

  const { t } = useTranslation();

  const qState = useQueryState(isLoading, isError, error)
  if(qState) return qState
  
  return (  );
}

export default GetCart;