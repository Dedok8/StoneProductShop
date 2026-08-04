import { createBrowserRouter } from "react-router";

import { store } from "@/app";
import { appRouterRoutes } from "@/app/router/appRouterRoutes";
import { bootSessionLoader } from "@/app/router/bootSessionLoader";
import RoleRoute from "@/app/router/guards/RoleRoute";
import { PageLoader, type IRouteMeta } from "@/shared";
import MainLayout from "@/widgets/layouts/PrivateLayout";
import PublicLayout from "@/widgets/layouts/PublicLayout";
import RootLayout from "@/widgets/layouts/RootLayout";

const authRoutes = appRouterRoutes.filter((r) => r.meta.requireAuth);

const plainAuthRoutes = authRoutes.filter(
  (r) => !(r.meta as IRouteMeta).roles?.length
);

const roleRouteGroups = new Map<
  string,
  { roles: string[]; routes: typeof authRoutes }
>();

for (const route of authRoutes) {
  const roles = (route.meta as IRouteMeta).roles;
  if (!roles?.length) continue;
  const key = [...roles].sort().join(",");
  const group = roleRouteGroups.get(key);
  if (group) {
    group.routes.push(route);
  } else {
    roleRouteGroups.set(key, { roles, routes: [route] });
  }
}

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
        children: [
          ...plainAuthRoutes,
          ...[...roleRouteGroups.values()].map(({ roles, routes }) => ({
            element: <RoleRoute roles={roles} />,
            children: routes,
          })),
        ],
      },

      ...appRouterRoutes.filter(
        (r) => !r.meta.requireAuth && !(r.meta as IRouteMeta).isGuestOnly
      ),
    ],
  },
]);
