import { Injectable } from '@nestjs/common';

import { type Category } from '@/generated/prisma/client';
import { CategoryEntity } from '@/model/category/domain/entities';
import type {
  ICategoryRepository,
  ICreateCategoryData,
  IUpdateCategoryData,
} from '@/model/category/domain/interfaces';
import {
  createAndInvalidate,
  deleteAndInvalidate,
  findOneCached,
  mapToEntity,
  PrismaService,
  RedisCacheService,
} from '@/shared';
import { updateAndInvalidate } from '@/shared/utils/update-and-invalidate.utils';

const LIST_TTL_SEC = 60;
const DETAIL_TTL_SEC = 5 * 60;

const listKey = () => 'category:list';
const idKey = (id: string) => `category:id:${id}`;
const slugKey = (slug: string) => `category:slug:${slug}`;

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: RedisCacheService,
  ) {}

  findById(id: string): Promise<CategoryEntity | null> {
    return findOneCached({
      cache: this.cache,
      key: idKey(id),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.category.findUnique({ where: { id } }),
      entityClass: CategoryEntity,
    });
  }

  findBySlug(slug: string): Promise<CategoryEntity | null> {
    return findOneCached({
      cache: this.cache,
      key: slugKey(slug),
      ttl: DETAIL_TTL_SEC,
      fetch: () => this.prisma.category.findUnique({ where: { slug } }),
      entityClass: CategoryEntity,
    });
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await this.prisma.category.findUnique({ where: { name } });
    return category ? mapToEntity(category, CategoryEntity) : null;
  }

  async findAll(): Promise<CategoryEntity[]> {
    const cached = await this.cache.getJson<Category[]>(listKey());
    if (cached) return cached.map((c) => mapToEntity(c, CategoryEntity));

    const categories = await this.prisma.category.findMany();
    await this.cache.setJson(listKey(), categories, LIST_TTL_SEC);

    return categories.map((c) => mapToEntity(c, CategoryEntity));
  }

  create(data: ICreateCategoryData): Promise<CategoryEntity> {
    return createAndInvalidate({
      createFn: () =>
        this.prisma.category.create({
          data: { name: data.name, slug: data.slug },
        }),
      cache: this.cache,
      invalidateKeys: (category) => [
        idKey(category.id),
        slugKey(category.slug),
        listKey(),
      ],
      entityClass: CategoryEntity,
    });
  }

  update(
    id: string,
    data: IUpdateCategoryData,
  ): Promise<CategoryEntity | null> {
    return updateAndInvalidate({
      updateFn: () => this.prisma.category.update({ where: { id }, data }),
      cache: this.cache,
      invalidateKeys: (category) => [
        idKey(category.id),
        slugKey(category.slug),
        listKey(),
      ],
      entityClass: CategoryEntity,
    });
  }

  delete(id: string): Promise<void> {
    return deleteAndInvalidate({
      deleteFn: () => this.prisma.category.delete({ where: { id } }),
      cache: this.cache,
      invalidateKeys: (category) => [
        idKey(category.id),
        slugKey(category.slug),
        listKey(),
      ],
    });
  }
}
