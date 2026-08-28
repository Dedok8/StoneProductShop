import type { UserRole } from "@/shared/types";

export const FRONT_ROUTES = {
  pages: {
    Home: {
      path: "/",
      meta: {
        title: "HomePage",
        isInMenu: false,
        requireAuth: false,
        order: 1,
        icon: "home",
      },
    },

    Catalog: {
      path: "/catalog",
      meta: {
        title: "Catalog",
        isInMenu: true,
        requireAuth: false,
        // isGuestOnly: true,
      },
    },
    Promotions: {
      path: "/promotions",
      meta: {
        title: "promotions",
        isInMenu: true,
        requireAuth: false,
        isGuestOnly: true,
      },
    },
    Blog: {
      path: "/blog",
      meta: {
        title: "Blog",
        isInMenu: false,
        requireAuth: false,
        isGuestOnly: true,
      },
    },
    Cooperation: {
      path: "/cooperation",
      meta: {
        title: "Cooperation",
        isInMenu: true,
        requireAuth: false,
        isGuestOnly: true,
      },
    },
    PaymentAndShipping: {
      path: "/paymentandshipping",
      meta: {
        title: "Payment and Shipping",
        isInMenu: true,
        requireAuth: false,
        isGuestOnly: true,
      },
    },

    Profile: {
      path: "/profile",
      meta: {
        title: "Profile",
        isInMenu: true,
        requireAuth: true,
        // order: 2,
        // icon: "user",
      },
    },
    Authentication: {
      path: "/authentication",
      meta: {
        title: "Authentication",
        isInMenu: true,
        requireAuth: false,
        // isGuestOnly: true,
      },
    },

    Login: {
      path: "/login",
      meta: {
        title: "Login",
        isInMenu: false,
        requireAuth: false,
      },
    },
    Registration: {
      path: "/registration",
      meta: {
        title: "Registration",
        isInMenu: false,
        requireAuth: false,
      },
    },

    Orders: {
      path: "/orders",
      meta: {
        title: "My Orders",
        isInMenu: false,
        requireAuth: true,
        order: 3,
        icon: "bag",
      },
    },

    ProductDetail: {
      path: (id: string) => `/products/${id}`,
      template: "/products/:id",
      meta: { title: "Product", isInMenu: false, requireAuth: false },
    },
    OrderDetail: {
      path: (id: string) => `/orders/${id}`,
      template: "/orders/:id",
      meta: { title: "Order", isInMenu: false, requireAuth: true },
    },

    AdminUsers: {
      path: "/admin/users",
      meta: {
        title: "Users",
        isInMenu: true,
        requireAuth: true,
        roles: ["ADMIN"],
        order: 10,
        icon: "users",
      },
    },
    AdminProducts: {
      path: "/admin/products",
      meta: {
        title: "Products",
        isInMenu: true,
        requireAuth: true,
        roles: ["ADMIN"],
        order: 11,
        icon: "box",
      },
    },
    AdminInspiration: {
      path: "/admin/inspiration",
      meta: {
        title: "Create Inspiration",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    CreateProduct: {
      path: "/admin/createProduct",
      meta: {
        title: "Create Product",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },
  },
} as const;

interface IGetMenuItemsParams {
  isAuthenticated: boolean;
  userRole?: UserRole;
}

export function getMenuItems({
  isAuthenticated,
  userRole,
}: IGetMenuItemsParams) {
  return Object.values(FRONT_ROUTES.pages)
    .filter((page) => {
      const { meta } = page;

      if (!meta.isInMenu) return false;
      if (meta.requireAuth && !isAuthenticated) return false;

      if ("roles" in meta && meta.roles) {
        if (!userRole) return false;
        if (!(meta.roles as readonly UserRole[]).includes(userRole))
          return false;
      }

      return true;
    })
    .sort((a, b) => {
      const orderA = "order" in a.meta ? a.meta.order : 999;
      const orderB = "order" in b.meta ? b.meta.order : 999;
      return orderA - orderB;
    })
    .map((page) => ({
      path: typeof page.path === "string" ? page.path : "",
      title: page.meta.title,
      icon: "icon" in page.meta ? page.meta.icon : undefined,
    }));
}
