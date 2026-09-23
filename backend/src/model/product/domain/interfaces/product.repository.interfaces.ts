import type { ProductEntity } from '@/model/product/domain/entities';
import type { SortOrder } from '@/shared/dto';

export interface IProductImageInput {
  url: string;
  alt?: string;
}
export interface IProductImageData {
  id: string;
  url: string;
  alt: string;
  order: number;
}
export interface IProductQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  categoryId?: string;
  productTypeId?: string;

  originId?: string;
  colorId?: string;
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
  images: IProductImageInput[];
  categoryId: string;
  productTypeId?: string;
  colorId?: string;
  originId?: string;
  ownerId: string;
}

export interface IUpdateProductData {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: IProductImageInput[];
  categoryId?: string;
  productTypeId?: string;
  colorId?: string;
  originId?: string;
  isActive?: boolean;
}

export interface IProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  findByName(name: string): Promise<ProductEntity | null>;
  search(query: string): Promise<ProductEntity[]>;
  findAll(query: IProductQuery): Promise<IProductAllResultData>;
  findByIds(ids: string[]): Promise<ProductEntity[]>;

  create(data: ICreateProductData): Promise<ProductEntity>;
  update(id: string, data: IUpdateProductData): Promise<ProductEntity | null>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_REPOSITORY = Symbol('PRODUCT_REPOSITORY');
