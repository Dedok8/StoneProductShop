import { Navigate, Outlet } from "react-router";
import { FRONT_ROUTES } from "@/shared/config";
import { useAppSelector } from "@/shared";
import { selectAuthAccessToken } from "@/features";

function GuestRoute() {
  const accessToken = useAppSelector(selectAuthAccessToken);

  if (accessToken) {
    return <Navigate to={FRONT_ROUTES.pages.Profile.path} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
