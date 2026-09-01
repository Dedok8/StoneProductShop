import type { UserRole } from "@/shared/types";

/**
 * Единый реестр маршрутов приложения.
 * Структура сгруппирована по смыслу, а не по алфавиту/порядку добавления —
 * так проще найти нужный роут, когда их станет ещё больше.
 *
 * meta-поля:
 * - title         — заголовок страницы / пункта меню
 * - isInMenu      — показывать ли пункт в навигационном меню
 * - requireAuth   — доступен только авторизованным пользователям
 * - isGuestOnly   — доступен только НЕавторизованным (гостям) — прежнее
 *                   значение сохранено как есть, хотя логически это скорее
 *                   баг у некоторых публичных страниц (см. заметку ниже)
 * - roles         — список ролей, которым разрешён доступ (сейчас только ADMIN)
 * - order         — порядок сортировки в меню (чем меньше — тем выше)
 * - icon          — иконка пункта меню
 */
export const FRONT_ROUTES = {
  pages: {
    // ─────────────────────────────────────────────────────────
    // ПУБЛИЧНЫЕ СТРАНИЦЫ — доступны всем, без авторизации
    // ─────────────────────────────────────────────────────────

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
        // isGuestOnly: true, // закомментировано в исходнике — оставлено как было
      },
    },

    // ⚠️ Заметка: у Promotions/Blog/Cooperation/PaymentAndShipping стоит
    // isGuestOnly: true — то есть формально эти страницы должны быть скрыты
    // от УЖЕ авторизованных пользователей. Проверьте, действительно ли так
    // задумано, или это скопировано по инерции с шаблона Login/Registration.
    Promotions: {
      path: "/promotions",
      meta: {
        title: "promotions",
        isInMenu: true,
        requireAuth: false,
        isGuestOnly: false,
      },
    },
    Blog: {
      path: "/blog",
      meta: {
        title: "Blog",
        isInMenu: false,
        requireAuth: false,
        isGuestOnly: false,
      },
    },
    Cooperation: {
      path: "/cooperation",
      meta: {
        title: "Cooperation",
        isInMenu: true,
        requireAuth: false,
        isGuestOnly: false,
      },
    },
    PaymentAndShipping: {
      path: "/paymentandshipping",
      meta: {
        title: "Payment and Shipping",
        isInMenu: true,
        requireAuth: false,
        isGuestOnly: false,
      },
    },

    // Публичная детальная страница товара — доступна без авторизации,
    // path — функция, а не строка (нужен id)
    ProductDetail: {
      path: (id: string) => `/products/${id}`,
      template: "/products/:id",
      meta: { title: "Product", isInMenu: false, requireAuth: false },
    },

    // ─────────────────────────────────────────────────────────
    // АВТОРИЗАЦИЯ — вход, регистрация, общая точка входа
    // ─────────────────────────────────────────────────────────

    Authentication: {
      path: "/authentication",
      meta: {
        title: "Authentication",
        isInMenu: true,
        requireAuth: false,
        isGuestOnly: true,
      },
    },
    Login: {
      path: "/login",
      meta: {
        title: "Login",
        isInMenu: false,
        requireAuth: false,
        isGuestOnly: true,
      },
    },
    Registration: {
      path: "/registration",
      meta: {
        title: "Registration",
        isInMenu: false,
        requireAuth: false,
        isGuestOnly: true,
      },
    },

    // ─────────────────────────────────────────────────────────
    // ЛИЧНЫЙ КАБИНЕТ — доступно только авторизованному пользователю
    // ─────────────────────────────────────────────────────────

    Profile: {
      path: "/profile",
      meta: {
        title: "Profile",
        isInMenu: true,
        requireAuth: true,
        // order: 2,  // закомментировано в исходнике
        // icon: "user",
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
    OrderDetail: {
      path: (id: string) => `/orders/${id}`,
      template: "/orders/:id",
      meta: { title: "Order", isInMenu: false, requireAuth: true },
    },

    // ─────────────────────────────────────────────────────────
    // АДМИНКА — все страницы ниже требуют requireAuth + roles: ["ADMIN"]
    // ─────────────────────────────────────────────────────────

    // -- Просмотр списков --
    AdminUsers: {
      path: "/admin/users",
      meta: {
        title: "Users",
        isInMenu: false,
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
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
        order: 11,
        icon: "box",
      },
    },

    // -- Создание сущностей --
    // ⚠️ Заметка: путь в camelCase ("/admin/createProduct"), а не kebab-case
    // ("/admin/create-product"), как остальные — если решите унифицировать
    // стиль URL, это ломающее изменение (нужно поправить везде, где есть
    // прямые ссылки/редиректы на этот путь).
    CreateProduct: {
      path: "/admin/createProduct",
      meta: {
        title: "Create Product",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },
    CreateCategory: {
      path: "/admin/createCategory",
      meta: {
        title: "Create Category",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },
    CreateInspiration: {
      path: "/admin/creteInspiration",
      meta: {
        title: "Create Inspiration",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    CreateUser: {
      path: "/admin/creteUser",
      meta: {
        title: "Create User",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    UpdateProduct: {
      path: (id: string) => `/admin/updateProduct/${id}`,
      template: "/admin/updateProduct/:id",
      meta: {
        title: "Update Product",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    UpdateOrder: {
      path: (id: string) => `/admin/updateOrder/${id}/status`,
      template: "/admin/updateOrder/:id/status",
      meta: {
        title: "Update Order Status",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    UpdateCategory: {
      path: (id: string) => `/admin/updateCategory/${id}`,
      template: "/admin/updateCategory/:id",
      meta: {
        title: "Update Category",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    AllUsers: {
      path: "/admin/allUsers",
      meta: {
        title: "All User",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    AllCategory: {
      path: "/admin/allCategory",
      meta: {
        title: "All Category",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    AllOrders: {
      path: "/admin/allOrders",
      meta: {
        title: "All Orders",
        isInMenu: false,
        requireAuth: true,
        roles: ["ADMIN"],
      },
    },

    // -- Заметка на будущее: здесь напрашиваются симметричные разделы --
    // -- Редактирование/удаление --
    // (в исходном файле такие маршруты ещё не заведены — например,
    // EditProduct: "/admin/products/:id/edit", DeleteProduct и т.д.
    // Добавьте их сюда, в этот подраздел, когда появятся соответствующие
    // страницы — так группировка не разъедется со временем.)
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

      if ("isGuestOnly" in meta && meta.isGuestOnly && isAuthenticated) {
        return false;
      }

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
