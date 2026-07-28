import { Navigate, Outlet } from "react-router";
import { useAppSelector } from "@/shared";
import { FRONT_ROUTES } from "@/shared/config";
import { selectAuthUser } from "@/features";

interface RoleRouteProps {
  roles: readonly string[];
}

function RoleRoute({ roles }: RoleRouteProps) {
  const user = useAppSelector(selectAuthUser);

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={FRONT_ROUTES.pages.Home.path} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
