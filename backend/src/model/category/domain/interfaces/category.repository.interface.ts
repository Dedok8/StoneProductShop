import type { CategoryEntity } from '@/model/category/domain/entities';

export interface ICreateCategoryData {
  name: string;
  slug: string;
}
export interface IUpdateCategoryData {
  name?: string;
  slug?: string;
  isActive?: boolean;
}

export interface ICategoryRepository {
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  findByName(name: string): Promise<CategoryEntity | null>;
  findAll(): Promise<CategoryEntity[]>;
  create(data: ICreateCategoryData): Promise<CategoryEntity>;
  update(id: string, data: IUpdateCategoryData): Promise<CategoryEntity | null>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
