import { Navigate, Outlet } from "react-router";

import { selectAuthAccessToken, useAppSelector } from "@/shared";
import { FRONT_ROUTES } from "@/shared/config/routes";

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
