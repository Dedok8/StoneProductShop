import type { CategoryEntity } from '@modules/category/domain/entities';

export interface IFindManyCategoryParams {
  skip?: number;
  take?: number;
  parentId?: string;
  isActive?: boolean;
}

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
  create(data: ICreateCategoryData): Promise<CategoryEntity>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  findMany(
    params: IFindManyCategoryParams,
  ): Promise<{ items: CategoryEntity[]; total: number }>;
  update(id: string, data: IUpdateCategoryData): Promise<CategoryEntity>;
  delete(id: string): Promise<void>;
}

export const CATEGORY_REPOSITORY = Symbol('CATEGORY_REPOSITORY');
