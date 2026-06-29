import { FRONT_ROUTES } from "@/shared/config/routes/frontRoutes";

import type { UserRole } from "@/shared/api/types";

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
      (a, b) => ((a.meta as any).order ?? 99) - ((b.meta as any).order ?? 99)
    );

export const getMenuRoutesByRole = (role: UserRole) =>
  getMenuRoutes().filter((r) => {
    const roles = (r.meta as any).roles as UserRole[] | undefined;
    return !roles || roles.includes(role);
  });

export const getPublicRoutes = () =>
  Object.values(FRONT_ROUTES.pages).filter((r) => !r.meta.requireAuth);
