import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";

import "@/shared/config/i18n/config";
import { store } from "@/app";
import { router } from "@/app/router";
import { Toaster } from "@/shared/ui/components/sonner";
import ErrorCompFallback from "@/shared/ui/Error/ErrorCompFallback";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorCompFallback}>
      <Provider store={store}>
        <RouterProvider router={router} />
        <Toaster />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
