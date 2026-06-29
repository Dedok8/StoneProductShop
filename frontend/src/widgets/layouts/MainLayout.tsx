import { Navigate, Outlet } from "react-router";

import { selectAccessToken } from "@/features/auth/api";
import { FRONT_ROUTES } from "@/shared/config/routes";
import { useAppSelector } from "@/shared/hooks/useSelector";

function MainLayout() {
  const token = useAppSelector(selectAccessToken);

  if (!token) return <Navigate to={FRONT_ROUTES.pages.Login.path} replace />;

  return (
    <div>
      {/* <Header />
      <Sidebar /> */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
