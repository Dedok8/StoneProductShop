import { FRONT_ROUTES } from "@/shared/config/routes/frontRoutes";
import type { IRouteMeta } from "@/shared/config/routes/types";
import type { UserRole } from "@/shared/types";

type Pages = typeof FRONT_ROUTES.pages;
type PageValue = Pages[keyof Pages];

const isStaticRoute = (
  r: PageValue
): r is Extract<PageValue, { path: string }> => typeof r.path === "string";

export const getMenuRoutes = () =>
  Object.values(FRONT_ROUTES.pages)
    .filter(isStaticRoute)
    .filter((r) => r.meta.isInMenu)
    .sort(
      (a, b) =>
        ((a.meta as IRouteMeta).order ?? 99) -
        ((b.meta as IRouteMeta).order ?? 99)
    );

export const getMenuRoutesByRole = (role: UserRole) =>
  getMenuRoutes().filter((r) => {
    const roles = (r.meta as IRouteMeta).roles;
    return !roles || roles.includes(role);
  });

export const getPublicRoutes = () =>
  Object.values(FRONT_ROUTES.pages).filter((r) => !r.meta.requireAuth);
