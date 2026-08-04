import { Navigate, Outlet, useLocation } from "react-router";

import { selectAuthAccessToken, selectAuthLoading } from "@/features";
import { FRONT_ROUTES } from "@/shared/config";
import { useAppSelector } from "@/shared/hooks";

function ProtectedRoute() {
  const accessToken = useAppSelector(selectAuthAccessToken);
  const isLoading = useAppSelector(selectAuthLoading);
  const location = useLocation();

  if (isLoading) return null;

  if (!accessToken) {
    return (
      <Navigate
        to={FRONT_ROUTES.pages.Login.path}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
