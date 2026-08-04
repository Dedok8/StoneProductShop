import { Navigate, Outlet } from "react-router";

import { selectAuthAccessToken, useAppSelector } from "@/shared";
import { FRONT_ROUTES } from "@/shared/config";

function GuestRoute() {
  const accessToken = useAppSelector(selectAuthAccessToken);

  if (accessToken) {
    return <Navigate to={FRONT_ROUTES.pages.Profile.path} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
