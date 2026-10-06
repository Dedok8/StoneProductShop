export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type ORDER_STATUS = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
