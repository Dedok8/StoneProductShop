export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  accessToken: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  price: number;
  categoryId: string;
  ownerId: string;
}

export interface OrderResponse {
  id: string;
  status: string;
  items: OrderItemResponse[];
  total: number;
}

export interface OrderItemResponse {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface UserResponse {
  id: string;
  email: string;
  role: string;
}
