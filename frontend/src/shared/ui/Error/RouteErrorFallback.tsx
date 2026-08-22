import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

import ErrorView from "./ErrorView";

function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : "Something went wrong";

  return <ErrorView message={message} onReset={() => navigate(0)} />;
}

export default RouteErrorFallback;
