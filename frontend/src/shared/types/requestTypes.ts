// ============================================================================
// StoneProductShop API — TypeScript types
// Generated from OpenAPI spec (/api/docs-json)
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type UserRole = "USER" | "MANAGER" | "ADMIN";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export type SortOrder = "asc" | "desc";

// ---------------------------------------------------------------------------
// Pagination (shared)
// ---------------------------------------------------------------------------

export interface IPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginated<T> {
  items: T[];
  meta: IPaginationMeta;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface IRegisterRequest {
  /** 2–50 chars */
  name: string;
  email: string;
  /** 8–64 chars, must contain lower, upper, and digit */
  password: string;
  confirmPassword: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IAccessTokenResponse {
  user: IUserResponse;
  accessToken: string;
}

// POST /api/v1/auth/refresh — no body (refresh token comes from cookie)
// POST /api/v1/auth/logout — no body, requires bearer auth, 204 No Content

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string; // ISO date-time
}

export interface IUpdateUserRequest {
  /** 2–50 chars */
  name?: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  /** 8–64 chars, must contain lower, upper, and digit */
  newPassword: string;
}

// GET /api/v1/user/me -> UserResponse
// DELETE /api/v1/user/me -> 204 No Content

// ---------------------------------------------------------------------------
// Admin — Users
// ---------------------------------------------------------------------------

export interface IGetUsersQuery {
  sortBy?: "name" | "email" | "createdAt"; // default 'createdAt'
  search?: string;
  sortOrder?: SortOrder; // default 'asc'
  page?: number; // min 1, default 1
  limit?: number; // min 1, max 100, default 20
}

export type PaginatedUsersResponse = IPaginated<IUserResponse>;

export interface ICreateUserRequest {
  /** 2–50 chars */
  name: string;
  email: string;
  /** 8–64 chars */
  password: string;
  role: UserRole;
}

export interface IUpdateUserRoleRequest {
  role: UserRole;
}

// GET /api/v1/admin/user/search?email=... -> UserResponse
// GET /api/v1/admin/user/{id} -> UserResponse
// PATCH /api/v1/admin/user/{id} -> UserResponse (body: UpdateUserRequest)
// DELETE /api/v1/admin/user/{id} -> 204 No Content
// PATCH /api/v1/admin/user/{id}/role -> UserResponse (body: UpdateUserRoleRequest)

// ---------------------------------------------------------------------------
// Category
// ---------------------------------------------------------------------------

export interface ICreateCategoryRequest {
  /** 2–50 chars */
  name: string;
  /** 2–50 chars, kebab-case */
  slug: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
  slug?: string;
  isActive?: boolean;
}

// NOTE: the API spec does not define a response schema for category
// endpoints (Swagger shows an empty body). This shape is inferred from the
// Create/Update DTOs — confirm against an actual response before relying on it.
export interface ICategoryResponse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface ISearchCategoryQuery {
  slug?: string;
  name?: string;
}

// GET /api/v1/category -> CategoryResponse[] (inferred)
// GET /api/v1/category/search -> CategoryResponse[] | CategoryResponse (inferred)
// GET /api/v1/category/{id} -> CategoryResponse (inferred)
// POST /api/v1/category -> 201, no response schema defined (auth required)
// PATCH /api/v1/category/{id} -> 200, no response schema defined (auth required)
// DELETE /api/v1/category/{id} -> 204 No Content (auth required)

// ---------------------------------------------------------------------------
// Product
// ---------------------------------------------------------------------------

export interface IProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  createdAt: string;
  isActive: boolean;
}

export type PaginatedProductResponse = IPaginated<IProductResponse>;

export interface IGetProductsQuery {
  sortBy?: "name" | "price" | "createdAt"; // default 'createdAt'
  categoryId?: string;
  search?: string;
  sortOrder?: SortOrder; // default 'asc'
  page?: number; // min 1, default 1
  limit?: number; // min 1, max 100, default 20
}

export interface ICreateProductRequest {
  /** 2–50 chars */
  name: string;
  /** 2–60 chars, kebab-case */
  slug: string;
  /** 5–200 chars */
  description?: string;
  /** 0.01–1,000,000 */
  price: number;
  /** 0–1,000,000 */
  stock: number;
  /** up to 10 URIs */
  images: string[];
  categoryId: string; // uuid
  ownerId: string; // uuid
}

export interface IUpdateProductRequest {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  categoryId?: string;
  isActive?: boolean;
}

// GET /api/v1/product -> PaginatedProductResponse
// GET /api/v1/product/{id} -> ProductResponse
// POST /api/v1/product -> ProductResponse (auth required)
// PATCH /api/v1/product/{id} -> ProductResponse (auth required)
// DELETE /api/v1/product/{id} -> 204 No Content (auth required)

// ---------------------------------------------------------------------------
// Order
// ---------------------------------------------------------------------------

export interface ICreateOrderItemRequest {
  productId: string; // uuid
  quantity: number; // min 1
}

export interface ICreateOrderRequest {
  items: ICreateOrderItemRequest[]; // min 1 item
}

export interface IOrderItemResponse {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  subTotal: number;
}

export interface IOrderResponse {
  id: string;
  status: OrderStatus;
  userId: string;
  items: IOrderItemResponse[];
  total: number;
  createdAt: string;
  updatedAt: string;
}

// NOTE: the spec types PaginatedOrderResponseDto.items as `object[]`
// (schema not linked to OrderResponse) — using OrderResponse[] here as the
// realistic shape; confirm against an actual response.
export type PaginatedOrderResponse = IPaginated<IOrderResponse>;

export interface IGetOrdersQuery {
  userId?: string; // uuid
  status?: OrderStatus;
  sortOrder?: SortOrder;
  dateFrom?: string; // ISO date-time
  dateTo?: string; // ISO date-time
  page?: number; // min 1, default 1
  limit?: number; // min 1, max 100, default 20
}

export interface IUpdateOrderStatusRequest {
  status: OrderStatus;
}

// POST /api/v1/order -> OrderResponse (auth required)
// GET /api/v1/order -> PaginatedOrderResponse (auth required)
// GET /api/v1/order/my -> PaginatedOrderResponse (auth required)
// GET /api/v1/order/{id} -> OrderResponse (auth required)
// PATCH /api/v1/order/{id}/status -> OrderResponse (auth required)

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

// GET /health -> 200, no response schema defined

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------

export interface ICartItemResponse {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  isStock: boolean;
}

export interface ICartResponse {
  id: string;
  userId: string;
  items: ICartItemResponse[];
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

export interface IAddCartItemRequest {
  productId: string; // uuid
  quantity: number; // min 1
}

// NOTE: the spec defines UpdateCartItemDto with an empty schema (no
// properties listed) — likely a documentation gap on the backend side.
// Given the endpoint's purpose (PATCH /cart/items/{productId}), this is
// almost certainly meant to carry a new quantity. Confirm against actual
// backend behavior before relying on this shape.
export interface IUpdateCartItemRequest {
  quantity?: number;
}

// GET    /api/v1/cart -> CartResponseDto (auth required)
// DELETE /api/v1/cart -> 204 No Content (auth required)
// POST   /api/v1/cart/items -> CartResponseDto (auth required, body: AddCartItemDto)
// PATCH  /api/v1/cart/items/{productId} -> CartResponseDto (auth required, body: UpdateCartItemDto)
// DELETE /api/v1/cart/items/{productId} -> CartResponseDto (auth required)
