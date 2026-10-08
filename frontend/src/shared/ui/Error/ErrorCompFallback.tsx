import ErrorView from "@/shared/ui/Error/ErrorView";

import type { FallbackProps } from "react-error-boundary";

function ErrorCompFallback({ error, resetErrorBoundary }: FallbackProps) {
  const message = error instanceof Error ? error.message : String(error);
  return <ErrorView message={message} onReset={resetErrorBoundary} />;
}

export default ErrorCompFallback;
