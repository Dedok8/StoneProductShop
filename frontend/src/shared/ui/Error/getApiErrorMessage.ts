import type { TFunction } from "i18next";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function getApiErrorMessage(error: unknown, t: TFunction): string {
  if (typeof error === "object" && error !== null && "status" in error) {
    const fbqError = error as FetchBaseQueryError;

    if (fbqError.status === 401 || fbqError.status === 404) {
      return t("login.errors.invalidCredentials");
    }
    if (fbqError.status === 429) return t("login.errors.tooManyAttempts");
  }

  return t("login.errors.invalidCredentials");
}
