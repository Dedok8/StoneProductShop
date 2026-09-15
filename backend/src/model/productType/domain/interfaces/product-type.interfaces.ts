import type { ProductTypesEntity } from '@/model/productType/domain/entities';

export interface ICreateProductTypeData {
  name: string;
  slug: string;
}

export interface IUpdateProductTypeData {
  name?: string;
  slug?: string;
}

export interface IProductTypeRepository {
  findAll(): Promise<ProductTypesEntity[]>;
  findById(id: string): Promise<ProductTypesEntity | null>;
  findByName(name: string): Promise<ProductTypesEntity | null>;
  findBySlug(slug: string): Promise<ProductTypesEntity | null>;
  create(data: ICreateProductTypeData): Promise<ProductTypesEntity>;
  update(
    id: string,
    data: IUpdateProductTypeData,
  ): Promise<ProductTypesEntity | null>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_TYPE_REPOSITORY = Symbol('PRODUCT_TYPE_REPOSITORY');
