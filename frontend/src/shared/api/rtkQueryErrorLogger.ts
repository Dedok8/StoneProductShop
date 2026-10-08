import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const message =
      (action.payload as { data?: { message?: string } })?.data?.message ??
      "Something went wrong";

    console.error("RTK Query error:", action.payload);
    toast.error(message);
  }

  return next(action);
};
