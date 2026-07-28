import { Navigate, Outlet } from "react-router";

import { FRONT_ROUTES } from "@/shared/config/routes";
import { useAppSelector } from "@/shared";
import { selectAuthAccessToken } from "@/features";

function MainLayout() {
  const token = useAppSelector(selectAuthAccessToken);

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
