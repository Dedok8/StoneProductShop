import { createBrowserRouter } from "react-router";

import { appRouterRoutes } from "@/app/router/appRouterRoutes";
import { bootSessionLoader } from "@/app/router/bootSessionLoader";
import { store } from "@/app/store/store";
import { PageLoader } from "@/shared/ui";
import MainLayout from "@/widgets/layouts/MainLayout";
import PublicLayout from "@/widgets/layouts/PublicLayout";
import RootLayout from "@/widgets/layouts/RootLayout";

import type { IRouteMeta } from "@/shared";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    loader: bootSessionLoader({ store }),
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
