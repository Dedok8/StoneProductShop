import { FRONT_ROUTES } from "@/shared";

import type { FC } from "react";

type PageModule = {
  default: FC;
};

const pages = import.meta.glob<PageModule>("../../pages/**/index.ts");

const pagesList = Object.keys(FRONT_ROUTES.pages) as Array<
  keyof typeof FRONT_ROUTES.pages
>;

export const appRouterRoutes = pagesList.map((page) => {
  const route = FRONT_ROUTES.pages[page];

  const path =
    typeof route.path === "string"
      ? route.path
      : "template" in route
        ? route.template
        : undefined;

  const isIndex = path === "/";

  return {
    ...(isIndex ? { index: true } : { path }),
    meta: route.meta,

    lazy: async () => {
      const match = Object.keys(pages).find((p) =>
        p.includes(`/${page.toLowerCase()}/index.ts`)
      );

      if (!match) throw new Error(`Page "${page}" не знайдена в /pages`);

      const module = await pages[match]();

      console.log("route config:", page, { path, isIndex, meta: route.meta });

      return { Component: module.default };
    },
  };
});
