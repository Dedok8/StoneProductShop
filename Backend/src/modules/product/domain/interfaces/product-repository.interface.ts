import type { ProductEntity } from '@modules/product/domain/entities';

export interface IFindManyProductsParams {
  skip?: number;
  take?: number;
  categoryId?: string;
  ownerId?: string;
  isActive?: boolean;
}

export interface ICreateProductData {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock?: number;
  images?: string[];
  categoryId: string;
  ownerId: string;
}

export interface IUpdateProductData {
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  images?: string[];
  categoryId?: string;
  isActive?: boolean;
}

export interface IProductRepository {
  create(data: ICreateProductData): Promise<ProductEntity>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findMany(
    params: IFindManyProductsParams,
  ): Promise<{ items: ProductEntity[]; total: number }>;
  update(id: string, data: IUpdateProductData): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
  decrementStock(id: string, quantity: number): Promise<ProductEntity>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
