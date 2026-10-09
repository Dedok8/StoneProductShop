import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";

import { store } from "@/app";
import { router } from "@/app/router";
import "@/shared/config/i18n/config";
import { Toaster } from "@/shared/ui/components/sonner";
import ErrorCompFallback from "@/shared/ui/Error/ErrorCompFallback";

import "./index.css";

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
