export const API_ROUTES = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
  },

  user: {
    getMe: "/user/me",
    updateMe: "/user/me",
    deleteMe: "/user/me",
    changePassword: "/user/me/changePassword",
  },

  adminUser: {
    getAll: "/admin/user",
    create: "/admin/user",
    search: "/admin/user/search",
    searchEmail: "/admin/user/search/Email",

    byId: (id: string) => `/admin/user/${id}`,
    update: (id: string) => `/admin/user/${id}`,
    role: (id: string) => `/admin/user/${id}/role`,
    delete: (id: string) => `/admin/user/${id}`,
  },

  product: {
    getAll: "/product",
    create: "/product",
    search: "/product/search",
    searchName: "/product/search/name",
    byId: (id: string) => `/product/${id}`,
    update: (id: string) => `/product/${id}`,
    delete: (id: string) => `/product/${id}`,
  },

  category: {
    getAll: "/category",
    create: "/category",
    search: "/category/search",
    byId: (id: string) => `/category/${id}`,
    update: (id: string) => `/category/${id}`,
    delete: (id: string) => `/category/${id}`,
  },

  order: {
    create: "/order",
    mine: "/order/my",
    all: "/order",
    checkout: "/checkout",
    byId: (id: string) => `/order/${id}`,
    cancel: (id: string) => `/order/${id}/cancel`,
    status: (id: string) => `/order/${id}/status`,
  },

  cart: {
    get: "/cart",
    clear: "/cart",
    addItem: "/cart/items",
    updateItem: (productId: string) => `/cart/items/${productId}`,
    removeItem: (productId: string) => `/cart/items/${productId}`,
    getCartAsAdmin: (userId: string) => `/cart/admin/${userId}`,
  },

  lead: {
    getAll: "/lead",
    create: "/lead",
  },

  inspiration: {
    getAll: "/inspiration",
  },

  inspirationAdmin: {
    getAll: "/admin/inspiration",
    create: "/admin/inspiration",
    findById: (id: string) => `/admin/inspiration/${id}`,
    update: (id: string) => `/admin/inspiration/${id}`,
    delete: (id: string) => `/admin/inspiration/${id}`,
  },

  upload: {
    createUpload: "/admin/upload",
  },
} as const;
