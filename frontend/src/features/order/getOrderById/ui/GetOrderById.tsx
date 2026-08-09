import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useFindOrderById } from "@/features/order/getOrderById/model";
import { Input } from "@/shared/ui/components/input";
import { getApiErrorMessage } from "@/shared/ui/Error";

function GetOrderById() {
  const [query, setQuery] = useState("");
  const { order, isLoading, error, isError, isFetching } =
    useFindOrderById(query);

  const { t } = useTranslation();

  if (isLoading || isFetching) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return (
    <div>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by order ID"
      />

      {order && (
        <div>
          <p>ID: {order.id}</p>
          <p>Status: {order.status}</p>
          <p>UserId: {order.userId}</p>
          <p>Total: {order.total}</p>
          <p>Created: {new Date(order.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(order.updatedAt).toLocaleString()}</p>

          <ul>
            {order.items.map((item) => (
              <li key={item.id}>
                <p>Product: {item.productId}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Price: {item.price}</p>
                <p>Subtotal: {item.subTotal}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default GetOrderById;
