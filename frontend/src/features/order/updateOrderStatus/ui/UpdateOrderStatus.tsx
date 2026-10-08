import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useUpdateOrderStatus } from "@/features/order/updateOrderStatus/model";
import { useQueryState } from "@/shared";
import { ORDER_STATUS_TRANSITIONS } from "@/shared/lib/orderStatus";
import type { IOrderResponse } from "@/shared/types";

type OrderStatus = IOrderResponse["status"];

const ORDER_STATUS_KEY = {
  PENDING: "orderStatus.PENDING",
  PAID: "orderStatus.PAID",
  SHIPPED: "orderStatus.SHIPPED",
  COMPLETED: "orderStatus.COMPLETED",
  CANCELLED: "orderStatus.CANCELLED",
} as const satisfies Record<OrderStatus, string>;

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const selectClass =
  "rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50";

function UpdateOrderStatus({ order }: { order: IOrderResponse }) {
  const { updateOrderStatus, isLoading, error, isError } =
    useUpdateOrderStatus();
  const { t } = useTranslation();
  
  const queryState = useQueryState(isLoading, isError, error);

  const availableStatuses = ORDER_STATUS_TRANSITIONS[order.status];

  const handleStatusChange: React.ChangeEventHandler<
    HTMLSelectElement
  > = async (e) => {
    const nextStatus = e.target.value as OrderStatus;

    try {
      await updateOrderStatus(order.id, { status: nextStatus });
    } catch (e) {
      //
    }
  };

  if (availableStatuses.length === 0) {
    return (
      <span
        className={`w-fit rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[order.status]}`}
      >
        {t(ORDER_STATUS_KEY[order.status])}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <select
        value={order.status}
        onChange={handleStatusChange}
        disabled={isLoading}
        className={selectClass}
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

      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      )}

      {queryState}
    </div>
  );
}

export default UpdateOrderStatus;
