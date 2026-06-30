export const FRONT_ROUTES = {
  pages: {
    Home: {
      path: "/",
      meta: {
        title: "Home",
        isInMenu: true,
        requireAuth: false,
        order: 1,
        icon: "home",
      },
    },
    Login: {
      path: "/login",
      meta: {
        title: "Sign In",
        isInMenu: false,
        requireAuth: false,
        isGuestOnly: true,
      },
    },
    Registration: {
      path: "/registration",
      meta: {
        title: "Sign Up",
        isInMenu: false,
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
        order: 2,
        icon: "user",
      },
    },
    Orders: {
      path: "/orders",
      meta: {
        title: "My Orders",
        isInMenu: true,
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
  },
} as const;
