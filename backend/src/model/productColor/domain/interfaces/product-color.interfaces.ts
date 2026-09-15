import type { ProductColorEntity } from '@/model/productColor/domain/entities';

export interface ICreateProductColorData {
  name: string;
  hex?: string;
}

export interface IUpdateProductColorData {
  name?: string;
  hex?: string;
}

export interface IProductColorRepository {
  findAll(): Promise<ProductColorEntity[]>;
  findById(id: string): Promise<ProductColorEntity | null>;
  findByName(name: string): Promise<ProductColorEntity | null>;
  create(data: ICreateProductColorData): Promise<ProductColorEntity>;
  update(
    id: string,
    data: IUpdateProductColorData,
  ): Promise<ProductColorEntity | null>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_COLOR_REPOSITORY = Symbol('PRODUCT_COLOR_REPOSITORY');
