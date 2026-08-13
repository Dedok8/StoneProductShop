import { Navigate } from "react-router";

import { selectAuthAccessToken, useAppSelector } from "@/shared";
import { FRONT_ROUTES } from "@/shared/config/routes";

export default function PublicLayout() {
  const token = useAppSelector(selectAuthAccessToken);

  if (token) return <Navigate to={FRONT_ROUTES.pages.Home.path} replace />;
  if (!token) return <Navigate to={FRONT_ROUTES.pages.Authentication.path} />;

  // return (
  //   <div>
  //     <Outlet />
  //   </div>
  // );
}
