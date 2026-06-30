import type { FallbackProps } from "react-error-boundary";

function ErrorCompFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div>
      <h2>Error</h2>
      <h3>{error.message}</h3>
      <button onClick={resetErrorBoundary}>Reload</button>
    </div>
  );
}

export default ErrorCompFallback;
