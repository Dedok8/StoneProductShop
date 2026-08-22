import { FRONT_ROUTES } from "@/shared/config/routes/frontRoutes";


interface IFooterLink {
  title: string;
  path: string;
}

interface IFooterSection {
  title: string;
  links: IFooterLink[];
}

export const FOOTER_SECTIONS: IFooterSection[] = [
  {
    title: "footer.menu.title",
    links: [
      { title: "footer.menu.delivery", path: "/delivery" },
      {
        title: "footer.menu.newArrivals",
        path: FRONT_ROUTES.pages.Catalog.path,
      },
      { title: "footer.menu.faq", path: "/faq" },
      { title: "footer.menu.contacts", path: FRONT_ROUTES.pages.Profile.path },
      { title: "footer.menu.blog", path: FRONT_ROUTES.pages.Blog.path },
    ],
  },
  {
    title: "footer.catalog.title",
    links: [
      { title: "footer.catalog.newArrivals", path: "/catalog?sort=new" },
      { title: "footer.catalog.trending", path: "/catalog?sort=trending" },
      {
        title: "footer.catalog.sales",
        path: FRONT_ROUTES.pages.Promotions.path,
      },
      { title: "footer.catalog.brands", path: "/catalog/brands" },
    ],
  },
];
