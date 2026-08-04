import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { TFunction } from "i18next";

export function getApiErrorMessage(error: unknown, t: TFunction): string {
  if (typeof error === "object" && error !== null && "status" in error) {
    const fbqError = error as FetchBaseQueryError;

    switch (fbqError.status) {
      case 401:
      case 404:
        return t("login.errors.invalidCredentials");
      case 429:
        return t("login.errors.tooManyAttempts");
      case "FETCH_ERROR":
        return t("common.errors.network");
      default:
        return t("common.errors.generic");
    }
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const serializedError = error as SerializedError;
    console.error("Unexpected error:", serializedError.message);
  }

  return t("common.errors.generic");
}
