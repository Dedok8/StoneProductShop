import { useTranslation } from "react-i18next";

import { useUpdateOrderStatus } from "@/features/order/updateOrderStatus/model";
import type { IOrderResponse } from "@/shared";
import { ORDER_STATUS_TRANSITIONS } from "@/shared/lib/orderStatus";

type OrderStatus = IOrderResponse["status"];

const ORDER_STATUS_KEY = {
  PENDING: "orderStatus.PENDING",
  PAID: "orderStatus.PAID",
  SHIPPED: "orderStatus.SHIPPED",
  COMPLETED: "orderStatus.COMPLETED",
  CANCELLED: "orderStatus.CANCELLED",
} as const satisfies Record<OrderStatus, string>;

function OrderStatusSelect({ order }: { order: IOrderResponse }) {
  const { updateOrderStatus, isLoading, error, isError } =
    useUpdateOrderStatus();
  const { t } = useTranslation();

  const availableStatuses = ORDER_STATUS_TRANSITIONS[order.status];

  const handleStatusChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = async (e) => {
    const nextStatus = e.target.value as OrderStatus;

    try {
      await updateOrderStatus(order.id, { status: nextStatus });
    } catch (err) {
      //
    }
  };

  if (availableStatuses.length === 0) {
    return <p>{t(ORDER_STATUS_KEY[order.status])}</p>;
  }

  return (
    <div>
      <select
        value={order.status}
        onChange={handleStatusChange}
        disabled={isLoading}
      >
        <option value={order.status} disabled>
          {t(ORDER_STATUS_KEY[order.status])}
        </option>

        {availableStatuses.map((status) => (
          <option key={status} value={status}>
            {t(ORDER_STATUS_KEY[status])}
          </option>
        ))}
      </select>

      {isError && <p>{error?.toString()}</p>}
    </div>
  );
}

export default OrderStatusSelect;
