import type { ProductEntity } from '@modules/product/domain/entities';

export interface IFindManyProductsParams {
  skip?: number;
  take?: number;
  typeId?: string;
  ownerId?: string;
  isActive?: boolean;
}

export interface ICreateProductDto {
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  stock?: number;
  images?: string[];
  typeId: string;
  ownerId: string;
}

export interface IUpdateProductDto {
  name?: string;
  slug?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  images?: string[];
  typeId?: string;
  isActive?: boolean;
}

export interface IProductRepository {
  create(data: ICreateProductDto): Promise<ProductEntity>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findMany(
    params: IFindManyProductsParams,
  ): Promise<{ items: ProductEntity[]; total: number }>;
  update(id: string, data: IUpdateProductDto): Promise<ProductEntity>;
  delete(id: string): Promise<void>;
  decrementStock(id: string, quantity: number): Promise<ProductEntity>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
