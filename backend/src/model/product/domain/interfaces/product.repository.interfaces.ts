import type { ProductEntity } from '@/model/product/domain/entities';
import type { SortOrder } from '@/shared/dto';

export interface IProductQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface IProductAllResultData {
  items: ProductEntity[];
  total: number;
}

export interface ICreateProductData {
  name: string;
  slug: string;
  description?: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: string;
  ownerId: string;
}

export interface IUpdateProductData {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  categoryId?: string;
  isActive?: boolean;
}

export interface IProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findByName(name: string): Promise<ProductEntity | null>;
  findAll(query: IProductQuery): Promise<IProductAllResultData>;
  create(data: ICreateProductData): Promise<ProductEntity>;
  update(id: string, data: IUpdateProductData): Promise<ProductEntity | null>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
