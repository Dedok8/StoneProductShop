import { Navigate, Outlet } from "react-router";

import { FRONT_ROUTES } from "@/shared/config/routes";
import { useAppSelector } from "@/shared";
import { selectAuthAccessToken } from "@/features";

export default function PublicLayout() {
  const token = useAppSelector(selectAuthAccessToken);

  if (token) return <Navigate to={FRONT_ROUTES.pages.Home.path} replace />;

  return (
    <div>
      <Outlet />
    </div>
  );
}
