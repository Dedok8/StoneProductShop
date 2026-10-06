export const USER_ROLE = {
  USER: "USER",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const;

export type USER_ROLE = (typeof USER_ROLE)[keyof typeof USER_ROLE];
