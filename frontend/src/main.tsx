import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router";

import { store } from "@/app";
import { router } from "@/app/router";
import ErrorCompFallback from "@/shared/ui/Error/ErrorCompFallback";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary FallbackComponent={ErrorCompFallback}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </ErrorBoundary>
  </StrictMode>
);
