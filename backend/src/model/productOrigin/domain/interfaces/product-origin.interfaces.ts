import type { ProductOriginsEntity } from '@/model/productOrigin/domain/entities';

export interface ICreateProductOriginData {
  name: string;
  slug: string;
}

export interface IUpdateProductOriginData {
  name?: string;
  slug?: string;
}

export interface IProductOriginRepository {
  findAll(): Promise<ProductOriginsEntity[]>;
  findById(id: string): Promise<ProductOriginsEntity | null>;
  findByName(name: string): Promise<ProductOriginsEntity | null>;
  findBySlug(slug: string): Promise<ProductOriginsEntity | null>;
  create(data: ICreateProductOriginData): Promise<ProductOriginsEntity>;
  update(
    id: string,
    data: IUpdateProductOriginData,
  ): Promise<ProductOriginsEntity | null>;
  delete(id: string): Promise<void>;
}

export const PRODUCT_ORIGIN_REPOSITORY = Symbol('PRODUCT_ORIGIN_REPOSITORY');
