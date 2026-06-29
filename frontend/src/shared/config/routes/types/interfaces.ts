import type { UserRole } from "@/shared/api/types";

export interface IRouteMeta {
  title: string;
  isInMenu: boolean;
  requireAuth: boolean;
  isGuestOnly?: boolean;
  roles?: UserRole[];
  icon?: string;
  order?: number;
}

export interface IRouteConfig {
  path: string;
  meta: IRouteMeta;
}

export interface IDynamicRouteConfig {
  path: (id: string) => string;
  meta: IRouteMeta;
}
