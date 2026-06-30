import { FRONT_ROUTES } from "@/shared";

import type { FC } from "react";

type PageModule = {
  default: FC;
};

const pages = import.meta.glob<PageModule>("../../pages/**/*.tsx");

const pagesList = Object.keys(FRONT_ROUTES.pages) as Array<
  keyof typeof FRONT_ROUTES.pages
>;

export const appRouterRoutes = pagesList.map((page) => {
  const route = FRONT_ROUTES.pages[page];

  const path =
    typeof route.path === "string"
      ? route.path
      : "template" in route
        ? (route as any).template
        : undefined;

  return {
    path,
    meta: route.meta,

    lazy: async () => {
      const match = Object.keys(pages).find((p) => p.includes(`/${page}.tsx`));

      if (!match) throw new Error(`Page "${page}" не найдена в /pages`);

      const module = await pages[match]();

      return { Component: module.default };
    },
  };
});
