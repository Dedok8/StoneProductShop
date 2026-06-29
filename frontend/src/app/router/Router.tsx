import { createBrowserRouter } from "react-router";

import { appRouterRoutes } from "@/app/router/appRouterRoutes";
import { PageLoader } from "@/shared/ui";
import MainLayout from "@/widgets/layouts/MainLayout";
import PublicLayout from "@/widgets/layouts/PublicLayout";
import RootLayout from "@/widgets/layouts/RootLayout";

import type { IRouteMeta } from "@/shared/config/routes";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    HydrateFallback: PageLoader,
    children: [
      {
        element: <PublicLayout />,
        children: appRouterRoutes.filter(
          (r) => (r.meta as IRouteMeta).isGuestOnly
        ),
      },

      {
        element: <MainLayout />,
        children: appRouterRoutes.filter((r) => r.meta.requireAuth),
      },

      ...appRouterRoutes.filter(
        (r) => !r.meta.requireAuth && !(r.meta as IRouteMeta).isGuestOnly
      ),
    ],
  },
]);
