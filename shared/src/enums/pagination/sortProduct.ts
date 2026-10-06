export const SORT_PRODUCT = {
  NAME: "name",
  PRICE: "price",
  CREATED_AT: "createdAt",
} as const;

export type SORT_PRODUCT = (typeof SORT_PRODUCT)[keyof typeof SORT_PRODUCT];
