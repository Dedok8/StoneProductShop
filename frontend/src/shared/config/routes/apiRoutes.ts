export const API_ROUTES = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },

  user: {
    getMe: "/users/me",
    updateMe: "/users/me",
    deleteMe: "/users/me",
  },

  adminUser: {
    getAll: "/admin/users",
    byId: (id: string) => `/admin/users/${id}`,
    update: (id: string) => `/admin/users/${id}`,
    delete: (id: string) => `/admin/users/${id}`,
  },

  products: {
    getAll: "/products",
    create: "/products",
    byId: (id: string) => `/products/${id}`,
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`,
  },

  category: {
    getAll: "/category",
    create: "/category",
    byId: (id: string) => `/category/${id}`,
    update: (id: string) => `/category/${id}`,
    delete: (id: string) => `/category/${id}`,
  },

  orders: {
    create: "/orders",
    mine: "/orders/mine",
    all: "/orders/all",
    byId: (id: string) => `/orders/${id}`,
    cancel: (id: string) => `/orders/${id}/cancel`,
    status: (id: string) => `/orders/${id}/status`,
  },
} as const;
