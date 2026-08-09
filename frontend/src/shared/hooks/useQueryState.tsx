import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/shared/ui";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export const useQueryState = (
  isLoading: boolean,
  isError: boolean,
  error?: FetchBaseQueryError | SerializedError
) => {
  const { t } = useTranslation();

  if (isLoading) return <div>{t("common.loading")}</div>;
  if (isError) return <div>{getApiErrorMessage(error, t)}</div>;

  return null;
};
