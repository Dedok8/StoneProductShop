import { useTranslation } from "react-i18next";

import { getApiErrorMessage } from "@/shared/ui/Error";

import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface IFormErrorStateProps {
  isError: boolean;
  error?: FetchBaseQueryError | SerializedError;
}

function FormerrorState({ isError, error }: IFormErrorStateProps) {
  const { t } = useTranslation();

  if (!isError) return null;

  return (
    <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
      {getApiErrorMessage(error, t)}
    </p>
  );
}

export default FormerrorState;
