export const SORT_USER = {
  NAME: "name",
  EMAIL: "email",
  CREATED_AT: "createdAt",
} as const;

export type SORT_USER = (typeof SORT_USER)[keyof typeof SORT_USER];
