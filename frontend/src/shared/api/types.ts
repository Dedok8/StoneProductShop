// ─── Api ─────────────────────────────────────────────────────────────────────

export interface IApiResponse<T> {
  success: boolean;
  data: T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const ROLES_OPTIONS = [
  { value: ROLES.ADMIN, label: "Admin" },
  { value: ROLES.USER, label: "User" },
];

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface IUpdateUserRequest {
  email?: string;
  password?: string;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface ICategory {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryQuery {
  page?: number;
  limit?: number;
}

export interface ICreateCategoryRequest {
  name: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────────

export interface IProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IProductQuery {
  page?: number;
  limit?: number;
  categoryId?: string;
  ownerId?: string;
  isActive?: boolean;
}

export interface ICreateProductRequest {
  name: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: string;
  images?: string[];
}

export interface IUpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  images?: string[];
}

// ─── Order ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

export interface IOrderItem {
  id: string;
  quantity: number;
  price: number;
  productId: string;
  orderId: string;
}

export interface IOrder {
  id: string;
  status: OrderStatus;
  userId: string;
  items: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
}

export interface ICreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface ICreateOrderRequest {
  items: ICreateOrderItemRequest[];
}

export interface IUpdateOrderStatusRequest {
  status: OrderStatus;
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface IPaginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
