import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type MutationState = {
  isLoading: boolean;
  error?: FetchBaseQueryError | SerializedError;
  isError: boolean;
};

export type QueryState = {
  isLoading: boolean;
  isFetching?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  isError: boolean;
};
