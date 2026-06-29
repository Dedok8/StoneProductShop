import { Navigate, Outlet } from "react-router";

import { selectAccessToken } from "@/features/auth/api";
import { FRONT_ROUTES } from "@/shared/config/routes";
import { useAppSelector } from "@/shared/hooks/useSelector";

export default function PublicLayout() {
  const token = useAppSelector(selectAccessToken);

  if (token) return <Navigate to={FRONT_ROUTES.pages.Home.path} replace />;

  return (
    <div>
      <Outlet />
    </div>
  );
}
