export const LEAD_STATUS = {
  NEW: "NEW",
  CONTACTED: "CONTACTED",
  CLOSED: "CLOSED",
} as const;

export type LEAD_STATUS = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];
